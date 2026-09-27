#!/usr/bin/env bash
# Remove everything deploy-all.sh created.
#
# Usage: ./cleanup-all.sh [--overlay local|ci] [--yes]
#   --overlay <name>  overlay that was deployed (default: local; use the same
#                     one you passed to deploy-all.sh)
#   --yes             do not ask for confirmation (CI)
#
# WARNING: deleting the `ecommerce` namespace also deletes the StatefulSets'
# PersistentVolumeClaims, i.e. ALL database data.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
OVERLAY=local
ASSUME_YES=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --overlay) OVERLAY="$2"; shift 2 ;;
    --yes|-y) ASSUME_YES=true; shift ;;
    -h|--help) sed -n '2,11p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

command -v kubectl >/dev/null || { echo "kubectl not found on PATH" >&2; exit 1; }

if [[ "${ASSUME_YES}" != "true" ]]; then
  read -r -p "Delete the eShopping platform (namespaces ecommerce + monitoring, including all data)? [y/N] " reply
  [[ "${reply}" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }
fi

echo "==> Removing Istio routing objects (if present)"
kubectl delete --ignore-not-found \
  -f "${REPO_ROOT}/deploy/istio/monitoring-virtualservices.yaml" \
  -f "${REPO_ROOT}/deploy/istio/virtualservices.yaml" \
  -f "${REPO_ROOT}/deploy/istio/gateway.yaml" 2>/dev/null || true  # CRDs absent when Istio is not installed

echo "==> Removing addons"
kubectl delete -k "${SCRIPT_DIR}/addons/management" --ignore-not-found
kubectl delete -k "${SCRIPT_DIR}/addons/monitoring" --ignore-not-found

echo "==> Removing overlays/${OVERLAY} (includes the ecommerce namespace)"
kubectl delete -k "${SCRIPT_DIR}/overlays/${OVERLAY}" --ignore-not-found --wait=true

echo "==> Done. Remaining objects labelled app.kubernetes.io/part-of=eshopping:"
kubectl get all -A -l app.kubernetes.io/part-of=eshopping 2>/dev/null || true
