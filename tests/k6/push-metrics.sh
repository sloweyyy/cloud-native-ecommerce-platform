#!/bin/bash

# K6 Test Runner with Prometheus PushGateway Integration
# This script runs k6 tests and pushes metrics to Prometheus via PushGateway

set -e

# Configuration
PUSHGATEWAY_URL="${PUSHGATEWAY_URL:-http://localhost:9091}"
JOB_NAME="${JOB_NAME:-k6-load-test}"
NAMESPACE="${NAMESPACE:-dev}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if k6 is available
if ! command -v k6 &> /dev/null; then
    log_error "k6 is not installed. Please install it first."
    exit 1
fi

# Function to extract metrics from k6 JSON output and push to PushGateway
push_metrics_to_gateway() {
    local service_name=$1
    local json_file=$2

    log_info "Extracting metrics from ${json_file}..."

    # Extract key metrics using jq
    if ! command -v jq &> /dev/null; then
        log_warning "jq not installed. Installing via brew..."
        brew install jq
    fi

    # Parse k6 summary metrics
    local http_req_duration_avg=$(jq -r '.metrics.http_req_duration.avg // 0' "$json_file")
    local http_req_duration_p95=$(jq -r '.metrics.http_req_duration["p(95)"] // 0' "$json_file")
    local http_req_duration_max=$(jq -r '.metrics.http_req_duration.max // 0' "$json_file")
    local http_reqs=$(jq -r '.metrics.http_reqs.count // 0' "$json_file")
    local http_req_failed=$(jq -r '.metrics.http_req_failed.passes // 0' "$json_file")
    local vus=$(jq -r '.metrics.vus.value // 0' "$json_file")
    local iterations=$(jq -r '.metrics.iterations.count // 0' "$json_file")
    local data_received=$(jq -r '.metrics.data_received.count // 0' "$json_file")
    local data_sent=$(jq -r '.metrics.data_sent.count // 0' "$json_file")

    log_info "Pushing metrics to PushGateway for service: ${service_name}..."

    # Create Prometheus-formatted metrics
    cat <<EOF | curl -X POST --data-binary @- "${PUSHGATEWAY_URL}/metrics/job/${JOB_NAME}/instance/${service_name}"
# TYPE k6_http_req_duration_avg gauge
# HELP k6_http_req_duration_avg Average HTTP request duration in milliseconds
k6_http_req_duration_avg{service="${service_name}",namespace="${NAMESPACE}"} ${http_req_duration_avg}

# TYPE k6_http_req_duration_p95 gauge
# HELP k6_http_req_duration_p95 95th percentile HTTP request duration in milliseconds
k6_http_req_duration_p95{service="${service_name}",namespace="${NAMESPACE}"} ${http_req_duration_p95}

# TYPE k6_http_req_duration_max gauge
# HELP k6_http_req_duration_max Maximum HTTP request duration in milliseconds
k6_http_req_duration_max{service="${service_name}",namespace="${NAMESPACE}"} ${http_req_duration_max}

# TYPE k6_http_reqs_total counter
# HELP k6_http_reqs_total Total number of HTTP requests
k6_http_reqs_total{service="${service_name}",namespace="${NAMESPACE}"} ${http_reqs}

# TYPE k6_http_req_failed_total counter
# HELP k6_http_req_failed_total Total number of failed HTTP requests
k6_http_req_failed_total{service="${service_name}",namespace="${NAMESPACE}"} ${http_req_failed}

# TYPE k6_vus gauge
# HELP k6_vus Number of virtual users
k6_vus{service="${service_name}",namespace="${NAMESPACE}"} ${vus}

# TYPE k6_iterations_total counter
# HELP k6_iterations_total Total number of iterations
k6_iterations_total{service="${service_name}",namespace="${NAMESPACE}"} ${iterations}

# TYPE k6_data_received_bytes counter
# HELP k6_data_received_bytes Total bytes received
k6_data_received_bytes{service="${service_name}",namespace="${NAMESPACE}"} ${data_received}

# TYPE k6_data_sent_bytes counter
# HELP k6_data_sent_bytes Total bytes sent
k6_data_sent_bytes{service="${service_name}",namespace="${NAMESPACE}"} ${data_sent}
EOF

    if [ $? -eq 0 ]; then
        log_info "✓ Metrics pushed successfully for ${service_name}"
    else
        log_error "✗ Failed to push metrics for ${service_name}"
    fi
}

# Function to run a k6 test
run_k6_test() {
    local test_file=$1
    local service_name=$2

    log_info "Running k6 test: ${test_file} for service: ${service_name}..."

    # Run k6 with JSON summary output
    local json_output="/tmp/k6-${service_name}-$(date +%s).json"

    ./k6 run --summary-export="${json_output}" "${test_file}"

    if [ $? -eq 0 ]; then
        log_info "✓ Test completed for ${service_name}"
        push_metrics_to_gateway "${service_name}" "${json_output}"
    else
        log_error "✗ Test failed for ${service_name}"
        return 1
    fi
}

# Main execution
main() {
    log_info "Starting k6 load tests with PushGateway integration..."
    log_info "PushGateway URL: ${PUSHGATEWAY_URL}"
    log_info "Job Name: ${JOB_NAME}"
    log_info "Namespace: ${NAMESPACE}"
    echo ""

    # Check if PushGateway is accessible
    if ! curl -s "${PUSHGATEWAY_URL}" > /dev/null; then
        log_error "PushGateway is not accessible at ${PUSHGATEWAY_URL}"
        log_info "Please ensure port-forward is running:"
        log_info "  kubectl port-forward -n monitoring svc/prometheus-pushgateway 9091:9091"
        exit 1
    fi

    log_info "✓ PushGateway is accessible"
    echo ""

    # Run tests for all services
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    run_k6_test "${SCRIPT_DIR}/catalog-test.js" "catalog"
    echo ""

    run_k6_test "${SCRIPT_DIR}/basket-test.js" "basket"
    echo ""

    run_k6_test "${SCRIPT_DIR}/ordering-test.js" "ordering"
    echo ""

    # Skip discount test - it's a gRPC service, not HTTP REST
    log_warning "Skipping discount service test (gRPC-only service)"
    echo ""

    log_info "================================================"
    log_info "All tests completed!"
    log_info "================================================"
    log_info "Metrics are now available in Prometheus."
    log_info ""
    log_info "To view metrics:"
    log_info "1. Prometheus: http://localhost:9090 (query: k6_http_req_duration_avg)"
    log_info "2. Grafana: http://localhost:3000 (import dashboard from Deployments/monitoring/grafana-dashboard-k6.json)"
    log_info ""
    log_info "To see PushGateway status:"
    log_info "  curl ${PUSHGATEWAY_URL}/metrics"
}

# Run main function
main
