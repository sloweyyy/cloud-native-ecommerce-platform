#!/bin/bash

# Deploy all Kubernetes manifests for e-commerce platform
# This script deploys infrastructure, databases, microservices, monitoring, and management tools

set -e

echo "======================================"
echo "Deploying E-Commerce Platform to K8s"
echo "======================================"

# 1. Deploy Infrastructure Components
echo ""
echo "1. Deploying Infrastructure (RabbitMQ, Elasticsearch, Kibana)..."
kubectl apply -f infrastructure/rabbitmq/rabbitmq.yaml
kubectl apply -f infrastructure/elasticsearch/elasticsearch.yaml
kubectl apply -f infrastructure/kibana/kibana.yaml

# 2. Deploy Databases
echo ""
echo "2. Deploying Databases..."

# Catalog DB (MongoDB)
echo "   - Deploying Catalog DB (MongoDB)..."
kubectl apply -f databases/mongodb.yaml

# Basket DB (Redis)
echo "   - Deploying Basket DB (Redis)..."
kubectl apply -f basket/basket-db/basket-db.yaml

# Discount DB (PostgreSQL)
echo "   - Deploying Discount DB (PostgreSQL)..."
kubectl apply -f discount/discount-db/discount-db.yaml

# Ordering DB (SQL Server)
echo "   - Deploying Ordering DB (SQL Server)..."
kubectl apply -f ordering/ordering-db/ordering-db.yaml

# Wait for databases to be ready
echo ""
echo "3. Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=catalogdb --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=redis --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=sqlserver --timeout=180s || true

# 4. Deploy Microservices
echo ""
echo "4. Deploying Microservices..."

# Catalog API
echo "   - Deploying Catalog API..."
kubectl apply -f catalog/catalog-api/catalog-api.yaml

# Basket API
echo "   - Deploying Basket API..."
kubectl apply -f basket/basket-api/basket-api.yaml

# Discount API
echo "   - Deploying Discount API..."
kubectl apply -f discount/discount-api/discount-api.yaml

# Ordering API
echo "   - Deploying Ordering API..."
kubectl apply -f ordering/ordering-api/ordering-api.yaml

# 5. Deploy API Gateway
echo ""
echo "5. Deploying API Gateway (Ocelot)..."
kubectl apply -f gateway/ocelot-gateway.yaml

# 6. Deploy Monitoring Stack
echo ""
echo "6. Deploying Monitoring Stack (Prometheus)..."
kubectl apply -f monitoring/prometheus/prometheus-rbac.yaml
kubectl apply -f monitoring/prometheus/prometheus-configmap.yaml
kubectl apply -f monitoring/prometheus/prometheus.yaml

# 7. Deploy Management Tools
echo ""
echo "7. Deploying Management Tools (Portainer, pgAdmin)..."
kubectl apply -f management/portainer/portainer-rbac.yaml
kubectl apply -f management/portainer/portainer.yaml
kubectl apply -f management/pgadmin/pgadmin.yaml

# 8. Deploy Service Mesh (Istio)
echo ""
echo "8. Deploying Service Mesh (Istio)..."
if [ ! -d "istio-1.20.0" ]; then
    echo "   Downloading Istio..."
    curl -L https://istio.io/downloadIstio | sh -
fi

# Find the istio directory
ISTIO_DIR=$(find . -maxdepth 1 -name "istio-*" -type d | head -n 1)

echo "   Installing Istio control plane..."
${ISTIO_DIR}/bin/istioctl install --set values.defaultRevision=default -y

echo "   Enabling Istio injection on default namespace..."
kubectl label namespace default istio-injection=enabled --overwrite

echo "   Installing Istio addons (Jaeger, Kiali, Grafana)..."
kubectl apply -f ${ISTIO_DIR}/samples/addons/jaeger.yaml
kubectl apply -f ${ISTIO_DIR}/samples/addons/kiali.yaml
kubectl apply -f ${ISTIO_DIR}/samples/addons/grafana.yaml

echo "   Waiting for Istio components..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=grafana -n istio-system --timeout=600s || echo "   Grafana may not be ready yet"
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=kiali -n istio-system --timeout=600s || echo "   Kiali may not be ready yet"

echo "   Configuring Istio monitoring integration..."
if [ -f "scripts/monitoring/fix-kiali-prometheus-connection.sh" ]; then
    ./scripts/monitoring/fix-kiali-prometheus-connection.sh
else
    echo "   Kiali fix script not found, skipping..."
fi

if [ -f "scripts/monitoring/enable-istio-metrics.sh" ]; then
    ./scripts/monitoring/enable-istio-metrics.sh
else
    echo "   Istio metrics script not found, skipping..."
fi

if [ -f "scripts/setup-grafana.sh" ]; then
    ./scripts/setup-grafana.sh
fi

if [ -f "scripts/monitoring/setup-grafana-prometheus-connection.sh" ]; then
    ./scripts/monitoring/setup-grafana-prometheus-connection.sh > /dev/null 2>&1 || echo "   Grafana setup may have warnings"
fi

echo "   Restarting services to inject Istio sidecars..."
kubectl rollout restart deployment eshopping-catalog
kubectl rollout restart deployment eshopping-basket
kubectl rollout restart deployment eshopping-discount
kubectl rollout restart deployment eshopping-ordering
kubectl rollout restart deployment eshopping-gateway-ocelotapigw

echo "   Waiting for services to restart with sidecars..."
kubectl rollout status deployment eshopping-catalog --timeout=300s
kubectl rollout status deployment eshopping-basket --timeout=300s
kubectl rollout status deployment eshopping-discount --timeout=300s
kubectl rollout status deployment eshopping-ordering --timeout=300s
kubectl rollout status deployment eshopping-gateway-ocelotapigw --timeout=300s

# 9. Deploy Ingress (if exists)
echo ""
echo "9. Deploying Ingress Resources..."
kubectl apply -f ingress/ 2>/dev/null || echo "   No ingress resources found, skipping..."

# Display deployment status
echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo "Checking deployment status..."
kubectl get pods
echo ""
echo "Services:"
kubectl get svc

echo ""
echo "======================================"
echo "Access Points (use kubectl port-forward):"
echo "======================================"
echo "API Gateway (Ocelot):     kubectl port-forward svc/eshopping-gateway-ocelotapigw 8010:80"
echo "Catalog API:              kubectl port-forward svc/eshopping-catalog 8000:80"
echo "Basket API:               kubectl port-forward svc/eshopping-basket 8001:80"
echo "Discount API:             kubectl port-forward svc/eshopping-discount-discount-grpc 8002:8080"
echo "Ordering API:             kubectl port-forward svc/eshopping-ordering 8003:80"
echo "RabbitMQ Management:      kubectl port-forward svc/eshopping-rabbitmq 15672:5672"
echo "Kibana:                   kubectl port-forward svc/eshopping-kibana 5601:5601"
echo "Prometheus:               kubectl port-forward svc/prometheus-server 9090:80 -n monitoring"
echo "Grafana:                  kubectl port-forward svc/grafana 3000:3000 -n istio-system"
echo "Jaeger (Tracing):         kubectl port-forward -n istio-system svc/tracing 16686:80"
echo "Kiali (Service Mesh):     kubectl port-forward -n istio-system svc/kiali 20001:20001"
echo "Portainer:                kubectl port-forward svc/portainer 9000:9000"
echo "pgAdmin:                  kubectl port-forward svc/pgadmin 5050:80"
echo "======================================"
