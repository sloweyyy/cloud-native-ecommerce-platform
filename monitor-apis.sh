#!/bin/bash

# API Monitoring Script for Cloud-Native E-Commerce Platform
# This script continuously monitors all APIs and provides real-time status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# API Gateway URL
API_GATEWAY="http://localhost:8010"

# Function to check if a URL is responding
check_api() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ $name${NC} - Status: $response"
        return 0
    else
        echo -e "${RED}❌ $name${NC} - Status: $response (Expected: $expected_status)"
        return 1
    fi
}

# Function to check API with JSON response
check_api_json() {
    local name="$1"
    local url="$2"
    
    response=$(curl -s "$url" 2>/dev/null)
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$status_code" = "200" ] && [ -n "$response" ]; then
        echo -e "${GREEN}✅ $name${NC} - Status: $status_code - Data: $(echo "$response" | jq -c . 2>/dev/null || echo "Valid JSON")"
        return 0
    else
        echo -e "${RED}❌ $name${NC} - Status: $status_code"
        return 1
    fi
}

# Function to test basket operations
test_basket_operations() {
    echo -e "\n${CYAN}🛒 Testing Basket Operations...${NC}"
    
    # Test create basket
    echo "Creating test basket..."
    create_response=$(curl -s -X POST -H "Content-Type: application/json" \
        -d '{"userName":"testuser","items":[{"productId":"602d2149e773f2a3990b47f5","productName":"Test Product","price":100,"quantity":1,"imageFile":"test.jpg"}]}' \
        "$API_GATEWAY/Basket/CreateBasket" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$create_response" ]; then
        echo -e "${GREEN}✅ Create Basket${NC} - Success"
        
        # Test get basket
        get_response=$(curl -s "$API_GATEWAY/Basket/GetBasket/testuser" 2>/dev/null)
        if [ $? -eq 0 ] && [ -n "$get_response" ]; then
            echo -e "${GREEN}✅ Get Basket${NC} - Success"
            
            # Test delete basket
            delete_response=$(curl -s -X DELETE "$API_GATEWAY/Basket/DeleteBasket/testuser" 2>/dev/null)
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Delete Basket${NC} - Success"
            else
                echo -e "${RED}❌ Delete Basket${NC} - Failed"
            fi
        else
            echo -e "${RED}❌ Get Basket${NC} - Failed"
        fi
    else
        echo -e "${RED}❌ Create Basket${NC} - Failed"
    fi
}

# Function to display header
display_header() {
    clear
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    🚀 E-COMMERCE PLATFORM API MONITOR 🚀                    ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo -e "${YELLOW}📅 $(date)${NC}"
    echo ""
}

# Function to check pod status
check_pod_status() {
    echo -e "\n${PURPLE}🔍 Pod Status Check...${NC}"
    
    # Check main application pods
    pods=("catalog" "basket" "discountapi" "ordering" "ocelotapigw")
    
    for pod in "${pods[@]}"; do
        status=$(kubectl get pods -l app.kubernetes.io/name=$pod -o jsonpath='{.items[0].status.phase}' 2>/dev/null)
        if [ "$status" = "Running" ]; then
            echo -e "${GREEN}✅ $pod Pod${NC} - Running"
        else
            echo -e "${RED}❌ $pod Pod${NC} - $status"
        fi
    done
}

# Main monitoring function
run_monitoring() {
    while true; do
        display_header
        
        echo -e "${CYAN}🌐 API Gateway Health Check...${NC}"
        check_api "API Gateway" "$API_GATEWAY/"
        
        echo -e "\n${CYAN}📦 Catalog API Tests...${NC}"
        check_api_json "Get All Products" "$API_GATEWAY/Catalog/GetAllProducts"
        check_api_json "Get All Brands" "$API_GATEWAY/Catalog/GetAllBrands"
        check_api_json "Get All Types" "$API_GATEWAY/Catalog/GetAllTypes"
        
        echo -e "\n${CYAN}🛒 Basket API Tests...${NC}"
        check_api "Basket Health" "$API_GATEWAY/Basket/GetBasket/nonexistent" "200"
        
        echo -e "\n${CYAN}💰 Discount API Tests...${NC}"
        check_api_json "Get Discount" "$API_GATEWAY/Discount/TestProduct"
        
        echo -e "\n${CYAN}📋 Order API Tests...${NC}"
        check_api_json "Get Orders" "$API_GATEWAY/Order/testuser"
        
        # Test basket operations
        test_basket_operations
        
        # Check pod status
        check_pod_status
        
        echo -e "\n${YELLOW}⏰ Next check in 30 seconds... (Press Ctrl+C to stop)${NC}"
        sleep 30
    done
}

# Check if required tools are available
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl is required but not installed.${NC}"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is required but not installed.${NC}"
    exit 1
fi

# Start monitoring
echo -e "${GREEN}🚀 Starting API monitoring...${NC}"
echo -e "${YELLOW}💡 Make sure port forwarding is active: kubectl port-forward service/ocelotapigw 8010:80${NC}"
echo ""

run_monitoring
