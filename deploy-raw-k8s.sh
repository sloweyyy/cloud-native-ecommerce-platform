#!/bin/bash

# Exit on any error
set -e

echo "Deploying Microservices using raw Kubernetes manifests"

# Create namespaces
echo "Creating namespaces..."
kubectl create namespace eshop --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# Deploy infrastructure components
echo "Deploying infrastructure components..."

# Deploy databases
echo "Deploying databases..."
kubectl apply -f Deployments/k8s/catalog/catalog-db/ -n eshop
kubectl apply -f Deployments/k8s/basket/basket-db/ -n eshop
kubectl apply -f Deployments/k8s/ordering/ordering-db/ -n eshop
kubectl apply -f Deployments/k8s/discount/discount-db/ -n eshop

# Wait for databases to be ready
echo "Waiting for databases to be ready..."
kubectl wait --for=condition=ready pods -l app=catalogdb -n eshop --timeout=300s
kubectl wait --for=condition=ready pods -l app=basketdb -n eshop --timeout=300s
kubectl wait --for=condition=ready pods -l app=orderdb -n eshop --timeout=300s
kubectl wait --for=condition=ready pods -l app=discountdb -n eshop --timeout=300s

# Deploy RabbitMQ
echo "Deploying RabbitMQ..."
kubectl apply -f Deployments/k8s/rabbitmq/ -n eshop
kubectl wait --for=condition=ready pods -l app=rabbitmq -n eshop --timeout=300s

# Deploy Elasticsearch and Kibana
echo "Deploying logging infrastructure..."
kubectl apply -f Deployments/k8s/elasticsearch/ -n eshop
kubectl apply -f Deployments/k8s/kibana/ -n eshop
kubectl wait --for=condition=ready pods -l app=elasticsearch -n eshop --timeout=300s
kubectl wait --for=condition=ready pods -l app=kibana -n eshop --timeout=300s

# Deploy monitoring infrastructure
echo "Deploying monitoring infrastructure..."
kubectl apply -f Deployments/k8s/monitoring/prometheus/ -n monitoring
kubectl apply -f Deployments/k8s/monitoring/grafana/ -n monitoring
kubectl wait --for=condition=ready pods -l app=prometheus -n monitoring --timeout=300s
kubectl wait --for=condition=ready pods -l app=grafana -n monitoring --timeout=300s

# Deploy microservices
echo "Deploying microservices..."
kubectl apply -f Deployments/k8s/catalog/catalog-api/ -n eshop
kubectl apply -f Deployments/k8s/basket/basket-api/ -n eshop
kubectl apply -f Deployments/k8s/discount/discount-api/ -n eshop
kubectl apply -f Deployments/k8s/ordering/ordering-api/ -n eshop

# Wait for microservices to be ready
kubectl wait --for=condition=ready pods -l app=catalog-api -n eshop --timeout=300s
kubectl wait --for=condition=ready pods -l app=basket-api -n eshop --timeout=300s
kubectl wait --for=condition=ready pods -l app=discount-api -n eshop --timeout=300s
kubectl wait --for=condition=ready pods -l app=ordering-api -n eshop --timeout=300s

# Deploy API Gateway
echo "Deploying API Gateway..."
kubectl apply -f Deployments/k8s/ocelotapigw/ -n eshop
kubectl wait --for=condition=ready pods -l app=ocelotapigw -n eshop --timeout=300s

# Deploy ingress
echo "Deploying ingress..."
kubectl apply -f Deployments/k8s/ingress/ -n eshop

echo "Deployment completed successfully"
echo ""
echo "Use the following commands to check the status of your deployments:"
echo "  kubectl get pods -n eshop"
echo "  kubectl get svc -n eshop"
echo ""
echo "API Gateway is available at: "
kubectl get svc ocelotapigw -n eshop -o jsonpath="{.status.loadBalancer.ingress[0].ip}:{.spec.ports[0].port}"
echo ""
echo "For monitoring:"
echo "  Prometheus: http://localhost:9090 (kubectl port-forward svc/prometheus -n monitoring 9090:9090)"
echo "  Grafana: http://localhost:3000 (kubectl port-forward svc/grafana -n monitoring 3000:3000)"
echo ""