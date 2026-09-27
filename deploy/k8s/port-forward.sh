#!/bin/bash

# Cloud Native E-commerce Platform - Port Forward Script
# This script sets up port forwarding for all services

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

# Kill existing port-forward processes
cleanup_existing() {
    log_info "Cleaning up existing port-forward processes..."
    pkill -f "kubectl port-forward" || true
    sleep 2
    log_success "Existing port-forward processes cleaned up"
}

# Start port forwarding for a service
start_port_forward() {
    local service=$1
    local namespace=$2
    local local_port=$3
    local remote_port=$4
    local description=$5
    
    log_info "Starting port-forward for $description..."
    kubectl port-forward "svc/$service" "$local_port:$remote_port" -n "$namespace" &
    
    # Give it a moment to start
    sleep 1
    
    if ps aux | grep -q "[k]ubectl port-forward svc/$service"; then
        log_success "$description available at http://localhost:$local_port"
    else
        log_error "Failed to start port-forward for $description"
    fi
}

# Start all port forwards
start_all_port_forwards() {
    log_info "Starting port forwarding for all services..."
    
    # API Services
    start_port_forward "ocelotapigw-service" "ecommerce" "8010" "80" "API Gateway"
    start_port_forward "catalog-service" "ecommerce" "8001" "80" "Catalog API"
    start_port_forward "basket-service" "ecommerce" "8002" "80" "Basket API"
    start_port_forward "discount-service" "ecommerce" "8003" "80" "Discount API"
    start_port_forward "ordering-service" "ecommerce" "8004" "80" "Ordering API"
    
    # Monitoring
    start_port_forward "grafana-service" "monitoring" "3000" "3000" "Grafana"
    start_port_forward "prometheus-service" "monitoring" "9090" "9090" "Prometheus"
    
    # Management Tools
    start_port_forward "portainer-service" "ecommerce" "9000" "9000" "Portainer"
    start_port_forward "pgadmin-service" "ecommerce" "8080" "80" "pgAdmin"
    
    # Infrastructure
    start_port_forward "rabbitmq-service" "ecommerce" "15672" "15672" "RabbitMQ Management"
    start_port_forward "kibana-service" "ecommerce" "5601" "5601" "Kibana"
    
    # Databases (for direct access if needed)
    start_port_forward "mongo-service" "ecommerce" "27017" "27017" "MongoDB"
    start_port_forward "redis-service" "ecommerce" "6379" "6379" "Redis"
    start_port_forward "postgres-service" "ecommerce" "5432" "5432" "PostgreSQL"
    start_port_forward "sqlserver-service" "ecommerce" "1433" "1433" "SQL Server"
}

# Show access information
show_access_info() {
    echo ""
    log_success "All services are now accessible via port forwarding!"
    echo ""
    log_info "🌐 Web Services:"
    echo "  API Gateway:       http://localhost:8010"
    echo "  Catalog API:       http://localhost:8001"
    echo "  Basket API:        http://localhost:8002"
    echo "  Discount API:      http://localhost:8003"
    echo "  Ordering API:      http://localhost:8004"
    echo ""
    log_info "📊 Monitoring & Management:"
    echo "  Grafana:           http://localhost:3000 (admin/prom-operator)"
    echo "  Prometheus:        http://localhost:9090"
    echo "  Portainer:         http://localhost:9000"
    echo "  pgAdmin:           http://localhost:8080 (admin@example.com/admin123)"
    echo "  RabbitMQ:          http://localhost:15672 (guest/guest)"
    echo "  Kibana:            http://localhost:5601"
    echo ""
    log_info "🗄️  Database Direct Access:"
    echo "  MongoDB:           localhost:27017"
    echo "  Redis:             localhost:6379"
    echo "  PostgreSQL:        localhost:5432 (admin/password123)"
    echo "  SQL Server:        localhost:1433 (sa/Password123)"
    echo ""
    log_warning "Press Ctrl+C to stop all port forwarding"
}

# Wait for interrupt
wait_for_interrupt() {
    trap 'log_info "Stopping all port forwarding..."; cleanup_existing; exit 0' INT
    
    while true; do
        sleep 1
    done
}

# Main function
main() {
    log_info "Cloud Native E-commerce Platform - Port Forward Setup"
    
    # Pre-checks
    check_kubectl
    
    # Cleanup existing port forwards
    cleanup_existing
    
    # Start all port forwards
    start_all_port_forwards
    
    # Show access information
    show_access_info
    
    # Wait for interrupt
    wait_for_interrupt
}

# Run main function
main "$@"
