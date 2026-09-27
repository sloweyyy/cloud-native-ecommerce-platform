#!/bin/bash

# Cloud Native E-commerce Platform - Helm Uninstallation Script
# This script uninstalls all Helm releases

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

# Function to uninstall a Helm release
uninstall_chart() {
    local chart=$1
    local release_name="$APP_NAME-$chart"

    log_info "Uninstalling: $release_name"

    if helm list --short | grep -q "^$release_name\$"; then
        if helm uninstall "$release_name"; then
            log_success "$release_name uninstalled successfully"
        else
            log_error "Failed to uninstall $release_name"
            return 1
        fi
    else
        log_warning "$release_name not found, skipping..."
    fi
}

# Main uninstallation
main() {
    log_info "Uninstallation using Helm started"
    echo ""

    # List all releases before uninstall
    log_info "Current releases:"
    helm list
    echo ""

    # All components (in reverse order for clean uninstall)
    local all_components=(
        "prometheus"
        "portainer"
        "pgadmin"
        "ocelotapigw"
        "ordering"
        "discount"
        "catalog"
        "basket"
        "kibana"
        "elasticsearch"
        "rabbitmq"
        "orderdb"
        "discountdb"
        "catalogdb"
        "basketdb"
    )

    # Uninstall all components
    for component in "${all_components[@]}"; do
        uninstall_chart "$component" || log_warning "$component uninstallation failed, continuing..."
    done
    echo ""

    log_success "Helm charts uninstallation completed!"
    echo ""
    log_info "Remaining releases:"
    helm list
}

# Run main function
main "$@"
