#!/bin/bash

# Website Workflow Test through AWS Gateway
# Simulates real website traffic through production gateway

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

# Check if gateway is accessible
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
    log_info "=== Website Workflow Test (AWS Gateway) ==="
    echo ""
    
    # Check prerequisites
    check_gateway
    
    # Set environment for gateway testing (website mode)
    export USE_GATEWAY=true
    export NX_API_BASE_URL="${AWS_GATEWAY_URL:-"http://localhost:8010"}"
    
    log_info "Testing real website traffic through production gateway"
    log_info "Duration: ~7 minutes"
    log_info "Load: 5 → 15 → 25 → 15 concurrent users"
    log_info "Focus: Production website performance under load"
    echo ""
    
    # Run the enhanced workflow test through gateway
    k6 run --env USE_GATEWAY=true --env NX_API_BASE_URL="${AWS_GATEWAY_URL:-"http://localhost:8010"}" workflow-website.js
    
    if [ $? -eq 0 ]; then
        log_success "=== Website Gateway Workflow Test Completed Successfully ==="
    else
        log_error "=== Website Gateway Workflow Test Failed ==="
    fi
}

# Run main function
main "$@"