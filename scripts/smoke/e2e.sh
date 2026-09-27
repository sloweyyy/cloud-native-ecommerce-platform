#!/usr/bin/env bash
# End-to-end smoke test through the Ocelot API gateway.
#
# Prerequisites: the compose stack is up, e.g.
#   cp .env.example .env            # once; compose needs the DB/RabbitMQ credentials
#   docker compose up -d --build
#
# Flow: wait for gateway + Catalog -> list products -> get one product -> create a
# basket (preferring a product with a seeded coupon) -> get basket -> checkout ->
# poll Ordering until the order shows up. Also checks a few error contracts
# (404 for unknown product, empty basket for a new user, 400 for invalid checkout).
#
# Env:
#   GATEWAY_URL   gateway base URL            (default http://localhost:8010)
#   WAIT_TIMEOUT  seconds to wait for startup (default 300)
#   ORDER_TIMEOUT seconds to wait for order   (default 90)
#   COUPON_PRODUCT product name with a seeded Discount coupon
#                 (default "ASUS ZenBook 13 OLED Ultrabook")
#
# Exits non-zero with the failing step, HTTP status and response body.
set -euo pipefail

GATEWAY_URL="${GATEWAY_URL:-http://localhost:8010}"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-300}"
ORDER_TIMEOUT="${ORDER_TIMEOUT:-90}"
COUPON_PRODUCT="${COUPON_PRODUCT:-ASUS ZenBook 13 OLED Ultrabook}"
USER_NAME="smoke-$(date +%s)-$$"

command -v curl >/dev/null || { echo "curl is required" >&2; exit 2; }
command -v python3 >/dev/null || { echo "python3 is required" >&2; exit 2; }

BODY_FILE="$(mktemp)"
trap 'rm -f "$BODY_FILE"' EXIT

STEP=""
HTTP_CODE=""

step() { STEP="$1"; echo "==> $STEP"; }
ok() { echo "    OK: $*"; }
warn() { echo "    WARN: $*" >&2; }
fail() {
  echo "" >&2
  echo "SMOKE TEST FAILED at step: $STEP" >&2
  echo "  reason: $*" >&2
  [[ -n "$HTTP_CODE" ]] && echo "  last HTTP status: $HTTP_CODE" >&2
  if [[ -s "$BODY_FILE" ]]; then
    echo "  last response body:" >&2
    head -c 2000 "$BODY_FILE" | sed 's/^/    /' >&2
    echo "" >&2
  fi
  exit 1
}

# request METHOD PATH [JSON_BODY] -> sets HTTP_CODE, body in $BODY_FILE
request() {
  local method="$1" path="$2" data="${3:-}"
  local args=(-sS -o "$BODY_FILE" -w '%{http_code}' -X "$method" --max-time 30
    -H 'Accept: application/json')
  [[ -n "$data" ]] && args+=(-H 'Content-Type: application/json' --data "$data")
  : >"$BODY_FILE"
  # curl prints 000 for connection errors; don't let set -e abort on them.
  HTTP_CODE="$(curl "${args[@]}" "$GATEWAY_URL$path" 2>/dev/null || true)"
  HTTP_CODE="${HTTP_CODE:-000}"
}

# request_retry_429 METHOD PATH [DATA]: like request, but backs off while the
# gateway's rate limiter answers 429 (e.g. /Basket/Checkout allows 1 call per 3s).
request_retry_429() {
  local attempt
  for attempt in 1 2 3 4 5; do
    request "$@"
    [[ "$HTTP_CODE" == "429" ]] || return 0
    sleep 3
  done
}

expect_status() {
  local expected="$1"
  [[ "$HTTP_CODE" == "$expected" ]] || fail "expected HTTP $expected, got $HTTP_CODE"
}

# json EXPR -> evaluates a python expression against the parsed body bound to `d`
json() {
  python3 -c "import json,sys; d=json.load(open(sys.argv[1])); r=($1); print('' if r is None else (json.dumps(r) if isinstance(r,(dict,list)) else r))" "$BODY_FILE"
}

wait_for() {
  local path="$1" deadline=$((SECONDS + WAIT_TIMEOUT))
  until request GET "$path" && [[ "$HTTP_CODE" == "200" ]]; do
    (( SECONDS < deadline )) || fail "timed out after ${WAIT_TIMEOUT}s waiting for GET $path"
    sleep 5
  done
}

step "Wait for gateway at $GATEWAY_URL"
wait_for "/"
ok "gateway is up"

step "Wait for Catalog via gateway"
wait_for "/Catalog/GetAllProducts?pageIndex=1&pageSize=5"
ok "Catalog is reachable"

step "List products"
request GET "/Catalog/GetAllProducts?pageIndex=1&pageSize=70"
expect_status 200
COUNT="$(json "d['count']")"
[[ "$COUNT" -gt 0 ]] || fail "catalog returned no products (seeding failed?)"
PRODUCT_ID="$(json "next((p['id'] for p in d['data'] if p['name'] == '''$COUPON_PRODUCT'''), d['data'][0]['id'])")"
ok "$COUNT products; using product $PRODUCT_ID"

step "Paging is clamped (pageIndex=0, pageSize=0)"
request GET "/Catalog/GetAllProducts?pageIndex=0&pageSize=0"
expect_status 200
[[ "$(json "len(d['data'])")" == "1" ]] || fail "pageSize=0 should be clamped to 1 item"
ok "clamped to page 1 / size 1"

step "Get product by id"
request GET "/Catalog/GetProductById/$PRODUCT_ID"
expect_status 200
PRODUCT_NAME="$(json "d['name']")"
PRODUCT_PRICE="$(json "d['price']")"
PRODUCT_IMAGE="$(json "d.get('imageFile') or ''")"
ok "$PRODUCT_NAME @ $PRODUCT_PRICE"

step "Unknown / malformed product id returns 404"
request GET "/Catalog/GetProductById/000000000000000000000000"
expect_status 404
request GET "/Catalog/GetProductById/not-an-object-id"
expect_status 404
ok "404 problem details"

step "New user's basket is empty (not 500)"
request GET "/Basket/GetBasket/$USER_NAME"
expect_status 200
[[ "$(json "len(d['items'])")" == "0" ]] || fail "expected an empty basket"
ok "empty basket"

step "Create basket"
BASKET_JSON="$(python3 -c '
import json,sys
print(json.dumps({"userName": sys.argv[1], "items": [{
  "quantity": 2, "price": float(sys.argv[2]), "productId": sys.argv[3],
  "imageFile": sys.argv[4], "productName": sys.argv[5]}]}))
' "$USER_NAME" "$PRODUCT_PRICE" "$PRODUCT_ID" "$PRODUCT_IMAGE" "$PRODUCT_NAME")"
request POST "/Basket/CreateBasket" "$BASKET_JSON"
expect_status 200
DISCOUNT="$(json "d['items'][0]['discountAmount']")"
TOTAL="$(json "d['totalPrice']")"
if [[ "$PRODUCT_NAME" == "$COUPON_PRODUCT" ]] && python3 -c "import sys; sys.exit(0 if float(sys.argv[1]) > 0 else 1)" "$DISCOUNT"; then
  ok "basket total $TOTAL (coupon applied: -$DISCOUNT per item)"
elif [[ "$PRODUCT_NAME" == "$COUPON_PRODUCT" ]]; then
  warn "no discount applied for '$COUPON_PRODUCT' (Discount service down or coupon not seeded); basket still created, total $TOTAL"
else
  ok "basket total $TOTAL (no coupon product in catalog)"
fi

step "Get basket"
request GET "/Basket/GetBasket/$USER_NAME"
expect_status 200
[[ "$(json "len(d['items'])")" == "1" ]] || fail "expected 1 basket item"
ok "basket has 1 item"

checkout_json() {
  python3 -c '
import json,sys
print(json.dumps({"userName": sys.argv[1], "totalPrice": 0,
  "firstName": "Smoke", "lastName": "Test", "emailAddress": sys.argv[2],
  "addressLine": "1 Test Street", "country": "VN", "state": "HCM", "zipCode": "700000",
  "cardName": "Smoke Test", "cardNumber": "4111111111111111", "expiration": "12/30",
  "cvv": "123", "paymentMethod": 1}))
' "$USER_NAME" "$1"
}

step "Invalid checkout is rejected with 400 and keeps the basket"
request_retry_429 POST "/Basket/Checkout" "$(checkout_json "not-an-email")"
expect_status 400
[[ -n "$(json "(d.get('errors') or {}).get('EmailAddress') or (d.get('errors') or {}).get('emailAddress')")" ]] || fail "expected an EmailAddress validation error"
request GET "/Basket/GetBasket/$USER_NAME"
[[ "$(json "len(d['items'])")" == "1" ]] || fail "invalid checkout must not delete the basket"
ok "400 with errors.EmailAddress; basket intact"

step "Checkout"
request_retry_429 POST "/Basket/Checkout" "$(checkout_json "smoke@example.com")"
expect_status 202
ok "checkout accepted"

step "Basket is removed after checkout"
request GET "/Basket/GetBasket/$USER_NAME"
expect_status 200
[[ "$(json "len(d['items'])")" == "0" ]] || fail "basket should be empty after checkout"
ok "basket emptied"

step "Wait for order in Ordering (up to ${ORDER_TIMEOUT}s)"
deadline=$((SECONDS + ORDER_TIMEOUT))
while :; do
  request GET "/Order/$USER_NAME"
  if [[ "$HTTP_CODE" == "200" && "$(json "len(d)")" -ge 1 ]]; then break; fi
  (( SECONDS < deadline )) || fail "order for $USER_NAME not found after ${ORDER_TIMEOUT}s (check ordering.api logs: consumer/DB)"
  sleep 3
done
ORDER_TOTAL="$(json "d[0]['totalPrice']")"
[[ "$(json "d[0]['emailAddress']")" == "smoke@example.com" ]] || fail "order has unexpected email"
python3 -c "import sys; sys.exit(0 if abs(float(sys.argv[1]) - float(sys.argv[2])) < 0.01 else 1)" "$ORDER_TOTAL" "$TOTAL" \
  || fail "order total $ORDER_TOTAL does not match basket total $TOTAL"
ok "order created for $USER_NAME, total $ORDER_TOTAL"

echo ""
echo "SMOKE TEST PASSED ($USER_NAME)"
