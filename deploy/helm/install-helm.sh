#!/bin/bash

# Cloud Native E-commerce Platform - Helm Installation Script
# This script installs all components using Helm charts

set -e

# Default app name
APP_NAME="${1:-eshopping}"

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

# Function to install a Helm chart
install_chart() {
    local chart=$1
    local options=$2

    log_info "Installing: $chart"
    local cmd="helm install $APP_NAME-$chart $chart $options"
    echo "Helm Command: $cmd"

    if eval "$cmd"; then
        log_success "$chart installed successfully"
    else
        log_error "Failed to install $chart"
        return 1
    fi
}

# Main installation
main() {
    log_info "Installation using Helm started"
    echo ""

    # Change to helm directory
    cd "$(dirname "$0")"

    # Infrastructure components
    local infras=("basketdb" "catalogdb" "discountdb" "elasticsearch" "kibana" "orderdb" "rabbitmq")

    # API services
    local apis=("basket" "catalog" "ordering" "discount")

    # Gateway
    local gateways=("ocelotapigw")

    # Additional services (optional)
    local additionals=("pgadmin" "portainer" "prometheus")

    # Install infrastructure
    log_info "Installing infrastructure components..."
    for infra in "${infras[@]}"; do
        install_chart "$infra" "" || log_warning "$infra installation failed, continuing..."
    done
    echo ""

    # Wait for infrastructure to be ready
    log_info "Waiting for infrastructure to be ready..."
    sleep 30
    echo ""

    # Install APIs
    log_info "Installing API services..."
    for api in "${apis[@]}"; do
        install_chart "$api" "" || log_warning "$api installation failed, continuing..."
    done
    echo ""

    # Install gateway
    log_info "Installing API gateway..."
    for gateway in "${gateways[@]}"; do
        install_chart "$gateway" "" || log_warning "$gateway installation failed, continuing..."
    done
    echo ""

    # Install additional services (optional - continue on failure)
    log_info "Installing additional services (optional)..."
    for additional in "${additionals[@]}"; do
        if [ -d "$additional" ]; then
            install_chart "$additional" "" || log_warning "$additional installation failed (optional), continuing..."
        else
            log_warning "$additional chart not found, skipping..."
        fi
    done
    echo ""

    log_success "Helm charts installation completed!"
    echo ""
    log_info "Installed releases:"
    helm list
}

# Run main function
main "$@"
