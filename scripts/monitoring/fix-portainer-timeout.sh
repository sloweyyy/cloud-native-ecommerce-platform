#!/bin/bash

# Script to fix Portainer timeout issues and apply permanent configuration
# This ensures Portainer has longer session timeout and better persistence

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

echo "🔧 Applying Permanent Portainer Timeout Fix..."

# Check if Portainer is deployed
if ! kubectl get deployment portainer -n default > /dev/null 2>&1; then
    log_error "Portainer deployment not found in default namespace"
    exit 1
fi

# Check current Portainer status
log_info "Checking current Portainer status..."
PORTAINER_STATUS=$(kubectl get pods -l app.kubernetes.io/name=portainer -n default -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "NotFound")

if [ "$PORTAINER_STATUS" != "Running" ]; then
    log_warning "Portainer pod is not running. Current status: $PORTAINER_STATUS"
fi

# Upgrade Portainer with new configuration
log_info "Upgrading Portainer with extended timeout configuration..."
cd Deployments/helm
helm upgrade eshopping-portainer ./portainer --namespace default --timeout 600s

# Wait for rollout to complete
log_info "Waiting for Portainer to restart with new configuration..."
kubectl rollout status deployment/portainer -n default --timeout=300s

# Verify the deployment
log_info "Verifying Portainer deployment..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=portainer -n default --timeout=300s

log_success "Portainer has been restarted with extended timeout configuration"

# Check if port forward is running
log_info "Checking port forward status..."
if ! pgrep -f "kubectl.*port-forward.*portainer.*9000" > /dev/null; then
    log_info "Starting Portainer port forward..."
    kubectl port-forward svc/portainer 9000:9000 -n default > /dev/null 2>&1 &
    sleep 3
fi

# Test connectivity
log_info "Testing Portainer connectivity..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:9000 | grep -q "200"; then
    log_success "Portainer is accessible at http://localhost:9000"
else
    log_warning "Portainer may not be fully ready yet. Please wait a moment and try again."
fi

cd ../..

echo ""
echo "✅ Portainer timeout fix completed!"
echo ""
echo "📋 Configuration Applied:"
echo "   • Session Timeout: 24 hours (instead of default 8 hours)"
echo "   • Persistent Data: Enabled with 1Gi storage"
echo "   • Auto-restart: Configured"
echo ""
echo "🌐 Access Portainer:"
echo "   URL: http://localhost:9000"
echo "   First-time setup: Create admin user when prompted"
echo ""
echo "💡 Tips:"
echo "   • The timeout issue should no longer occur"
echo "   • Your Portainer data will persist across restarts"
echo "   • If you see the timeout message again, just refresh the browser"
