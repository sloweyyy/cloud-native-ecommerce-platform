#!/bin/bash

# Enhanced E-Commerce Grafana Dashboard Deployment Script
# This script deploys comprehensive monitoring dashboards for the e-commerce platform

set -e

echo "🚀 Starting Enhanced Grafana Dashboard Deployment..."

# Configuration
GRAFANA_URL="http://localhost:3000"
GRAFANA_API_URL="${GRAFANA_URL}/api"
GRAFANA_USER="admin"
GRAFANA_PASSWORD="prom-operator"
DASHBOARDS_DIR="$(dirname "$0")/dashboards"

# Check if required tools are available
command -v curl >/dev/null 2>&1 || { echo "❌ curl is required but not installed. Aborting." >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "❌ jq is required but not installed. Aborting." >&2; exit 1; }

# Check if dashboards directory exists
if [ ! -d "$DASHBOARDS_DIR" ]; then
    echo "❌ Dashboards directory not found: $DASHBOARDS_DIR"
    exit 1
fi

# Function to check Grafana connection
check_grafana_connection() {
    echo "🔍 Checking Grafana connection..."
    if curl -s -f -u "${GRAFANA_USER}:${GRAFANA_PASSWORD}" "${GRAFANA_API_URL}/health" >/dev/null 2>&1; then
        echo "✅ Grafana is accessible"
        return 0
    else
        echo "❌ Grafana is not accessible at ${GRAFANA_URL}"
        echo "Please ensure Grafana is running and accessible"
        return 1
    fi
}

# Function to create or update dashboard
deploy_dashboard() {
    local dashboard_file="$1"
    local dashboard_name=$(basename "$dashboard_file" .json)
    local dashboard_title=$(jq -r '.dashboard.title' "$dashboard_file")
    
    echo "📊 Deploying dashboard: $dashboard_title"
    
    # Read and process dashboard JSON
    local dashboard_json=$(jq -c '.dashboard' "$dashboard_file")
    
    # Check if dashboard already exists
    local existing_dashboard=$(curl -s -u "${GRAFANA_USER}:${GRAFANA_PASSWORD}" "${GRAFANA_API_URL}/search?type=dash-db&query=${dashboard_title}" | jq -r --arg title "$dashboard_title" '.[] | select(.title == $title) | .uid')
    
    if [ -n "$existing_dashboard" ]; then
        echo "🔄 Updating existing dashboard: $dashboard_title"
        
        # Get current dashboard ID
        local dashboard_id=$(curl -s -u "${GRAFANA_USER}:${GRAFANA_PASSWORD}" "${GRAFANA_API_URL}/dashboards/uid/${existing_dashboard}" | jq -r '.dashboard.id')
        
        # Update dashboard
        local update_response=$(curl -s -X PUT \
            -u "${GRAFANA_USER}:${GRAFANA_PASSWORD}" \
            -H "Content-Type: application/json" \
            -d "{\"dashboard\": $dashboard_json, \"overwrite\": true}" \
            "${GRAFANA_API_URL}/dashboards/${dashboard_id}")
        
        if echo "$update_response" | jq -e '.success' >/dev/null; then
            echo "✅ Dashboard updated successfully"
        else
            echo "❌ Failed to update dashboard: $update_response"
            return 1
        fi
    else
        echo "🆕 Creating new dashboard: $dashboard_title"
        
        # Create new dashboard
        local create_response=$(curl -s -X POST \
            -u "${GRAFANA_USER}:${GRAFANA_PASSWORD}" \
            -H "Content-Type: application/json" \
            -d "{\"dashboard\": $dashboard_json, \"overwrite\": false}" \
            "${GRAFANA_API_URL}/dashboards/db")
        
        if echo "$create_response" | jq -e '.status == "success"' >/dev/null; then
            echo "✅ Dashboard created successfully"
        else
            echo "❌ Failed to create dashboard: $create_response"
            return 1
        fi
    fi
}

# Function to create data sources
setup_data_sources() {
    echo "🔧 Setting up data sources..."
    
    # Check if Prometheus data source exists
    local prometheus_exists=$(curl -s -u "${GRAFANA_USER}:${GRAFANA_PASSWORD}" "${GRAFANA_API_URL}/datasources/name/Prometheus" | jq -r '.id // empty')
    
    if [ -z "$prometheus_exists" ]; then
        echo "📡 Creating Prometheus data source..."
        curl -s -X POST \
            -u "${GRAFANA_USER}:${GRAFANA_PASSWORD}" \
            -H "Content-Type: application/json" \
            -d '{
                "name": "Prometheus",
                "type": "prometheus",
                "access": "proxy",
                "url": "http://prometheus-server.monitoring.svc.cluster.local:80",
                "basicAuth": false,
                "isDefault": true,
                "version": 1
            }' \
            "${GRAFANA_API_URL}/datasources" >/dev/null
        
        echo "✅ Prometheus data source created"
    else
        echo "✅ Prometheus data source already exists"
    fi
    
    # Check if Loki data source exists
    local loki_exists=$(curl -s -u "${GRAFANA_USER}:${GRAFANA_PASSWORD}" "${GRAFANA_API_URL}/datasources/name/Loki" | jq -r '.id // empty')
    
    if [ -z "$loki_exists" ]; then
        echo "📝 Creating Loki data source..."
        curl -s -X POST \
            -u "${GRAFANA_USER}:${GRAFANA_PASSWORD}" \
            -H "Content-Type: application/json" \
            -d '{
                "name": "Loki",
                "type": "loki",
                "access": "proxy",
                "url": "http://loki.monitoring.svc.cluster.local:3100",
                "basicAuth": false,
                "isDefault": false,
                "version": 1
            }' \
            "${GRAFANA_API_URL}/datasources" >/dev/null
        
        echo "✅ Loki data source created"
    else
        echo "✅ Loki data source already exists"
    fi
}

# Function to create folder for e-commerce dashboards
create_folder() {
    echo "📁 Creating e-commerce dashboard folder..."
    
    local folder_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "name": "E-Commerce",
            "uid": "ecommerce",
            "description": "E-Commerce Platform Monitoring Dashboards"
        }' \
        "${GRAFANA_API_URL}/folders")
    
    if echo "$folder_response" | jq -e '.success // .message' >/dev/null; then
        echo "✅ E-Commerce folder created"
    else
        echo "⚠️  Folder might already exist or creation failed"
    fi
}

# Main deployment process
main() {
    echo "🎯 Starting Enhanced E-Commerce Grafana Dashboard Deployment"
    echo "============================================================"
    
    # Check Grafana connection
    if ! check_grafana_connection; then
        exit 1
    fi
    
    # Setup data sources
    setup_data_sources
    
    # Create folder
    create_folder
    
    # Deploy dashboards
    echo "📋 Deploying dashboards..."
    
    local dashboard_files=(
        "ecommerce-service-metrics.json"
        "ecommerce-business-metrics.json"
        "ecommerce-performance-dashboard.json"
    )
    
    for dashboard_file in "${dashboard_files[@]}"; do
        local dashboard_path="${DASHBOARDS_DIR}/${dashboard_file}"
        
        if [ -f "$dashboard_path" ]; then
            deploy_dashboard "$dashboard_path"
        else
            echo "❌ Dashboard file not found: $dashboard_path"
        fi
    done
    
    echo ""
    echo "🎉 Enhanced E-Commerce Grafana Dashboard Deployment Complete!"
    echo "============================================================"
    echo ""
    echo "📊 Deployed Dashboards:"
    echo "   1. E-Commerce Service Request Metrics"
    echo "   2. E-Commerce Business Metrics"
    echo "   3. E-Commerce Performance Dashboard"
    echo ""
    echo "🔗 Access your dashboards at:"
    echo "   ${GRAFANA_URL}"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Ensure your services expose the required metrics"
    echo "   2. Update service annotations to enable metrics collection"
    echo "   3. Customize thresholds and alerts based on your needs"
    echo "   4. Set up alerting for critical metrics"
    echo ""
    echo "🔧 Required Metrics for Enhanced Dashboards:"
    echo "   - HTTP request counts and duration"
    echo "   - Business metrics (orders, revenue, users)"
    echo "   - Database performance metrics"
    echo "   - Cache performance metrics"
    echo "   - Resource utilization metrics"
}

# Run main function
main "$@"