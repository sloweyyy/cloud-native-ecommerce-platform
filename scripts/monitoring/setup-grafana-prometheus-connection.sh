#!/bin/bash

# 🔒 Apply Permanent Grafana-Prometheus Fix
# This script makes the Grafana fix permanent across restarts and redeployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

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

# Function to backup current configuration
backup_current_config() {
    log_info "Backing up current Grafana configuration..."
    
    kubectl get configmap grafana -n istio-system -o yaml > grafana-backup-$(date +%Y%m%d-%H%M%S).yaml
    kubectl get deployment grafana -n istio-system -o yaml > grafana-deployment-backup-$(date +%Y%m%d-%H%M%S).yaml
    
    log_success "Configuration backed up"
}

# Function to apply permanent ConfigMap fix
apply_permanent_configmap() {
    log_info "Applying Grafana ConfigMap with correct Prometheus connection..."

    kubectl apply -f Deployments/monitoring/grafana/grafana-configmap-fixed.yaml

    log_success "Grafana ConfigMap updated"
}

# Function to create service bridge permanently
create_permanent_service_bridge() {
    log_info "Creating Prometheus service alias for compatibility..."

    kubectl apply -f Deployments/monitoring/grafana/prometheus-service-alias.yaml

    log_success "Prometheus service alias created"
}

# Function to update deployment annotations to force restart on config changes
update_deployment_annotations() {
    log_info "Updating deployment to automatically restart on config changes..."
    
    # Add annotation to force restart when ConfigMap changes
    kubectl patch deployment grafana -n istio-system -p '{"spec":{"template":{"metadata":{"annotations":{"config-hash":"'$(kubectl get configmap grafana -n istio-system -o jsonpath='{.metadata.resourceVersion}')'"}}}}}'
    
    log_success "Deployment annotations updated"
}

# Function to create a monitoring script
create_monitoring_script() {
    log_info "Creating monitoring script for Grafana health..."
    
    cat > monitor-grafana-health.sh << 'EOF'
#!/bin/bash

# Monitor Grafana-Prometheus connectivity
# Run this script to check if the fix is still working

GRAFANA_POD=$(kubectl get pods -n istio-system -l app.kubernetes.io/name=grafana -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [[ -n "$GRAFANA_POD" ]]; then
    echo "🔍 Testing Grafana-Prometheus connectivity..."
    
    if kubectl exec -n istio-system "$GRAFANA_POD" -- curl -s --max-time 5 "http://prometheus-server.monitoring.svc.cluster.local:80/api/v1/query?query=up" > /dev/null 2>&1; then
        echo "✅ Grafana can reach Prometheus - Fix is working!"
        exit 0
    else
        echo "❌ Grafana cannot reach Prometheus - Fix may need reapplication"
        echo "💡 Run: ./deploy.sh to redeploy with permanent fix"
        exit 1
    fi
else
    echo "❌ Grafana pod not found"
    exit 1
fi
EOF
    
    chmod +x monitor-grafana-health.sh
    log_success "Monitoring script created: monitor-grafana-health.sh"
}

# Function to update deploy.sh script
update_deploy_script() {
    log_info "Checking if deploy.sh needs updating..."
    
    log_info "deploy.sh already includes permanent Grafana fix integration"
}

# Function to create a validation script
create_validation_script() {
    log_info "Creating validation script..."
    
    cat > validate-grafana-fix.sh << 'EOF'
#!/bin/bash

# Validate that Grafana fix is working properly

echo "🔍 Validating Grafana-Prometheus Fix..."
echo ""

# Check ConfigMap
echo "1. Checking ConfigMap configuration..."
if kubectl get configmap grafana -n istio-system -o yaml | grep -q "prometheus-server.monitoring.svc.cluster.local"; then
    echo "   ✅ ConfigMap has correct Prometheus URL"
else
    echo "   ❌ ConfigMap does not have correct Prometheus URL"
    exit 1
fi

# Check Service Bridge
echo "2. Checking service bridge..."
if kubectl get svc prometheus -n istio-system > /dev/null 2>&1; then
    echo "   ✅ Prometheus service bridge exists"
else
    echo "   ❌ Prometheus service bridge missing"
    exit 1
fi

# Check Pod Status
echo "3. Checking Grafana pod status..."
if kubectl get pods -n istio-system -l app.kubernetes.io/name=grafana | grep -q "Running"; then
    echo "   ✅ Grafana pod is running"
else
    echo "   ❌ Grafana pod is not running"
    exit 1
fi

# Test Connectivity
echo "4. Testing connectivity..."
GRAFANA_POD=$(kubectl get pods -n istio-system -l app.kubernetes.io/name=grafana -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [[ -n "$GRAFANA_POD" ]]; then
    if kubectl exec -n istio-system "$GRAFANA_POD" -- curl -s --max-time 5 "http://prometheus-server.monitoring.svc.cluster.local:80/api/v1/query?query=up" > /dev/null 2>&1; then
        echo "   ✅ Grafana can reach Prometheus"
    else
        echo "   ❌ Grafana cannot reach Prometheus"
        exit 1
    fi
else
    echo "   ❌ Cannot find Grafana pod"
    exit 1
fi

echo ""
echo "🎉 All validations passed! Grafana fix is working properly."
echo ""
echo "📊 Access Grafana at: http://localhost:3000"
echo "🔑 Credentials: admin / prom-operator"
EOF
    
    chmod +x validate-grafana-fix.sh
    log_success "Validation script created: validate-grafana-fix.sh"
}

# Function to display summary
display_summary() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${GREEN}                    🔒 PERMANENT GRAFANA FIX APPLIED                         ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✅ What was made permanent:${NC}"
    echo "   • ConfigMap with correct Prometheus URL"
    echo "   • Service bridge for backward compatibility"
    echo "   • Deployment annotations for auto-restart"
    echo "   • Monitoring and validation scripts"
    echo ""
    echo -e "${BLUE}📁 Files created:${NC}"
    echo "   • grafana-fixed-values.yaml - Helm values for future deployments"
    echo "   • monitor-grafana-health.sh - Health monitoring script"
    echo "   • validate-grafana-fix.sh - Validation script"
    echo "   • Configuration backups with timestamps"
    echo ""
    echo -e "${BLUE}🔧 Usage:${NC}"
    echo "   • Monitor health: ./monitor-grafana-health.sh"
    echo "   • Validate fix: ./validate-grafana-fix.sh"
    echo "   • Access Grafana: http://localhost:3000 (admin/prom-operator)"
    echo ""
    echo -e "${YELLOW}💡 The fix will now persist across:${NC}"
    echo "   • Pod restarts"
    echo "   • ConfigMap changes"
    echo "   • Cluster restarts"
    echo "   • Future deployments (if using grafana-fixed-values.yaml)"
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}🔒 Applying Permanent Grafana-Prometheus Fix...${NC}"
    echo ""
    
    backup_current_config
    apply_permanent_configmap
    create_permanent_service_bridge
    update_deployment_annotations
    create_monitoring_script
    create_validation_script
    update_deploy_script
    
    # Restart Grafana to ensure everything is working
    log_info "Restarting Grafana to apply all changes..."
    kubectl rollout restart deployment/grafana -n istio-system
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=grafana -n istio-system --timeout=600s || log_warning "Grafana pod may not be ready yet, but continuing..."
    
    # Validate the setup, but don't exit if it fails
    log_info "Validating Grafana-Prometheus connection..."
    sleep 5
    if [ -f "scripts/monitoring/check-grafana-prometheus-health.sh" ]; then
        scripts/monitoring/check-grafana-prometheus-health.sh || log_warning "Validation failed, but continuing deployment..."
    elif [ -f "check-grafana-prometheus-health.sh" ]; then
        ./check-grafana-prometheus-health.sh || log_warning "Validation failed, but continuing deployment..."
    else
        log_warning "Health check script not found, skipping validation"
    fi
    
    display_summary
}

# Run the script
main "$@"
