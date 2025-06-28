#!/bin/bash

# Script to fix Kiali-Prometheus connection
# This ensures Kiali can connect to Prometheus in the monitoring namespace

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔧 Fixing Kiali-Prometheus Connection..."

# Check if Kiali is deployed
if ! kubectl get deployment kiali -n istio-system > /dev/null 2>&1; then
    log_error "Kiali deployment not found in istio-system namespace"
    exit 1
fi

# Check if Prometheus is accessible
log_info "Checking Prometheus connectivity..."
if ! kubectl run test-prometheus-connectivity --image=curlimages/curl --rm -i --restart=Never -- curl -s --max-time 10 "http://prometheus-server.monitoring.svc.cluster.local:80/api/v1/query?query=up" > /dev/null 2>&1; then
    log_error "Prometheus is not accessible at prometheus-server.monitoring.svc.cluster.local:80"
    exit 1
fi
log_success "Prometheus is accessible"

# Update Kiali configuration
log_info "Updating Kiali configuration..."
kubectl patch configmap kiali -n istio-system --type merge -p '{
  "data": {
    "config.yaml": "auth:\n  openid: {}\n  openshift:\n    client_id_prefix: kiali\n  strategy: anonymous\ndeployment:\n  accessible_namespaces:\n  - \"**\"\n  additional_service_yaml: {}\n  affinity:\n    node: {}\n    pod: {}\n    pod_anti: {}\n  configmap_annotations: {}\n  custom_secrets: []\n  host_aliases: []\n  hpa:\n    api_version: autoscaling/v2beta2\n    spec: {}\n  image_digest: \"\"\n  image_name: quay.io/kiali/kiali\n  image_pull_policy: Always\n  image_pull_secrets: []\n  image_version: v1.76\n  ingress:\n    additional_labels: {}\n    class_name: nginx\n    override_yaml:\n      metadata: {}\n  ingress_enabled: false\n  instance_name: kiali\n  logger:\n    log_format: text\n    log_level: info\n    sampler_rate: \"1\"\n    time_field_format: 2006-01-02T15:04:05Z07:00\n  namespace: istio-system\n  node_selector: {}\n  pod_annotations: {}\n  pod_labels:\n    sidecar.istio.io/inject: \"false\"\n  priority_class_name: \"\"\n  replicas: 1\n  resources:\n    limits:\n      memory: 1Gi\n    requests:\n      cpu: 10m\n      memory: 64Mi\n  secret_name: kiali\n  security_context: {}\n  service_annotations: {}\n  service_type: \"\"\n  tolerations: []\n  version_label: v1.76.0\n  view_only_mode: false\nexternal_services:\n  custom_dashboards:\n    enabled: true\n  istio:\n    root_namespace: istio-system\n  prometheus:\n    url: \"http://prometheus-server.monitoring.svc.cluster.local:80\"\nidentity:\n  cert_file: \"\"\n  private_key_file: \"\"\nistio_namespace: istio-system\nkiali_feature_flags:\n  certificates_information_indicators:\n    enabled: true\n    secrets:\n    - cacerts\n    - istio-ca-secret\n  clustering:\n    autodetect_secrets:\n      enabled: true\n      label: kiali.io/multiCluster=true\n    clusters: []\n  disabled_features: []\n  validations:\n    ignore:\n    - KIA1301\nlogin_token:\n  signing_key: CHANGEME00000000\nserver:\n  metrics_enabled: true\n  metrics_port: 9090\n  port: 20001\n  web_root: /kiali\n"
  }
}'

log_success "Kiali configuration updated"

# Restart Kiali deployment
log_info "Restarting Kiali deployment..."
kubectl rollout restart deployment/kiali -n istio-system

# Wait for rollout to complete
log_info "Waiting for Kiali to restart..."
kubectl rollout status deployment/kiali -n istio-system --timeout=300s

log_success "Kiali-Prometheus connection fix applied successfully!"

# Verify the fix
log_info "Verifying Kiali can connect to Prometheus..."
sleep 10

# Check Kiali logs for errors
if kubectl logs -n istio-system deployment/kiali --tail=20 | grep -q "Failed to fetch Prometheus"; then
    log_warning "Kiali may still have issues connecting to Prometheus. Check logs manually."
else
    log_success "No Prometheus connection errors found in Kiali logs"
fi

echo ""
echo "✅ Kiali-Prometheus connection fix completed!"
echo "🌐 Access Kiali at: http://localhost:20001/kiali"
echo "💡 If you still see initialization errors, wait a few minutes and refresh the browser."
