#!/bin/bash

# Enhanced Website Workflow Test Runner
# Tests realistic user behavior through the AWS API Gateway (simulating website traffic)

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
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

# Check if AWS gateway is accessible
check_gateway() {
    if ! curl -s --insecure ${AWS_GATEWAY_URL:-"http://localhost:8010"}/Catalog/GetAllProducts >/dev/null 2>&1; then
        log_error "AWS Gateway not accessible"
        log_info "Please check your network connection and gateway status"
        exit 1
    fi
}

# Main execution
main() {
    echo ""
    log_info "=== Enhanced Website Workflow Test (AWS Gateway) ==="
    echo ""
    
    # Check prerequisites
    check_gateway
    
    log_info "Testing realistic user behavior through AWS API Gateway"
    log_info "Simulating real website traffic patterns"
    log_info "Duration: ~7 minutes"
    log_info "Load: 5 → 15 → 25 → 15 concurrent users"
    log_info "Focus: End-to-end website performance through production gateway"
    echo ""
    
    # Run the enhanced workflow test with AWS gateway
    k6 run workflow-website.js
    
    if [ $? -eq 0 ]; then
        log_success "=== Website Workflow Test Completed Successfully ==="
    else
        log_error "=== Website Workflow Test Failed ==="
    fi
}

# Run main function
main "$@"