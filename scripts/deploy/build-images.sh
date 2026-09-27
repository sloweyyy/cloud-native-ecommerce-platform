#!/bin/bash

# Build Docker images for Kubernetes deployment
set -e

echo "🔨 Building Docker images for Kubernetes deployment..."

# Build Catalog API
echo "Building Catalog API..."
docker build -f src/Services/Catalog/Catalog.API/Dockerfile -t eshop/catalog.api:latest .

# Build Basket API  
echo "Building Basket API..."
docker build -f src/Services/Basket/Basket.API/Dockerfile -t eshop/basket.api:latest .

# Build Discount API
echo "Building Discount API..."
docker build -f src/Services/Discount/Discount.API/Dockerfile -t eshop/discount.grpc:latest .

# Build Ordering API
echo "Building Ordering API..."
docker build -f src/Services/Ordering/Ordering.API/Dockerfile -t eshop/ordering.api:latest .

# Build API Gateway
echo "Building API Gateway..."
docker build -f src/ApiGateways/Ocelot.ApiGateway/Dockerfile -t eshop/ocelot.apigw:latest .

echo "✅ All images built successfully!"
echo ""
echo "📋 Built images:"
docker images | grep eshop
