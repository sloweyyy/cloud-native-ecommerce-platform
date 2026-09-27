#!/bin/bash

# Run All K6 Tests - Uses AWS Gateway by Default
# This script runs all k6 tests and pushes metrics to Prometheus/Grafana

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date +%s)
RESULTS_DIR="/tmp/k6-results-${TIMESTAMP}"
mkdir -p "$RESULTS_DIR"

# Default to AWS Gateway (better performance, no port-forward issues)
# Set USE_GATEWAY=false to use localhost port-forwards
export USE_GATEWAY="${USE_GATEWAY:-true}"
export GATEWAY_URL="${GATEWAY_URL:-${AWS_GATEWAY_URL:-"http://localhost:8010"}}"
export PUSHGATEWAY_URL="${PUSHGATEWAY_URL:-http://localhost:9091}"

log_info "========================================="
log_info "  K6 Test Suite - All Tests"
log_info "========================================="
log_info "Mode: $([ "$USE_GATEWAY" = "true" ] && echo "AWS Gateway (High Load)" || echo "Localhost Port-Forward (Max 300 VUs)")"
log_info "Gateway: $GATEWAY_URL"
log_info "Results: $RESULTS_DIR"
echo ""

# Check if PushGateway is accessible
if ! curl -sf "$PUSHGATEWAY_URL/metrics" > /dev/null 2>&1; then
    log_warning "PushGateway not accessible at $PUSHGATEWAY_URL"
    log_info "Setting up PushGateway port-forward..."
    kubectl port-forward -n monitoring svc/prometheus-pushgateway 9091:9091 > /dev/null 2>&1 &
    sleep 3
    if ! curl -sf "$PUSHGATEWAY_URL/metrics" > /dev/null 2>&1; then
        log_error "Failed to connect to PushGateway"
        exit 1
    fi
fi

log_info "✓ PushGateway accessible"
echo ""

# Function to run a test and save results
run_test() {
    local test_file=$1
    local test_name=$2
    local json_file="${RESULTS_DIR}/k6-${test_name}.json"
    
    log_info "Running: $test_name"
    log_info "----------------------------------------"
    
    if k6 run --summary-export="$json_file" "${SCRIPT_DIR}/${test_file}" 2>&1 | tee "${RESULTS_DIR}/${test_name}.log"; then
        log_info "✓ $test_name completed"
        
        # Push metrics to PushGateway
        if [ -f "$json_file" ]; then
            log_info "Pushing metrics to PushGateway..."
            "${SCRIPT_DIR}/push-only.sh" "$json_file" "$test_name"
        fi
    else
        log_error "✗ $test_name failed"
        return 1
    fi
    
    echo ""
}

# Run Service Tests
log_info "========================================="
log_info "  1. SERVICE TESTS (30s each)"
log_info "========================================="
echo ""

run_test "catalog-test.js" "catalog"
run_test "basket-test.js" "basket"
run_test "ordering-test.js" "ordering"

# Run Workflow Tests
log_info "========================================="
log_info "  2. WORKFLOW TESTS"
log_info "========================================="
echo ""

run_test "gateway-smoke-test.js" "gateway-smoke"
run_test "workflow-shopping.js" "workflow"

# Run Load Tests
log_info "========================================="
log_info "  3. LOAD TESTS"
log_info "========================================="
echo ""

if [ "$USE_GATEWAY" = "true" ]; then
    log_info "Running full load tests via AWS Gateway..."
    run_test "stress-test.js" "stress"
    run_test "spike-test.js" "spike"
    run_test "soak-test.js" "soak"
else
    log_warning "Port-forward mode: Running reduced load tests (max 300 VUs)"
    run_test "stress-test.js" "stress"
    run_test "spike-test.js" "spike"
    run_test "soak-test.js" "soak"
fi

# Summary
log_info "========================================="
log_info "  ALL TESTS COMPLETED!"
log_info "========================================="
log_info "Results saved to: $RESULTS_DIR"
log_info ""
log_info "View metrics in:"
log_info "  - Grafana: http://localhost:3000"
log_info "  - Prometheus: http://localhost:9090"
log_info ""
log_info "Query examples:"
log_info "  k6_http_req_duration_avg"
log_info "  k6_http_reqs_total"
log_info "  k6_http_req_failed_total"
echo ""
