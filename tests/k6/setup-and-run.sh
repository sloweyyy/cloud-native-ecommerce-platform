#!/bin/bash

# K6 Load Testing Complete Setup and Runner
# This script sets up all necessary port-forwards and runs k6 tests

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Configuration
NAMESPACE="${NAMESPACE:-dev}"
MONITORING_NAMESPACE="${MONITORING_NAMESPACE:-monitoring}"

# Cleanup function
cleanup() {
    log_warning "Cleaning up port-forwards..."
    pkill -f "kubectl port-forward" 2>/dev/null || true
    log_info "Cleanup complete"
}

# Trap Ctrl+C
trap cleanup EXIT INT TERM

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi

    # Check k6
    if ! command -v k6 &> /dev/null; then
        log_error "k6 is not installed. Install with: brew install k6"
        exit 1
    fi

    # Check jq
    if ! command -v jq &> /dev/null; then
        log_warning "jq is not installed. Installing..."
        brew install jq
    fi

    # Check if k6 binary exists in current directory
    if [ ! -f "./k6" ]; then
        log_warning "Custom k6 binary not found. Using system k6."
        log_info "If you need Prometheus remote write, build custom k6:"
        log_info "  export PATH=\$PATH:~/go/bin"
        log_info "  xk6 build --with github.com/grafana/xk6-output-prometheus-remote@latest"
    fi

    log_info "✓ Prerequisites check complete"
}

# Check cluster connectivity
check_cluster() {
    log_step "Checking Kubernetes cluster connectivity..."

    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi

    log_info "✓ Connected to cluster: $(kubectl config current-context)"
}

# Check if services are running
check_services() {
    log_step "Checking if services are running..."

    local services=("eshopping-catalog" "eshopping-basket" "eshopping-ordering")
    local all_running=true

    for svc in "${services[@]}"; do
        if kubectl get svc -n "$NAMESPACE" "$svc" &> /dev/null; then
            log_info "✓ Service found: $svc"
        else
            log_warning "✗ Service not found: $svc"
            all_running=false
        fi
    done

    # Check discount service (has different naming)
    if kubectl get svc -n "$NAMESPACE" "eshopping-discount-discount-grpc" &> /dev/null; then
        log_info "✓ Service found: eshopping-discount-discount-grpc"
    else
        log_warning "✗ Service not found: eshopping-discount-discount-grpc"
        all_running=false
    fi

    if [ "$all_running" = false ]; then
        log_warning "Some services are not running. Tests may fail."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Check monitoring stack
check_monitoring() {
    log_step "Checking monitoring stack..."

    local monitoring_services=("prometheus-server" "prometheus-pushgateway" "grafana")
    local all_running=true

    for svc in "${monitoring_services[@]}"; do
        if kubectl get svc -n "$MONITORING_NAMESPACE" "$svc" &> /dev/null; then
            log_info "✓ Monitoring service found: $svc"
        else
            log_error "✗ Monitoring service not found: $svc"
            all_running=false
        fi
    done

    if [ "$all_running" = false ]; then
        log_error "Monitoring stack is not fully deployed. Please deploy it first."
        exit 1
    fi
}

# Setup port forwards
setup_port_forwards() {
    log_step "Setting up port forwards..."

    # Clean up any existing port-forwards
    pkill -f "kubectl port-forward" 2>/dev/null || true
    sleep 3

    log_info "Starting port-forwards for services..."

    # Service port-forwards
    kubectl port-forward -n "$NAMESPACE" svc/eshopping-catalog 8081:80 > /dev/null 2>&1 &
    sleep 0.5
    log_info "  ✓ Catalog: localhost:8081"

    kubectl port-forward -n "$NAMESPACE" svc/eshopping-basket 8082:80 > /dev/null 2>&1 &
    sleep 0.5
    log_info "  ✓ Basket: localhost:8082"

    kubectl port-forward -n "$NAMESPACE" svc/eshopping-ordering 8083:80 > /dev/null 2>&1 &
    sleep 0.5
    log_info "  ✓ Ordering: localhost:8083"

    if kubectl get svc -n "$NAMESPACE" eshopping-discount-discount-grpc &> /dev/null; then
        kubectl port-forward -n "$NAMESPACE" svc/eshopping-discount-discount-grpc 8084:8080 > /dev/null 2>&1 &
        sleep 0.5
        log_info "  ✓ Discount: localhost:8084"
    fi

    log_info "Starting port-forwards for monitoring..."

    # Monitoring port-forwards
    kubectl port-forward -n "$MONITORING_NAMESPACE" svc/prometheus-pushgateway 9091:9091 > /dev/null 2>&1 &
    sleep 0.5
    log_info "  ✓ PushGateway: localhost:9091"

    kubectl port-forward -n "$MONITORING_NAMESPACE" svc/prometheus-server 9090:80 > /dev/null 2>&1 &
    sleep 0.5
    log_info "  ✓ Prometheus: localhost:9090"

    kubectl port-forward -n "$MONITORING_NAMESPACE" svc/grafana 3000:80 > /dev/null 2>&1 &
    sleep 0.5
    log_info "  ✓ Grafana: localhost:3000"

    # Wait for port-forwards to be ready
    log_info "Waiting for port-forwards to be ready..."
    sleep 5

    # Verify port-forwards
    log_info "Verifying connectivity..."

    # Check application services
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/api/v1/Catalog/GetAllProducts | grep -q "200"; then
        log_info "  ✓ Catalog is accessible"
    else
        log_warning "  ✗ Catalog may not be ready"
    fi

    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/api/v1/Basket/GetBasket/testuser | grep -qE "(200|204)"; then
        log_info "  ✓ Basket is accessible"
    else
        log_warning "  ✗ Basket may not be ready"
    fi

    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8083/api/v1/Order/testuser | grep -qE "(200|404)"; then
        log_info "  ✓ Ordering is accessible"
    else
        log_warning "  ✗ Ordering may not be ready"
    fi

    # Check monitoring services
    if curl -s http://localhost:9091 > /dev/null; then
        log_info "  ✓ PushGateway is accessible"
    else
        log_error "  ✗ PushGateway is not accessible"
    fi

    if curl -s http://localhost:9090 > /dev/null; then
        log_info "  ✓ Prometheus is accessible"
    else
        log_error "  ✗ Prometheus is not accessible"
    fi
}

# Update Prometheus configuration
update_prometheus_config() {
    log_step "Updating Prometheus configuration..."

    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local prometheus_values="${script_dir}/../../Deployments/helm/prometheus/prometheus-values.yaml"

    if [ -f "$prometheus_values" ]; then
        log_info "Upgrading Prometheus with updated configuration..."
        helm upgrade prometheus prometheus-community/prometheus \
            -f "$prometheus_values" \
            -n "$MONITORING_NAMESPACE" \
            --wait \
            --timeout 5m
        log_info "✓ Prometheus updated successfully"

        # Wait for Prometheus to restart
        log_info "Waiting for Prometheus to be ready..."
        kubectl rollout status deployment/prometheus-server -n "$MONITORING_NAMESPACE" --timeout=300s
        log_info "✓ Prometheus is ready"
    else
        log_warning "Prometheus values file not found at: $prometheus_values"
        log_warning "Skipping Prometheus configuration update"
    fi
}

# Display access information
display_info() {
    echo ""
    log_info "================================================"
    log_info "K6 Load Testing Environment Ready!"
    log_info "================================================"
    echo ""
    log_info "Service Endpoints:"
    echo "  • Catalog:    http://localhost:8081/api/v1/Catalog/GetAllProducts"
    echo "  • Basket:     http://localhost:8082/api/v1/Basket/GetBasket/testuser"
    echo "  • Ordering:   http://localhost:8083/api/v1/Activity"
    echo "  • Discount:   http://localhost:8084/api/v1/Discount"
    echo ""
    log_info "Monitoring Dashboards:"
    echo "  • Prometheus:   http://localhost:9090"
    echo "  • Grafana:      http://localhost:3000 (admin / prom-operator)"
    echo "  • PushGateway:  http://localhost:9091"
    echo ""
    log_info "Next Steps:"
    echo "  1. Run all tests:"
    echo "       ./tests/k6/push-metrics.sh"
    echo ""
    echo "  2. Run individual test:"
    echo "       ./k6 run tests/k6/catalog-test.js"
    echo ""
    echo "  3. View metrics in Prometheus:"
    echo "       Query: k6_http_req_duration_avg"
    echo ""
    echo "  4. Import Grafana dashboard:"
    echo "       Dashboards → Import → Upload Deployments/monitoring/grafana-dashboard-k6.json"
    echo ""
    log_info "Press Ctrl+C to stop port-forwards and exit"
    log_info "================================================"
    echo ""
}

# Main execution
main() {
    echo ""
    log_info "================================================"
    log_info "K6 Load Testing Setup"
    log_info "================================================"
    echo ""

    check_prerequisites
    check_cluster
    check_services
    check_monitoring

    # Ask if user wants to update Prometheus config
    read -p "Update Prometheus configuration to scrape PushGateway? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        update_prometheus_config
    fi

    setup_port_forwards

    # Auto-import Grafana dashboard
    read -p "Import K6 dashboard to Grafana automatically? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        log_info "Importing Grafana dashboard..."
        "${BASH_SOURCE%/*}/import-grafana-dashboard.sh" <<< "y" || log_warning "Dashboard import failed (may already exist)"
    fi

    display_info

    # Keep script running
    log_info "Port-forwards are active. Press Ctrl+C to stop..."
    while true; do
        sleep 1
    done
}

# Run main function
main
