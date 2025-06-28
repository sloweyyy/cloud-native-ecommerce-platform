#!/bin/bash

# Validate that Grafana fix is working properly

echo "🔍 Validating Grafana-Prometheus Fix..."
echo ""

# Check ConfigMap
echo "1. Checking ConfigMap configuration..."
if kubectl get configmap grafana -n istio-system -o yaml | grep -q "prometheus-server.monitoring.svc.cluster.local"; then
    echo "   ✅ ConfigMap has correct Prometheus URL"
else
    echo "   ❌ ConfigMap does not have correct Prometheus URL"
    exit 1
fi

# Check Service Bridge
echo "2. Checking service bridge..."
if kubectl get svc prometheus -n istio-system > /dev/null 2>&1; then
    echo "   ✅ Prometheus service bridge exists"
else
    echo "   ❌ Prometheus service bridge missing"
    exit 1
fi

# Check Pod Status
echo "3. Checking Grafana pod status..."
if kubectl get pods -n istio-system -l app.kubernetes.io/name=grafana | grep -q "Running"; then
    echo "   ✅ Grafana pod is running"
else
    echo "   ❌ Grafana pod is not running"
    exit 1
fi

# Test Connectivity
echo "4. Testing connectivity..."
GRAFANA_POD=$(kubectl get pods -n istio-system -l app.kubernetes.io/name=grafana -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [[ -n "$GRAFANA_POD" ]]; then
    if kubectl exec -n istio-system "$GRAFANA_POD" -- curl -s --max-time 5 "http://prometheus-server.monitoring.svc.cluster.local:80/api/v1/query?query=up" > /dev/null 2>&1; then
        echo "   ✅ Grafana can reach Prometheus"
    else
        echo "   ❌ Grafana cannot reach Prometheus"
        exit 1
    fi
else
    echo "   ❌ Cannot find Grafana pod"
    exit 1
fi

echo ""
echo "🎉 All validations passed! Grafana fix is working properly."
echo ""
echo "📊 Access Grafana at: http://localhost:3000"
echo "🔑 Credentials: admin / prom-operator"
