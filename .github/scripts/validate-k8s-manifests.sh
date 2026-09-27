#!/usr/bin/env bash
# Offline validation of everything under deploy/ that Kubernetes will consume.
# Fails (non-zero exit) on the first category that has errors; every check is
# real - nothing is downgraded to a warning.
#
#   1. yamllint           deploy/k8s, deploy/istio (config: .yamllint.yml)
#   2. kustomize render   every kustomization (base, overlays, addons)
#   3. kubeconform        strict schema validation of the rendered manifests
#                         and of deploy/istio (Istio CRDs from the CRDs catalog)
#   4. helm               `helm lint` + `helm template | kubeconform` per chart
#   5. drift              deploy/k8s/base/gateway/ocelot.k8s.json must equal
#                         src/ApiGateways/Ocelot.ApiGateway/ocelot.k8s.json
#
# Requirements: kubectl (for `kubectl kustomize`), helm, kubeconform, yamllint.
# Usage: .github/scripts/validate-k8s-manifests.sh   (from any directory)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${REPO_ROOT}"

K8S_VERSION="${K8S_VERSION:-1.30.0}"
# Istio (and other CRD) schemas; core types come from the default location.
CRD_SCHEMAS='https://raw.githubusercontent.com/datreeio/CRDs-catalog/main/{{.Group}}/{{.ResourceKind}}_{{.ResourceAPIVersion}}.json'
KUBECONFORM=(kubeconform -strict -summary -output text -kubernetes-version "${K8S_VERSION}"
  -schema-location default -schema-location "${CRD_SCHEMAS}")

WORK="$(mktemp -d)"
trap 'rm -rf "${WORK}"' EXIT
failures=0

section() { printf '\n=== %s\n' "$*"; }
fail() { echo "ERROR: $*" >&2; failures=$((failures + 1)); }

for tool in kubectl helm kubeconform yamllint; do
  command -v "${tool}" >/dev/null || { echo "ERROR: ${tool} is required but not installed" >&2; exit 1; }
done

section "1. yamllint"
yamllint -c .yamllint.yml deploy/k8s deploy/istio/gateway.yaml deploy/istio/virtualservices.yaml \
  deploy/istio/monitoring-virtualservices.yaml || fail "yamllint reported errors"

section "2+3. kustomize render + kubeconform"
kustomizations="$(find deploy/k8s -name kustomization.yaml -not -path '*/components/*' -exec dirname {} \; | sort)"
[[ -n "${kustomizations}" ]] || fail "no kustomizations found under deploy/k8s"
for dir in ${kustomizations}; do
  out="${WORK}/$(echo "${dir}" | tr / _).yaml"
  if kubectl kustomize "${dir}" > "${out}"; then
    echo "--- ${dir}"
    "${KUBECONFORM[@]}" "${out}" || fail "kubeconform: ${dir}"
  else
    fail "kustomize build failed: ${dir}"
  fi
done

echo "--- deploy/istio (routing objects)"
"${KUBECONFORM[@]}" deploy/istio/gateway.yaml deploy/istio/virtualservices.yaml \
  deploy/istio/monitoring-virtualservices.yaml || fail "kubeconform: deploy/istio"

section "4. helm lint + template"
for chart in deploy/helm/*/; do
  chart="${chart%/}"
  [[ -f "${chart}/Chart.yaml" ]] || continue
  echo "--- ${chart}"
  helm lint --strict "${chart}" >/dev/null || { helm lint --strict "${chart}" || true; fail "helm lint: ${chart}"; continue; }
  # Render with the default values and with every values-*.yaml / local-values.yaml overlay.
  for values in "" $(find "${chart}" -maxdepth 1 \( -name 'values-*.yaml' -o -name 'local-values.yaml' \) | sort); do
    rendered="${WORK}/helm-$(basename "${chart}")-$(basename "${values:-default}").yaml"
    if helm template "eshopping-$(basename "${chart}")" "${chart}" ${values:+-f "${values}"} > "${rendered}"; then
      "${KUBECONFORM[@]}" "${rendered}" || fail "kubeconform: ${chart} ${values:-(default values)}"
    else
      fail "helm template: ${chart} ${values:-(default values)}"
    fi
  done
done

section "5. gateway routing drift"
if ! diff -u src/ApiGateways/Ocelot.ApiGateway/ocelot.k8s.json deploy/k8s/base/gateway/ocelot.k8s.json; then
  fail "deploy/k8s/base/gateway/ocelot.k8s.json differs from src/ApiGateways/Ocelot.ApiGateway/ocelot.k8s.json (copy the src/ file)"
fi

echo
if [[ ${failures} -gt 0 ]]; then
  echo "FAILED: ${failures} check(s) failed" >&2
  exit 1
fi
echo "All manifest validations passed."
