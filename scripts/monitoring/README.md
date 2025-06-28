# 🔧 Monitoring Scripts

This directory contains scripts for monitoring system management and troubleshooting.

## 📁 Available Scripts

### `setup-grafana-prometheus-connection.sh`

**Purpose**: Sets up proper Grafana-Prometheus connection configuration
**Usage**: `./setup-grafana-prometheus-connection.sh`
**Description**:

- Configures Grafana data source to connect to Prometheus
- Creates service alias for compatibility
- Updates deployment annotations
- Creates monitoring and validation scripts

### `check-grafana-prometheus-health.sh`

**Purpose**: Validates that Grafana-Prometheus connection is working properly
**Usage**: `./check-grafana-prometheus-health.sh`
**Description**:

- Checks ConfigMap configuration
- Verifies service alias exists
- Tests pod connectivity
- Provides comprehensive health status report

### `test-grafana-connectivity.sh`

**Purpose**: Quick connectivity test for Grafana-Prometheus communication
**Usage**: `./test-grafana-connectivity.sh`
**Description**:

- Simple connectivity test
- Returns exit code 0 if healthy, 1 if issues
- Suitable for automated monitoring and CI/CD

## 🚀 Quick Usage

From project root directory:

```bash
# Setup Grafana-Prometheus connection
./scripts/setup-grafana.sh

# Validate Grafana health
./scripts/validate-grafana.sh

# Or run directly from scripts/monitoring/
cd scripts/monitoring
./check-grafana-prometheus-health.sh
```

## 📝 Notes

- Scripts are automatically called by deployment processes
- All scripts include proper error handling and logging
- Convenience scripts are available in the project root
