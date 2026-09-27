#!/usr/bin/env bash
# Deploy the eShopping platform from the kustomize manifests in this directory.
#
# Usage: ./deploy-all.sh [options]
#   --overlay <name>     overlays/<name> to apply: local (default) | ci
#   --with-istio         also enable Istio sidecar injection and apply deploy/istio
#                        (requires `istioctl` on PATH; installs the demo profile
#                        if Istio is not present yet). Only with --overlay local.
#   --with-monitoring    also apply addons/monitoring (Prometheus + Grafana)
#   --with-management    also apply addons/management (pgAdmin + Portainer)
#   --timeout <dur>      per-workload rollout timeout (default 600s)
#   --no-wait            apply only, do not wait for rollouts
#   -h | --help
#
# Images: the manifests reference eshop/<service>:latest with
# imagePullPolicy IfNotPresent. Build them and load them into your cluster
# first (see deploy/README.md), e.g. `kind load docker-image eshop/catalog.api:latest`.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
NAMESPACE=ecommerce
OVERLAY=local
WITH_ISTIO=false
WITH_MONITORING=false
WITH_MANAGEMENT=false
TIMEOUT=600s
WAIT=true

usage() { sed -n '2,19p' "$0" | sed 's/^# \{0,1\}//'; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --overlay) OVERLAY="$2"; shift 2 ;;
    --with-istio) WITH_ISTIO=true; shift ;;
    --with-monitoring) WITH_MONITORING=true; shift ;;
    --with-management) WITH_MANAGEMENT=true; shift ;;
    --timeout) TIMEOUT="$2"; shift 2 ;;
    --no-wait) WAIT=false; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

log() { printf '\n==> %s\n' "$*"; }

command -v kubectl >/dev/null || { echo "kubectl not found on PATH" >&2; exit 1; }
kubectl cluster-info >/dev/null || { echo "Cannot reach the Kubernetes cluster (check your kubeconfig context)" >&2; exit 1; }

target="overlays/${OVERLAY}"
if [[ "${WITH_ISTIO}" == "true" ]]; then
  [[ "${OVERLAY}" == "local" ]] || { echo "--with-istio is only supported with --overlay local" >&2; exit 2; }
  target="overlays/local-istio"
fi
[[ -f "${SCRIPT_DIR}/${target}/kustomization.yaml" ]] || { echo "No such overlay: ${target}" >&2; exit 2; }

if [[ "${WITH_ISTIO}" == "true" ]]; then
  command -v istioctl >/dev/null || { echo "--with-istio needs istioctl on PATH (https://istio.io/latest/docs/setup/getting-started/)" >&2; exit 1; }
  if ! kubectl get deployment istiod -n istio-system >/dev/null 2>&1; then
    log "Installing Istio (demo profile)"
    istioctl install --set profile=demo -y
  fi
fi

log "Applying ${target}"
kubectl apply -k "${SCRIPT_DIR}/${target}"

if [[ "${WITH_ISTIO}" == "true" ]]; then
  log "Applying Istio gateway, routes and tracing (deploy/istio)"
  kubectl apply -f "${REPO_ROOT}/deploy/istio/gateway.yaml" \
                -f "${REPO_ROOT}/deploy/istio/virtualservices.yaml" \
                -f "${REPO_ROOT}/deploy/istio/telemetry-tracing.yaml"
fi
if [[ "${WITH_MONITORING}" == "true" ]]; then
  log "Applying addons/monitoring"
  kubectl apply -k "${SCRIPT_DIR}/addons/monitoring"
  if [[ "${WITH_ISTIO}" == "true" ]]; then
    kubectl apply -f "${REPO_ROOT}/deploy/istio/monitoring-virtualservices.yaml"
  fi
fi
if [[ "${WITH_MANAGEMENT}" == "true" ]]; then
  log "Applying addons/management"
  kubectl apply -k "${SCRIPT_DIR}/addons/management"
fi

if [[ "${WAIT}" == "true" ]]; then
  # Data stores first, then the APIs, then the gateway: mirrors start-up order.
  log "Waiting for rollouts (timeout ${TIMEOUT} each)"
  wait_all() {
    local ns="$1" kind="$2" selector="$3" names
    names=$(kubectl get "${kind}" -n "${ns}" -l "${selector}" -o name)
    for obj in ${names}; do
      echo "  ${obj}"
      kubectl rollout status "${obj}" -n "${ns}" --timeout="${TIMEOUT}"
    done
  }
  for component in database messaging storage logging api gateway; do
    wait_all "${NAMESPACE}" statefulset "app.kubernetes.io/component=${component}"
    wait_all "${NAMESPACE}" deployment "app.kubernetes.io/component=${component}"
  done
  if [[ "${WITH_MONITORING}" == "true" ]]; then
    wait_all monitoring statefulset "app.kubernetes.io/part-of=eshopping-monitoring"
  fi
  if [[ "${WITH_MANAGEMENT}" == "true" ]]; then
    wait_all "${NAMESPACE}" statefulset "app.kubernetes.io/part-of=eshopping-management"
  fi
fi

log "Deployed. Pods in ${NAMESPACE}:"
kubectl get pods -n "${NAMESPACE}" -o wide

cat <<EOF

Access (port-forward all with ./port-forward.sh):
  API gateway   kubectl -n ${NAMESPACE} port-forward svc/eshopping-ocelotapigw 8010:80
  RabbitMQ UI   kubectl -n ${NAMESPACE} port-forward svc/eshopping-rabbitmq 15672:15672
  Kibana        kubectl -n ${NAMESPACE} port-forward svc/eshopping-kibana 5601:5601   (local overlay)
  With ingress-nginx installed: http://api.localhost, http://rabbitmq.localhost, http://kibana.localhost
Validate:       ./validate-deployment.sh
EOF
