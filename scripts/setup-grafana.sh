#!/bin/bash

# 🔧 Setup Grafana-Prometheus Connection - Convenience Script
# This script configures Grafana to properly connect to Prometheus

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 Setting up Grafana-Prometheus connection..."
"$SCRIPT_DIR/monitoring/setup-grafana-prometheus-connection.sh" "$@"
