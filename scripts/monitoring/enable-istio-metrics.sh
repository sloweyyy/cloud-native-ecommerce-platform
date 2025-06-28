#!/bin/bash

# Script to enable Istio metrics collection for Grafana dashboards
# This ensures all microservices have Istio sidecars injected for proper observability

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

echo "🔧 Enabling Istio Metrics Collection..."

# Check if Istio is installed
if ! kubectl get namespace istio-system > /dev/null 2>&1; then
    log_error "Istio is not installed. Please install Istio first."
    exit 1
fi

# Enable Istio injection for default namespace
log_info "Enabling Istio injection for default namespace..."
kubectl label namespace default istio-injection=enabled --overwrite

# Check current pod status
log_info "Checking current microservice pods..."
PODS_WITHOUT_SIDECAR=$(kubectl get pods -n default | grep -E "(catalog|basket|ordering|discount|ocelotapigw)" | grep "1/1" | wc -l || echo "0")

if [ "$PODS_WITHOUT_SIDECAR" -gt 0 ]; then
    log_warning "Found $PODS_WITHOUT_SIDECAR pods without Istio sidecars"
    
    # Restart deployments to inject sidecars
    log_info "Restarting microservice deployments to inject Istio sidecars..."
    kubectl rollout restart deployment/catalog deployment/basket deployment/ordering deployment/discountapi deployment/ocelotapigw -n default
    
    # Wait for rollouts to complete
    log_info "Waiting for deployments to complete..."
    kubectl rollout status deployment/catalog deployment/basket deployment/ordering deployment/discountapi deployment/ocelotapigw -n default --timeout=300s
    
    # Verify sidecar injection
    log_info "Verifying Istio sidecar injection..."
    sleep 10
    PODS_WITH_SIDECAR=$(kubectl get pods -n default | grep -E "(catalog|basket|ordering|discount|ocelotapigw)" | grep "2/2" | wc -l || echo "0")
    
    if [ "$PODS_WITH_SIDECAR" -gt 0 ]; then
        log_success "$PODS_WITH_SIDECAR microservice pods now have Istio sidecars injected"
    else
        log_error "Failed to inject Istio sidecars. Please check the logs."
        exit 1
    fi
else
    log_success "All microservice pods already have Istio sidecars injected"
fi

# Generate some traffic to create metrics
log_info "Generating traffic to create initial metrics..."
if kubectl port-forward svc/ocelotapigw 8010:80 -n default > /dev/null 2>&1 &
then
    PORT_FORWARD_PID=$!
    sleep 3
    
    # Generate traffic
    for i in {1..5}; do
        curl -s http://localhost:8010/Catalog/GetAllProducts > /dev/null 2>&1 || true
        curl -s http://localhost:8010/Basket/GetBasket/test > /dev/null 2>&1 || true
        sleep 1
    done
    
    # Stop the temporary port forward
    kill $PORT_FORWARD_PID 2>/dev/null || true
    log_success "Initial traffic generated"
fi

echo ""
echo "✅ Istio metrics collection enabled!"
echo ""
echo "📊 What was configured:"
echo "   • Istio injection enabled for default namespace"
echo "   • All microservice pods restarted with Istio sidecars"
echo "   • Initial traffic generated to create metrics"
echo ""
echo "🌐 View metrics in Grafana:"
echo "   • Istio Control Plane Dashboard: http://localhost:3000"
echo "   • Istio Service Dashboard: Available in Grafana"
echo "   • Istio Workload Dashboard: Available in Grafana"
echo ""
echo "💡 Tips:"
echo "   • Metrics may take 1-2 minutes to appear in Grafana"
echo "   • Generate more traffic to see richer metrics"
echo "   • Check Kiali for service mesh topology: http://localhost:20001"
