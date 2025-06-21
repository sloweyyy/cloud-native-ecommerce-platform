#!/bin/bash

# Quick deployment script for essential services only
set -e

echo "🚀 Quick deployment of essential services..."

# Enable ingress addon
minikube addons enable ingress

# Configure Docker environment
eval $(minikube docker-env)

# Build essential images
echo "Building essential Docker images..."
docker build -t catalogapi:latest -f Services/Catalog/Catalog.API/Dockerfile .
docker build -t basketapi:latest -f Services/Basket/Basket.API/Dockerfile .
docker build -t ocelotapigateway:latest -f ApiGateways/Ocelot.ApiGateway/Dockerfile .

# Tag images
docker tag catalogapi:latest slowey/catalog.api:latest
docker tag basketapi:latest slowey/basket.api:latest
docker tag ocelotapigateway:latest slowey/ocelot.apigw:latest

# Deploy infrastructure
cd Deployments/helm
echo "Installing databases..."
helm install eshopping-catalogdb ./catalogdb --wait --timeout 300s
helm install eshopping-basketdb ./basketdb --wait --timeout 300s

echo "Installing API services..."
helm install eshopping-catalog ./catalog --wait --timeout 300s
helm install eshopping-basket ./basket --wait --timeout 300s
helm install eshopping-gateway ./ocelotapigw --wait --timeout 300s

cd ../..

echo "Setting up port forwarding..."
kubectl port-forward service/ocelotapigw 8010:80 &

echo "✅ Essential services deployed!"
echo "🌐 API Gateway available at http://localhost:8010"
echo "📊 Check status with: kubectl get pods" 