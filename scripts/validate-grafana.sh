#!/bin/bash

# 🔍 Validate Grafana-Prometheus Connection - Convenience Script
# This script validates that Grafana can properly connect to Prometheus

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔍 Validating Grafana-Prometheus connection..."
"$SCRIPT_DIR/monitoring/check-grafana-prometheus-health.sh" "$@"
