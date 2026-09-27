#!/bin/bash

# Push existing k6 JSON results to Prometheus PushGateway (no test execution)
# NOTE: Always use AWS Gateway for all test runs. Do NOT use local port-forwards.
# Usage: ./push-only.sh <json-file> <test-name>
# Example: ./push-only.sh /tmp/k6-spike.json spike

set -e

PUSHGATEWAY_URL="${PUSHGATEWAY_URL:-http://localhost:9091}"
JOB_NAME="${JOB_NAME:-k6-load-test}"
NAMESPACE="${NAMESPACE:-dev}"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

usage() {
    echo "Usage: $0 <json-file> <test-name>"
    echo ""
    echo "Examples:"
    echo "  $0 /tmp/k6-spike.json spike"
    echo "  $0 /tmp/k6-stress.json stress"
    echo "  $0 /tmp/k6-soak.json soak"
    echo ""
    echo "Push all recent tests:"
    echo "  $0 all"
}

push_metrics() {
    local json_file=$1
    local test_name=$2

    if [ ! -f "$json_file" ]; then
        echo -e "${RED}[ERROR]${NC} File not found: $json_file"
        return 1
    fi

    echo -e "${GREEN}[INFO]${NC} Pushing $test_name from $json_file..."

    # Extract metrics
    local http_req_duration_avg=$(jq -r '.metrics.http_req_duration.avg // 0' "$json_file")
    local http_req_duration_p95=$(jq -r '.metrics.http_req_duration["p(95)"] // 0' "$json_file")
    local http_req_duration_max=$(jq -r '.metrics.http_req_duration.max // 0' "$json_file")
    local http_reqs=$(jq -r '.metrics.http_reqs.count // 0' "$json_file")
    local http_req_failed=$(jq -r '.metrics.http_req_failed.passes // 0' "$json_file")
    local vus=$(jq -r '.metrics.vus.max // .metrics.vus.value // 0' "$json_file")
    local iterations=$(jq -r '.metrics.iterations.count // 0' "$json_file")
    local data_received=$(jq -r '.metrics.data_received.count // 0' "$json_file")
    local data_sent=$(jq -r '.metrics.data_sent.count // 0' "$json_file")

    # Determine label type (service tests vs load tests)
    local label_name="test_type"
    if [[ "$test_name" =~ ^(catalog|basket|ordering|discount)$ ]]; then
        label_name="service"
    fi

    # Push to PushGateway
    cat <<EOF | curl -s -X POST --data-binary @- "${PUSHGATEWAY_URL}/metrics/job/${JOB_NAME}/instance/${test_name}"
# TYPE k6_http_req_duration_avg gauge
k6_http_req_duration_avg{${label_name}="${test_name}",namespace="${NAMESPACE}"} ${http_req_duration_avg}
# TYPE k6_http_req_duration_p95 gauge
k6_http_req_duration_p95{${label_name}="${test_name}",namespace="${NAMESPACE}"} ${http_req_duration_p95}
# TYPE k6_http_req_duration_max gauge
k6_http_req_duration_max{${label_name}="${test_name}",namespace="${NAMESPACE}"} ${http_req_duration_max}
# TYPE k6_http_reqs_total counter
k6_http_reqs_total{${label_name}="${test_name}",namespace="${NAMESPACE}"} ${http_reqs}
# TYPE k6_http_req_failed_total counter
k6_http_req_failed_total{${label_name}="${test_name}",namespace="${NAMESPACE}"} ${http_req_failed}
# TYPE k6_vus gauge
k6_vus{${label_name}="${test_name}",namespace="${NAMESPACE}"} ${vus}
# TYPE k6_iterations_total counter
k6_iterations_total{${label_name}="${test_name}",namespace="${NAMESPACE}"} ${iterations}
# TYPE k6_data_received_bytes counter
k6_data_received_bytes{${label_name}="${test_name}",namespace="${NAMESPACE}"} ${data_received}
# TYPE k6_data_sent_bytes counter
k6_data_sent_bytes{${label_name}="${test_name}",namespace="${NAMESPACE}"} ${data_sent}
EOF

    echo -e "${GREEN}[INFO]${NC} ✓ Pushed $test_name (avg=${http_req_duration_avg}ms, p95=${http_req_duration_p95}ms, reqs=${http_reqs})"
}

push_all_recent() {
    echo -e "${GREEN}[INFO]${NC} Pushing all recent test results..."
    
    # Find most recent files for each test type
    for test in spike stress soak catalog basket ordering; do
        json_file=$(ls -t /tmp/k6-${test}*.json 2>/dev/null | head -1)
        if [ -n "$json_file" ] && [ -f "$json_file" ]; then
            push_metrics "$json_file" "$test"
        fi
    done
}

# Main
if [ $# -eq 0 ]; then
    usage
    exit 1
fi

if [ "$1" = "all" ]; then
    push_all_recent
elif [ $# -eq 2 ]; then
    push_metrics "$1" "$2"
else
    usage
    exit 1
fi

echo -e "${GREEN}[INFO]${NC} Done! View at http://localhost:9090 or http://localhost:3000"
