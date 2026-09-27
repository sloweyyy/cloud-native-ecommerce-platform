#!/bin/bash

# Cloud Native E-commerce Platform - Deployment Validation Script
# This script validates that all services are running correctly

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

# Check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "kubectl is available and connected to cluster"
}

# Check namespaces
check_namespaces() {
    log_info "Checking namespaces..."
    
    if kubectl get namespace ecommerce &> /dev/null; then
        log_success "ecommerce namespace exists"
    else
        log_error "ecommerce namespace not found"
        return 1
    fi
    
    if kubectl get namespace monitoring &> /dev/null; then
        log_success "monitoring namespace exists"
    else
        log_error "monitoring namespace not found"
        return 1
    fi
}

# Check pod status
check_pods() {
    log_info "Checking pod status..."
    
    local failed=0
    
    # Check ecommerce pods
    local ecommerce_pods=$(kubectl get pods -n ecommerce --no-headers 2>/dev/null | wc -l)
    local ecommerce_running=$(kubectl get pods -n ecommerce --no-headers 2>/dev/null | grep Running | wc -l)
    
    log_info "Ecommerce namespace: $ecommerce_running/$ecommerce_pods pods running"
    
    if [ "$ecommerce_running" -lt "$ecommerce_pods" ]; then
        log_warning "Some pods in ecommerce namespace are not running:"
        kubectl get pods -n ecommerce | grep -v Running || true
        failed=1
    fi
    
    # Check monitoring pods
    local monitoring_pods=$(kubectl get pods -n monitoring --no-headers 2>/dev/null | wc -l)
    local monitoring_running=$(kubectl get pods -n monitoring --no-headers 2>/dev/null | grep Running | wc -l)
    
    log_info "Monitoring namespace: $monitoring_running/$monitoring_pods pods running"
    
    if [ "$monitoring_running" -lt "$monitoring_pods" ]; then
        log_warning "Some pods in monitoring namespace are not running:"
        kubectl get pods -n monitoring | grep -v Running || true
        failed=1
    fi
    
    if [ $failed -eq 0 ]; then
        log_success "All pods are running"
    fi
    
    return $failed
}

# Check services
check_services() {
    log_info "Checking services..."
    
    local services=(
        "ecommerce:catalog-service"
        "ecommerce:basket-service"
        "ecommerce:discount-service"
        "ecommerce:ordering-service"
        "ecommerce:ocelotapigw-service"
        "ecommerce:mongo-service"
        "ecommerce:redis-service"
        "ecommerce:postgres-service"
        "ecommerce:sqlserver-service"
        "ecommerce:rabbitmq-service"
        "ecommerce:elasticsearch-service"
        "ecommerce:kibana-service"
        "ecommerce:portainer-service"
        "ecommerce:pgadmin-service"
        "monitoring:prometheus-service"
        "monitoring:grafana-service"
    )
    
    local failed=0
    
    for service in "${services[@]}"; do
        local namespace=$(echo $service | cut -d: -f1)
        local service_name=$(echo $service | cut -d: -f2)
        
        if kubectl get service "$service_name" -n "$namespace" &> /dev/null; then
            log_success "✓ $service_name ($namespace)"
        else
            log_error "✗ $service_name ($namespace) not found"
            failed=1
        fi
    done
    
    return $failed
}

# Check persistent volumes
check_storage() {
    log_info "Checking persistent storage..."
    
    local pvcs=$(kubectl get pvc -A --no-headers 2>/dev/null | wc -l)
    local bound_pvcs=$(kubectl get pvc -A --no-headers 2>/dev/null | grep Bound | wc -l)
    
    log_info "Persistent Volume Claims: $bound_pvcs/$pvcs bound"
    
    if [ "$bound_pvcs" -lt "$pvcs" ]; then
        log_warning "Some PVCs are not bound:"
        kubectl get pvc -A | grep -v Bound || true
        return 1
    else
        log_success "All PVCs are bound"
        return 0
    fi
}

# Test API connectivity (requires port-forwarding)
test_api_connectivity() {
    log_info "Testing API connectivity (requires port-forwarding)..."
    
    # Check if port-forwarding is active
    if ! pgrep -f "kubectl port-forward" > /dev/null; then
        log_warning "No port-forwarding detected. Run ./port-forward.sh to test APIs"
        return 0
    fi
    
    local apis=(
        "8010:API Gateway"
        "8001:Catalog API"
        "8002:Basket API"
        "8003:Discount API"
        "8004:Ordering API"
        "3000:Grafana"
        "9090:Prometheus"
    )
    
    for api in "${apis[@]}"; do
        local port=$(echo $api | cut -d: -f1)
        local name=$(echo $api | cut -d: -f2)
        
        if curl -s -f "http://localhost:$port" > /dev/null 2>&1; then
            log_success "✓ $name (localhost:$port)"
        else
            log_warning "✗ $name (localhost:$port) not responding"
        fi
    done
}

# Check resource usage
check_resources() {
    log_info "Checking resource usage..."
    
    # Check if metrics-server is available
    if kubectl top nodes &> /dev/null; then
        log_info "Node resource usage:"
        kubectl top nodes
        echo ""
        
        log_info "Pod resource usage (top 10):"
        kubectl top pods -A | head -11
    else
        log_warning "Metrics server not available, cannot show resource usage"
    fi
}

# Show deployment summary
show_summary() {
    echo ""
    log_info "=== DEPLOYMENT SUMMARY ==="
    echo ""
    
    log_info "Ecommerce Namespace Pods:"
    kubectl get pods -n ecommerce
    echo ""
    
    log_info "Monitoring Namespace Pods:"
    kubectl get pods -n monitoring
    echo ""
    
    log_info "Services:"
    kubectl get svc -n ecommerce
    kubectl get svc -n monitoring
    echo ""
    
    log_info "Persistent Volume Claims:"
    kubectl get pvc -A
    echo ""
    
    if kubectl get ingress -A &> /dev/null; then
        log_info "Ingress:"
        kubectl get ingress -A
        echo ""
    fi
}

# Main validation function
main() {
    log_info "Starting deployment validation for Cloud Native E-commerce Platform"
    echo ""
    
    local overall_status=0
    
    # Run all checks
    check_kubectl || overall_status=1
    echo ""
    
    check_namespaces || overall_status=1
    echo ""
    
    check_pods || overall_status=1
    echo ""
    
    check_services || overall_status=1
    echo ""
    
    check_storage || overall_status=1
    echo ""
    
    test_api_connectivity
    echo ""
    
    check_resources
    echo ""
    
    show_summary
    
    # Final result
    if [ $overall_status -eq 0 ]; then
        log_success "🎉 Deployment validation PASSED!"
        echo ""
        log_info "Next steps:"
        echo "  1. Run ./port-forward.sh to access services"
        echo "  2. Visit http://localhost:8010 for API Gateway"
        echo "  3. Visit http://localhost:3000 for Grafana (admin/prom-operator)"
        echo "  4. Visit http://localhost:9000 for Portainer"
    else
        log_error "❌ Deployment validation FAILED!"
        echo ""
        log_info "Troubleshooting steps:"
        echo "  1. Check pod logs: kubectl logs -f <pod-name> -n <namespace>"
        echo "  2. Describe failed pods: kubectl describe pod <pod-name> -n <namespace>"
        echo "  3. Check events: kubectl get events -n <namespace> --sort-by='.lastTimestamp'"
        echo "  4. Verify cluster resources: kubectl top nodes"
    fi
    
    exit $overall_status
}

# Run main function
main "$@"
