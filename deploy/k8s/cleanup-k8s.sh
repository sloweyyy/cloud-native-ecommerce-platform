#!/bin/bash

# Cloud Native E-commerce Platform - Kubernetes Cleanup Script
# This script removes all deployed resources

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

# Cleanup function with error handling
safe_delete() {
    local resource=$1
    if kubectl get "$resource" &> /dev/null; then
        log_info "Deleting $resource..."
        kubectl delete -f "$resource" --ignore-not-found=true
        log_success "$resource deleted"
    else
        log_warning "$resource not found, skipping"
    fi
}

# Cleanup ingress
cleanup_ingress() {
    log_info "Cleaning up ingress configurations..."
    safe_delete "ingress/api-ingress.yaml"
    safe_delete "ingress/monitoring-ingress.yaml"
}

# Cleanup management tools
cleanup_management() {
    log_info "Cleaning up management tools..."
    safe_delete "management/portainer.yaml"
    safe_delete "management/pgadmin.yaml"
}

# Cleanup monitoring stack
cleanup_monitoring() {
    log_info "Cleaning up monitoring stack..."
    safe_delete "monitoring/grafana.yaml"
    safe_delete "monitoring/prometheus.yaml"
    safe_delete "monitoring/rbac.yaml"
}

# Cleanup API Gateway
cleanup_gateway() {
    log_info "Cleaning up API Gateway..."
    safe_delete "gateway/ocelot-gateway.yaml"
}

# Cleanup microservices
cleanup_microservices() {
    log_info "Cleaning up microservices..."
    safe_delete "services/ordering-api.yaml"
    safe_delete "services/discount-api.yaml"
    safe_delete "services/basket-api.yaml"
    safe_delete "services/catalog-api.yaml"
}

# Cleanup infrastructure services
cleanup_infrastructure() {
    log_info "Cleaning up infrastructure services..."
    safe_delete "infrastructure/kibana.yaml"
    safe_delete "infrastructure/elasticsearch.yaml"
    safe_delete "infrastructure/rabbitmq.yaml"
}

# Cleanup databases
cleanup_databases() {
    log_info "Cleaning up databases..."
    safe_delete "databases/sqlserver.yaml"
    safe_delete "databases/postgresql.yaml"
    safe_delete "databases/redis.yaml"
    safe_delete "databases/mongodb.yaml"
}

# Cleanup configs
cleanup_configs() {
    log_info "Cleaning up secrets and configmaps..."
    safe_delete "configmaps.yaml"
    safe_delete "secrets.yaml"
}

# Cleanup namespaces (this will delete everything in the namespaces)
cleanup_namespaces() {
    log_info "Cleaning up namespaces..."
    
    if kubectl get namespace ecommerce &> /dev/null; then
        log_info "Deleting ecommerce namespace..."
        kubectl delete namespace ecommerce --ignore-not-found=true
        log_success "ecommerce namespace deleted"
    fi
    
    if kubectl get namespace monitoring &> /dev/null; then
        log_info "Deleting monitoring namespace..."
        kubectl delete namespace monitoring --ignore-not-found=true
        log_success "monitoring namespace deleted"
    fi
}

# Cleanup persistent volumes (optional)
cleanup_pvs() {
    log_info "Checking for persistent volumes to cleanup..."
    
    local pvs=$(kubectl get pv -o jsonpath='{.items[?(@.spec.claimRef.namespace=="ecommerce")].metadata.name}' 2>/dev/null || echo "")
    local monitoring_pvs=$(kubectl get pv -o jsonpath='{.items[?(@.spec.claimRef.namespace=="monitoring")].metadata.name}' 2>/dev/null || echo "")
    
    if [ -n "$pvs" ]; then
        log_warning "Found persistent volumes for ecommerce namespace: $pvs"
        log_warning "You may want to manually delete these if they're not needed"
    fi
    
    if [ -n "$monitoring_pvs" ]; then
        log_warning "Found persistent volumes for monitoring namespace: $monitoring_pvs"
        log_warning "You may want to manually delete these if they're not needed"
    fi
}

# Show remaining resources
show_remaining() {
    log_info "Checking for remaining resources..."
    
    local ecommerce_pods=$(kubectl get pods -n ecommerce 2>/dev/null | wc -l)
    local monitoring_pods=$(kubectl get pods -n monitoring 2>/dev/null | wc -l)
    
    if [ "$ecommerce_pods" -gt 1 ]; then
        log_warning "Some pods still exist in ecommerce namespace"
        kubectl get pods -n ecommerce
    fi
    
    if [ "$monitoring_pods" -gt 1 ]; then
        log_warning "Some pods still exist in monitoring namespace"
        kubectl get pods -n monitoring
    fi
    
    if [ "$ecommerce_pods" -le 1 ] && [ "$monitoring_pods" -le 1 ]; then
        log_success "All resources cleaned up successfully"
    fi
}

# Main cleanup function
main() {
    log_info "Starting cleanup of Cloud Native E-commerce Platform"
    
    # Change to the k8s directory
    cd "$(dirname "$0")"
    
    # Pre-cleanup checks
    check_kubectl
    
    # Confirm cleanup
    read -p "Are you sure you want to delete all resources? This action cannot be undone. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleanup cancelled"
        exit 0
    fi
    
    # Cleanup components in reverse order
    cleanup_ingress
    cleanup_management
    cleanup_monitoring
    cleanup_gateway
    cleanup_microservices
    cleanup_infrastructure
    cleanup_databases
    cleanup_configs
    
    # Wait a bit for resources to be deleted
    log_info "Waiting for resources to be deleted..."
    sleep 10
    
    # Cleanup namespaces (this will force delete any remaining resources)
    cleanup_namespaces
    
    # Check for persistent volumes
    cleanup_pvs
    
    # Show final status
    show_remaining
    
    log_success "Cleanup completed!"
}

# Run main function
main "$@"
