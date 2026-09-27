#!/bin/bash

# Update Grafana Dashboard for K6 Metrics
# This script updates the K6 dashboard in Grafana using the API

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
log_success() { echo -e "${CYAN}[✓]${NC} $1"; }

# Configuration
GRAFANA_URL="${GRAFANA_URL:-http://localhost:3000}"
GRAFANA_USER="${GRAFANA_USER:-admin}"

# Try to get password from Kubernetes secret if not provided
if [ -z "${GRAFANA_PASSWORD}" ]; then
    GRAFANA_PASSWORD=$(kubectl get secret -n monitoring grafana -o jsonpath='{.data.admin-password}' 2>/dev/null | base64 -d 2>/dev/null || echo "admin")
fi

DASHBOARD_FILE="../../deploy/monitoring/grafana-dashboard-k6.json"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DASHBOARD_PATH="${SCRIPT_DIR}/${DASHBOARD_FILE}"

log_info "========================================"
log_info "  Grafana Dashboard Update Script"
log_info "========================================"
log_info "Grafana URL: ${GRAFANA_URL}"
log_info "Dashboard: ${DASHBOARD_PATH}"
echo ""

# Check if Grafana is accessible
log_info "Checking Grafana connectivity..."
if ! curl -sf "${GRAFANA_URL}/api/health" > /dev/null 2>&1; then
    log_error "Grafana is not accessible at ${GRAFANA_URL}"
    log_info "Please ensure Grafana is running:"
    log_info "  kubectl port-forward -n monitoring svc/grafana 3000:80"
    exit 1
fi
log_success "Grafana is accessible"

# Check if dashboard file exists
if [ ! -f "${DASHBOARD_PATH}" ]; then
    log_error "Dashboard file not found: ${DASHBOARD_PATH}"
    exit 1
fi

# Validate JSON
if ! jq empty "${DASHBOARD_PATH}" 2>/dev/null; then
    log_error "Dashboard file contains invalid JSON"
    exit 1
fi
log_success "Dashboard JSON is valid"

# Read the dashboard JSON
DASHBOARD_JSON=$(cat "${DASHBOARD_PATH}")

# Wrap the dashboard in the Grafana API format
API_JSON=$(jq -n \
  --argjson dashboard "$DASHBOARD_JSON" \
  '{
    dashboard: $dashboard,
    overwrite: true,
    message: "Updated via script"
  }')

# Update the dashboard
log_info "Updating dashboard in Grafana..."
RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -u "${GRAFANA_USER}:${GRAFANA_PASSWORD}" \
  -d "$API_JSON" \
  "${GRAFANA_URL}/api/dashboards/db")

# Check response
if echo "$RESPONSE" | jq -e '.status == "success"' > /dev/null 2>&1; then
    DASHBOARD_URL=$(echo "$RESPONSE" | jq -r '.url')
    log_success "Dashboard updated successfully!"
    log_info ""
    log_info "Dashboard URL: ${GRAFANA_URL}${DASHBOARD_URL}"
    log_info ""
    log_info "The dashboard now includes:"
    log_info "  • Service-based metrics (catalog, basket, ordering)"
    log_info "  • Real-time duration calculations from histograms"
    log_info "  • Request rate per service"
    log_info "  • Error rate percentage"
    log_info "  • Template variables for filtering"
else
    log_error "Failed to update dashboard"
    echo "$RESPONSE" | jq '.'
    exit 1
fi

log_info "========================================"
log_success "Update Complete!"
log_info "========================================"
