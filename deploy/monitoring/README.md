# 📊 Monitoring Deployments

This directory contains monitoring-related deployment configurations and permanent fixes for the Cloud-Native E-Commerce Platform.

## 📁 Directory Structure

### `grafana/`

Contains Grafana-specific configuration files and connection setup:

- `grafana-configmap-fixed.yaml` - **Permanent fix** for Prometheus data source configuration
- `prometheus-service-alias.yaml` - Service alias for Prometheus compatibility
- `grafana-helm-values.yaml` - Helm values file for future Grafana deployments

## 🔧 Recent Updates & Fixes

### ✅ **Grafana-Prometheus Connection Fix**

**Problem Solved**: Grafana was unable to connect to Prometheus due to incorrect service URL configuration.

**Solution Implemented**:

1. **Fixed ConfigMap**: Updated Prometheus URL to `http://prometheus-server.monitoring.svc.cluster.local:80`
2. **Service Alias**: Created service alias for backward compatibility
3. **Helm Values**: Prepared values file for permanent deployment
4. **Validation Scripts**: Added monitoring and validation tools

### 🚀 **Automatic Usage**

These files are automatically used by the deployment and fix scripts:

- `./deploy.sh` - Applies fixes during deployment
- `./validate-grafana-fix.sh` - Validates the connection
- `./monitor-grafana-health.sh` - Monitors Grafana health

### 🔧 **Manual Application (if needed)**

```bash
# Apply Grafana ConfigMap with correct Prometheus connection
kubectl apply -f grafana/grafana-configmap-fixed.yaml

# Restart Grafana to pick up changes
kubectl rollout restart deployment/grafana -n istio-system

# Validate the fix
./validate-grafana-fix.sh

# Apply Prometheus service alias
kubectl apply -f grafana/prometheus-service-alias.yaml
```

## 📝 Notes

- These configurations ensure Grafana can connect to Prometheus properly
- The fix is automatically applied during deployment via `deploy.sh`
- Files are organized here to keep the project root clean
