#!/usr/bin/env bash
# Verify a running eShopping deployment. Exits non-zero on the first class of
# failure it finds, so it can gate CI (.github/workflows/k8s-deployment-test.yml).
#
# Checks:
#   1. every Deployment/StatefulSet in the namespace is fully rolled out
#   2. every Service has at least one ready endpoint
#   3. from a throw-away pod in another namespace (i.e. the way external
#      traffic arrives, through the network policies):
#        - the gateway answers GET /             ("Hello Ocelot")
#        - the gateway routes to Catalog         (GET /Catalog/GetAllBrands)
#
# Usage: ./validate-deployment.sh [--namespace ecommerce] [--timeout 300s]
set -euo pipefail

NAMESPACE=ecommerce
TIMEOUT=300s
while [[ $# -gt 0 ]]; do
  case "$1" in
    --namespace|-n) NAMESPACE="$2"; shift 2 ;;
    --timeout) TIMEOUT="$2"; shift 2 ;;
    -h|--help) sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

fail() { echo "FAIL: $*" >&2; exit 1; }
pass() { echo "ok:   $*"; }

command -v kubectl >/dev/null || fail "kubectl not found on PATH"
kubectl get namespace "${NAMESPACE}" >/dev/null || fail "namespace ${NAMESPACE} does not exist"

echo "== 1. Workload rollouts"
for obj in $(kubectl get deployment,statefulset -n "${NAMESPACE}" -o name); do
  kubectl rollout status "${obj}" -n "${NAMESPACE}" --timeout="${TIMEOUT}" >/dev/null \
    || fail "${obj} did not become ready within ${TIMEOUT}"
  pass "${obj}"
done

echo "== 2. Service endpoints"
for svc in $(kubectl get svc -n "${NAMESPACE}" -o jsonpath='{.items[*].metadata.name}'); do
  ready=$(kubectl get endpointslices -n "${NAMESPACE}" -l "kubernetes.io/service-name=${svc}" \
    -o jsonpath='{range .items[*].endpoints[?(@.conditions.ready==true)]}{.addresses[0]}{"\n"}{end}' | grep -c . || true)
  [[ "${ready}" -gt 0 ]] || fail "service ${svc} has no ready endpoints"
  pass "svc/${svc} (${ready} ready endpoint(s))"
done

echo "== 3. End-to-end through the API gateway"
GW="http://eshopping-ocelotapigw.${NAMESPACE}.svc.cluster.local"
probe_ns=default
pod="eshopping-smoke-$(date +%s)"
# shellcheck disable=SC2016
script='
set -e
body=$(curl -fsS --max-time 10 --retry 5 --retry-delay 3 --retry-all-errors "$GW/")
echo "GET / -> $body"
echo "$body" | grep -q "Hello Ocelot"
code=$(curl -sS -o /tmp/brands.json -w "%{http_code}" --max-time 20 --retry 5 --retry-delay 5 --retry-all-errors "$GW/Catalog/GetAllBrands")
echo "GET /Catalog/GetAllBrands -> HTTP $code: $(head -c 300 /tmp/brands.json)"
test "$code" = "200"
'
if ! kubectl run "${pod}" -n "${probe_ns}" --rm -i --restart=Never --quiet \
      --image=curlimages/curl:8.10.1 --env="GW=${GW}" --command -- sh -c "${script}"; then
  fail "gateway smoke test failed"
fi
pass "gateway routes requests to the Catalog API"

echo "All checks passed."
