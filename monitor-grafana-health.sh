#!/bin/bash

# Monitor Grafana-Prometheus connectivity
# Run this script to check if the fix is still working

GRAFANA_POD=$(kubectl get pods -n istio-system -l app.kubernetes.io/name=grafana -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [[ -n "$GRAFANA_POD" ]]; then
    echo "🔍 Testing Grafana-Prometheus connectivity..."
    
    if kubectl exec -n istio-system "$GRAFANA_POD" -- curl -s --max-time 5 "http://prometheus-server.monitoring.svc.cluster.local:80/api/v1/query?query=up" > /dev/null 2>&1; then
        echo "✅ Grafana can reach Prometheus - Fix is working!"
        exit 0
    else
        echo "❌ Grafana cannot reach Prometheus - Fix may need reapplication"
        echo "💡 Run: ./deploy.sh to redeploy with permanent fix"
        exit 1
    fi
else
    echo "❌ Grafana pod not found"
    exit 1
fi
