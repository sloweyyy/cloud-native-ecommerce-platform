#!/bin/bash

# Clean up all Kubernetes resources for e-commerce platform

set -e

echo "======================================"
echo "Cleaning up E-Commerce Platform"
echo "======================================"

# Remove Ingress
echo ""
echo "1. Removing Ingress Resources..."
kubectl delete -f ingress/ 2>/dev/null || echo "   No ingress resources found, skipping..."

# Remove Management Tools
echo ""
echo "2. Removing Management Tools..."
kubectl delete -f management/portainer/portainer.yaml 2>/dev/null || true
kubectl delete -f management/portainer/portainer-rbac.yaml 2>/dev/null || true
kubectl delete -f management/pgadmin/pgadmin.yaml 2>/dev/null || true

# Remove Monitoring Stack
echo ""
echo "3. Removing Monitoring Stack..."
kubectl delete -f monitoring/grafana/grafana.yaml 2>/dev/null || true
kubectl delete -f monitoring/prometheus/prometheus.yaml 2>/dev/null || true
kubectl delete -f monitoring/prometheus/prometheus-configmap.yaml 2>/dev/null || true
kubectl delete -f monitoring/prometheus/prometheus-rbac.yaml 2>/dev/null || true

# Remove API Gateway
echo ""
echo "4. Removing API Gateway..."
kubectl delete -f gateway/ocelot-apigw.yaml 2>/dev/null || true
kubectl delete -f gateway/ocelot-configmap.yaml 2>/dev/null || true

# Remove Microservices
echo ""
echo "5. Removing Microservices..."
kubectl delete -f ordering/ordering-api/ordering-api.yaml 2>/dev/null || true
kubectl delete -f basket/basket-api/basket-api.yaml 2>/dev/null || true
kubectl delete -f discount/discount-api/discount-api.yaml 2>/dev/null || true
kubectl delete -f catalog/catalog-api/catalog-api.yaml 2>/dev/null || true

# Remove Databases
echo ""
echo "6. Removing Databases..."
kubectl delete -f ordering/ordering-db/ordering-db.yaml 2>/dev/null || true
kubectl delete -f ordering/ordering-db/sqlserver-configmap.yaml 2>/dev/null || true
kubectl delete -f ordering/ordering-db/sqlserver-secret.yaml 2>/dev/null || true
kubectl delete -f discount/discount-db/discount-db.yaml 2>/dev/null || true
kubectl delete -f discount/discount-db/postgres-configmap.yaml 2>/dev/null || true
kubectl delete -f discount/discount-db/postgres-secret.yaml 2>/dev/null || true
kubectl delete -f basket/basket-db/basket-db.yaml 2>/dev/null || true
kubectl delete -f basket/basket-db/redis-configmap.yaml 2>/dev/null || true
kubectl delete -f catalog/catalog-db/catalog-db.yaml 2>/dev/null || true
kubectl delete -f catalog/catalog-db/mongo-secret.yaml 2>/dev/null || true
kubectl delete -f catalog/catalog-db/mongo-configmap.yaml 2>/dev/null || true

# Remove Infrastructure
echo ""
echo "7. Removing Infrastructure..."
kubectl delete -f infrastructure/kibana/kibana.yaml 2>/dev/null || true
kubectl delete -f infrastructure/elasticsearch/elasticsearch.yaml 2>/dev/null || true
kubectl delete -f infrastructure/elasticsearch/elasticsearch-configmap.yaml 2>/dev/null || true
kubectl delete -f infrastructure/rabbitmq/rabbitmq.yaml 2>/dev/null || true
kubectl delete -f infrastructure/rabbitmq/rabbitmq-configmap.yaml 2>/dev/null || true

echo ""
echo "======================================"
echo "Cleanup Complete!"
echo "======================================"
echo ""
echo "Remaining resources:"
kubectl get all
