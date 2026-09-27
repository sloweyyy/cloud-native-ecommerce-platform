#!/bin/bash

# Enhanced Docker Compose Startup Script
# Starts the platform with LocalStack S3 and automatic image migration

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Cloud-Native E-Commerce Platform with LocalStack...${NC}"
echo ""

# Start all services
echo -e "${BLUE}📦 Starting Docker Compose services...${NC}"
docker-compose up -d

echo ""
echo -e "${BLUE}⏳ Waiting for services to initialize...${NC}"
sleep 10

# Initialize LocalStack S3
echo ""
echo -e "${BLUE}☁️  Initializing LocalStack S3...${NC}"
if [ -f "scripts/init-localstack-s3.sh" ]; then
    bash scripts/init-localstack-s3.sh ecommerce-product-images http://localhost:4566 frontend/legacy-angular/src/images/products
else
    echo -e "${YELLOW}⚠️  init-localstack-s3.sh not found, skipping S3 initialization${NC}"
fi

# Wait for Catalog API
echo ""
echo -e "${BLUE}⏳ Waiting for Catalog API to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8000/swagger/index.html > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Catalog API is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️  Catalog API may not be ready yet, but continuing...${NC}"
    fi
    sleep 2
done

# Run migration
echo ""
echo -e "${BLUE}🔄 Migrating product images to LocalStack S3...${NC}"
if [ -f "scripts/migrate-images-to-localstack.sh" ]; then
    bash scripts/migrate-images-to-localstack.sh http://localhost:8000 http://localhost:4566
else
    echo -e "${YELLOW}⚠️  migrate-images-to-localstack.sh not found, skipping migration${NC}"
fi

# Display service information
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Platform started successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📋 Services:${NC}"
echo "   🌐 API Gateway: http://localhost:8010"
echo "   📦 Catalog API: http://localhost:8000"
echo "   🛒 Basket API: http://localhost:8001"
echo "   💰 Discount API: http://localhost:8002"
echo "   📝 Ordering API: http://localhost:8003"
echo "   ☁️  LocalStack S3: http://localhost:4566"
echo ""
echo -e "${BLUE}🔍 Monitoring:${NC}"
echo "   📊 Kibana: http://localhost:5601"
echo "   🐰 RabbitMQ: http://localhost:15672 (guest/guest)"
echo "   🔧 Portainer: http://localhost:9000"
echo "   💾 pgAdmin: http://localhost:5050"
echo ""
echo -e "${BLUE}🧪 Verify LocalStack:${NC}"
echo "   bash scripts/verify-localstack.sh"
echo ""
echo -e "${BLUE}📦 Check S3 bucket:${NC}"
echo "   aws --endpoint-url=http://localhost:4566 s3 ls s3://ecommerce-product-images/products/"
echo ""
echo -e "${BLUE}🛑 Stop platform:${NC}"
echo "   docker-compose down"
echo ""
