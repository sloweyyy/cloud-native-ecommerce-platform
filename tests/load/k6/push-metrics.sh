#!/bin/bash

# K6 Test Runner with Prometheus PushGateway Integration
# NOTE: Always use AWS Gateway for all test runs. Do NOT use local port-forwards.
# Metrics should be collected from the AWS Gateway endpoint.

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
    local test_name=$1
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

    # Determine label strategy
    # For individual service tests: use service label
    # For load tests: use test_type label (note: detailed per-service metrics available via real-time approach)
    local service_label=""
    local test_type_label=""

    if [[ "$test_name" =~ ^(catalog|basket|ordering|discount)$ ]]; then
        # Individual service test
        service_label="service=\"${test_name}\""
        test_type_label="test_type=\"load\""
    else
        # Load test (stress, spike, soak)
        # Summary metrics are aggregated across all services
        # For per-service metrics during load tests, use run-load-test.sh with real-time metrics
        service_label="service=\"multi\""
        test_type_label="test_type=\"${test_name}\""
    fi

    log_info "Pushing metrics to PushGateway for test: ${test_name}..."

    # Create Prometheus-formatted metrics with both service and test_type labels
    cat <<EOF | curl -X POST --data-binary @- "${PUSHGATEWAY_URL}/metrics/job/${JOB_NAME}/instance/${test_name}"
# TYPE k6_http_req_duration_avg gauge
# HELP k6_http_req_duration_avg Average HTTP request duration in milliseconds
k6_http_req_duration_avg{${service_label},${test_type_label},namespace="${NAMESPACE}"} ${http_req_duration_avg}

# TYPE k6_http_req_duration_p95 gauge
# HELP k6_http_req_duration_p95 95th percentile HTTP request duration in milliseconds
k6_http_req_duration_p95{${service_label},${test_type_label},namespace="${NAMESPACE}"} ${http_req_duration_p95}

# TYPE k6_http_req_duration_max gauge
# HELP k6_http_req_duration_max Maximum HTTP request duration in milliseconds
k6_http_req_duration_max{${service_label},${test_type_label},namespace="${NAMESPACE}"} ${http_req_duration_max}

# TYPE k6_http_reqs_total counter
# HELP k6_http_reqs_total Total number of HTTP requests
k6_http_reqs_total{${service_label},${test_type_label},namespace="${NAMESPACE}"} ${http_reqs}

# TYPE k6_http_req_failed_total counter
# HELP k6_http_req_failed_total Total number of failed HTTP requests
k6_http_req_failed_total{${service_label},${test_type_label},namespace="${NAMESPACE}"} ${http_req_failed}

# TYPE k6_vus gauge
# HELP k6_vus Number of virtual users
k6_vus{${service_label},${test_type_label},namespace="${NAMESPACE}"} ${vus}

# TYPE k6_iterations_total counter
# HELP k6_iterations_total Total number of iterations
k6_iterations_total{${service_label},${test_type_label},namespace="${NAMESPACE}"} ${iterations}

# TYPE k6_data_received_bytes counter
# HELP k6_data_received_bytes Total bytes received
k6_data_received_bytes{${service_label},${test_type_label},namespace="${NAMESPACE}"} ${data_received}

# TYPE k6_data_sent_bytes counter
# HELP k6_data_sent_bytes Total bytes sent
k6_data_sent_bytes{${service_label},${test_type_label},namespace="${NAMESPACE}"} ${data_sent}
EOF

    if [ $? -eq 0 ]; then
        log_info "✓ Metrics pushed successfully for ${test_name}"
    else
        log_error "✗ Failed to push metrics for ${test_name}"
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

# Show usage
usage() {
    echo "Usage: $0 [test-type]"
    echo ""
    echo "Test types:"
    echo "  service    Run service tests (catalog, basket, ordering) - default"
    echo "  spike      Run spike test"
    echo "  soak       Run soak test"
    echo "  stress     Run stress test"
    echo "  all        Run all tests"
    echo ""
    echo "Examples:"
    echo "  $0              # Run service tests"
    echo "  $0 spike        # Run spike test"
    echo "  $0 stress       # Run stress test"
    echo "  $0 all          # Run all tests"
}

# Main execution
main() {
    local test_type="${1:-service}"

    log_info "Starting k6 load tests with PushGateway integration..."
    log_info "PushGateway URL: ${PUSHGATEWAY_URL}"
    log_info "Job Name: ${JOB_NAME}"
    log_info "Namespace: ${NAMESPACE}"
    log_info "Test Type: ${test_type}"
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

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    case "${test_type}" in
        service)
            run_k6_test "${SCRIPT_DIR}/catalog-test.js" "catalog"
            echo ""
            run_k6_test "${SCRIPT_DIR}/basket-test.js" "basket"
            echo ""
            run_k6_test "${SCRIPT_DIR}/ordering-test.js" "ordering"
            echo ""
            log_warning "Skipping discount service test (gRPC-only service)"
            ;;
        spike)
            run_k6_test "${SCRIPT_DIR}/spike-test.js" "spike"
            ;;
        soak)
            run_k6_test "${SCRIPT_DIR}/soak-test.js" "soak"
            ;;
        stress)
            run_k6_test "${SCRIPT_DIR}/stress-test.js" "stress"
            ;;
        all)
            log_info "Running ALL tests..."
            echo ""
            run_k6_test "${SCRIPT_DIR}/catalog-test.js" "catalog"
            echo ""
            run_k6_test "${SCRIPT_DIR}/basket-test.js" "basket"
            echo ""
            run_k6_test "${SCRIPT_DIR}/ordering-test.js" "ordering"
            echo ""
            run_k6_test "${SCRIPT_DIR}/spike-test.js" "spike"
            echo ""
            run_k6_test "${SCRIPT_DIR}/stress-test.js" "stress"
            echo ""
            log_warning "Skipping soak test (long duration - run separately)"
            ;;
        -h|--help|help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown test type: ${test_type}"
            usage
            exit 1
            ;;
    esac

    echo ""
    log_info "================================================"
    log_info "Tests completed!"
    log_info "================================================"
    log_info "Metrics are now available in Prometheus."
    log_info ""
    log_info "To view metrics:"
    log_info "1. Prometheus: http://localhost:9090 (query: k6_http_req_duration_avg)"
    log_info "2. Grafana: http://localhost:3000 (import dashboard from deploy/monitoring/grafana-dashboard-k6.json)"
    log_info ""
    log_info "To see PushGateway status:"
    log_info "  curl ${PUSHGATEWAY_URL}/metrics"
}

# Run main function
main "$@"
