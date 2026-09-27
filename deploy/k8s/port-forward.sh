#!/usr/bin/env bash
# Port-forward every deployed eShopping service to localhost. Services that are
# not deployed (e.g. Kibana in the ci overlay, or the addons) are skipped.
# Ctrl+C stops all forwards.
set -uo pipefail

command -v kubectl >/dev/null || { echo "kubectl not found on PATH" >&2; exit 1; }

# namespace  service                            local  remote
FORWARDS=(
  "ecommerce  eshopping-ocelotapigw             8010   80"
  "ecommerce  eshopping-catalog                 8000   80"
  "ecommerce  eshopping-basket                  8001   80"
  "ecommerce  eshopping-discount-discount-grpc  8002   8080"
  "ecommerce  eshopping-ordering                8003   80"
  "ecommerce  eshopping-rabbitmq                15672  15672"
  "ecommerce  eshopping-kibana                  5601   5601"
  "ecommerce  eshopping-localstack              4566   4566"
  "ecommerce  pgadmin                           5050   80"
  "ecommerce  portainer                         9000   9000"
  "monitoring grafana                           3000   3000"
  "monitoring prometheus                        9090   9090"
)

pids=()
cleanup() { [[ ${#pids[@]} -gt 0 ]] && kill "${pids[@]}" 2>/dev/null; exit 0; }
trap cleanup INT TERM

for entry in "${FORWARDS[@]}"; do
  read -r ns svc lport rport <<<"${entry}"
  if kubectl get svc "${svc}" -n "${ns}" >/dev/null 2>&1; then
    kubectl port-forward -n "${ns}" "svc/${svc}" "${lport}:${rport}" >/dev/null 2>&1 &
    pids+=("$!")
    printf '  %-34s http://localhost:%s\n' "${ns}/${svc}" "${lport}"
  fi
done

[[ ${#pids[@]} -gt 0 ]] || { echo "No eShopping services found - deploy first (./deploy-all.sh)." >&2; exit 1; }
echo "Forwarding ${#pids[@]} services. Press Ctrl+C to stop."
wait
