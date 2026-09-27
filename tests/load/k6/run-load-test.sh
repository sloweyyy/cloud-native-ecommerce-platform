#!/bin/bash

# K6 Load Test Runner with Real-time Prometheus Integration
# Usage: ./run-load-test.sh [stress|spike|soak]

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

# Always use AWS Gateway for all test runs
USE_GATEWAY=true
GATEWAY_URL="${AWS_GATEWAY_URL:-"http://localhost:8010"}"
PROMETHEUS_URL="${PROMETHEUS_URL:-http://localhost:9090}"
TEST_TYPE="${1:-stress}"

# Validate test type
case "$TEST_TYPE" in
    stress|spike|soak)
        ;;
    *)
        log_error "Invalid test type: $TEST_TYPE"
        echo "Usage: $0 [stress|spike|soak]"
        echo ""
        echo "Test types:"
        echo "  stress - Gradually increase load to find breaking point (12 min)"
        echo "  spike  - Sudden traffic surge testing (10 min)"
        echo "  soak   - Long-duration stability test (60 min)"
        exit 1
        ;;
esac

# Check if k6 is available
if ! command -v k6 &> /dev/null; then
    log_error "k6 is not installed. Please install it first."
    exit 1
fi

# Check if Prometheus is accessible
log_info "Checking Prometheus connection at ${PROMETHEUS_URL}..."
if ! curl -sf "${PROMETHEUS_URL}/-/ready" > /dev/null 2>&1; then
    log_error "Prometheus is not accessible at ${PROMETHEUS_URL}"
    log_info "Please ensure port-forward is running:"
    log_info "  kubectl port-forward -n monitoring svc/prometheus-server 9090:80"
    exit 1
fi

log_info "✓ Prometheus is accessible"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Always use AWS Gateway, skip port-forwards
log_info "Using AWS API Gateway (no port-forward needed)"
log_info "Gateway: $GATEWAY_URL"
export GATEWAY_URL
echo ""

TEST_FILE="${SCRIPT_DIR}/${TEST_TYPE}-test.js"

if [ ! -f "$TEST_FILE" ]; then
    log_error "Test file not found: $TEST_FILE"
    exit 1
fi

# Display test info
TEST_TYPE_UPPER=$(echo "$TEST_TYPE" | tr '[:lower:]' '[:upper:]')
log_info "=========================================="
log_info "  K6 Load Test - ${TEST_TYPE_UPPER}"
log_info "=========================================="
log_info "Test file: ${TEST_FILE}"
log_info "Prometheus: ${PROMETHEUS_URL}"
log_info "Metrics: Real-time push via Prometheus Remote Write"
echo ""

case "$TEST_TYPE" in
    stress)
        log_info "Duration: ~5 minutes"
        if [ "$USE_GATEWAY" = "true" ]; then
            log_info "Load: 0 → 1000 → 3000 → 5000 concurrent users (via Gateway)"
        else
            log_info "Load: 0 → 100 → 200 → 300 concurrent users (via port-forward)"
            log_warning "Note: For 5000+ users, use: USE_GATEWAY=true ./run-load-test.sh stress"
        fi
        log_info "Goal: Find system breaking point"
        ;;
    spike)
        log_info "Duration: ~5 minutes"
        log_info "Load: 2 → 100 (spike) → 2 users"
        log_info "Goal: Test sudden traffic surge resilience"
        ;;
    soak)
        log_info "Duration: ~11 minutes"
        log_info "Load: Sustained 20 users"
        log_info "Goal: Detect memory leaks and degradation"
        ;;
esac

echo ""
read -p "Continue with $TEST_TYPE test? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Test cancelled"
    exit 0
fi

log_info "Starting ${TEST_TYPE} test..."
log_info "Metrics will appear in Grafana in real-time!"
echo ""

# Run k6 with Prometheus remote write output
# Note: K6_PROMETHEUS_RW_SERVER_URL must point to Prometheus API write endpoint
export K6_PROMETHEUS_RW_SERVER_URL="${PROMETHEUS_URL}/api/v1/write"
export K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true

k6 run \
    -o experimental-prometheus-rw \
    "$TEST_FILE"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    log_info "================================================"
    log_info "  ${TEST_TYPE_UPPER} TEST COMPLETED SUCCESSFULLY!"
    log_info "================================================"
    log_info "View metrics in Grafana:"
    log_info "  http://localhost:3000"
    log_info ""
    log_info "Query examples in Prometheus:"
    log_info "  http_req_duration{job=\"k6\"}"
    log_info "  http_reqs_total{job=\"k6\"}"
else
    log_error "Test failed with exit code: $EXIT_CODE"
    exit $EXIT_CODE
fi
