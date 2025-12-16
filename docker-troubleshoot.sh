#!/bin/bash

# ==================================================================
# Docker Compose - Troubleshooting & Validation Script
# ==================================================================
# This script helps diagnose common issues with the Docker Compose deployment
# ==================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_section() { echo -e "${CYAN}══════════════════════════════════════${NC}\n${CYAN}$1${NC}\n${CYAN}══════════════════════════════════════${NC}"; }

# Check container status
check_containers() {
    log_section "Container Status"
    
    services=("catalogdb" "basketdb" "discountdb" "orderdb" "rabbitmq" "elasticsearch" "catalog.api" "basket.api" "discount.api" "ordering.api" "ocelot.apigateway")
    
    for service in "${services[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^${service}$"; then
            status=$(docker inspect --format='{{.State.Status}}' $service)
            if [ "$status" = "running" ]; then
                log_success "$service is running"
            else
                log_warning "$service is $status"
            fi
        else
            log_error "$service is not running"
        fi
    done
    echo ""
}

# Check database connections
check_databases() {
    log_section "Database Connectivity"
    
    # MongoDB
    log_info "Testing MongoDB connection..."
    if docker exec catalogdb mongosh --quiet --eval "db.adminCommand('ping')" -u admin -p admin1234 --authenticationDatabase admin > /dev/null 2>&1; then
        log_success "MongoDB connection successful"
        
        # Check if catalog database exists
        db_exists=$(docker exec catalogdb mongosh --quiet --eval "db.getMongo().getDBNames()" -u admin -p admin1234 --authenticationDatabase admin 2>/dev/null | grep -c "CatalogDb" || echo "0")
        if [ "$db_exists" -gt 0 ]; then
            log_success "CatalogDb database exists"
            
            # Check product count
            product_count=$(docker exec catalogdb mongosh CatalogDb --quiet --eval "db.Products.countDocuments()" -u admin -p admin1234 --authenticationDatabase admin 2>/dev/null || echo "0")
            if [ "$product_count" -gt 0 ]; then
                log_success "Products seeded: $product_count products found"
            else
                log_warning "No products found in database - seed data may not have loaded"
            fi
        else
            log_warning "CatalogDb database not found"
        fi
    else
        log_error "MongoDB connection failed - check credentials or container status"
    fi
    
    # PostgreSQL
    log_info "Testing PostgreSQL connection..."
    if docker exec discountdb psql -U admin -d DiscountDb -c "SELECT 1" > /dev/null 2>&1; then
        log_success "PostgreSQL connection successful"
        
        # Check if Coupon table exists
        table_exists=$(docker exec discountdb psql -U admin -d DiscountDb -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='coupon'" 2>/dev/null | tr -d ' ' || echo "0")
        if [ "$table_exists" -gt 0 ]; then
            log_success "Coupon table exists"
            
            coupon_count=$(docker exec discountdb psql -U admin -d DiscountDb -t -c "SELECT COUNT(*) FROM Coupon" 2>/dev/null | tr -d ' ' || echo "0")
            log_success "Coupons in database: $coupon_count"
        else
            log_warning "Coupon table not found - migrations may not have run"
        fi
    else
        log_error "PostgreSQL connection failed"
    fi
    
    # SQL Server
    log_info "Testing SQL Server connection..."
    if docker exec orderdb /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P SqlPassword123 -Q "SELECT 1" -C > /dev/null 2>&1; then
        log_success "SQL Server connection successful"
    else
        log_error "SQL Server connection failed"
    fi
    
    # Redis
    log_info "Testing Redis connection..."
    if docker exec basketdb redis-cli ping > /dev/null 2>&1; then
        log_success "Redis connection successful"
    else
        log_error "Redis connection failed"
    fi
    
    echo ""
}

# Check API endpoints
check_apis() {
    log_section "API Endpoint Health"
    
    # Catalog API
    log_info "Testing Catalog API (port 8000)..."
    if response=$(curl -s -w "\n%{http_code}" http://localhost:8000/health 2>/dev/null); then
        http_code=$(echo "$response" | tail -1)
        if [ "$http_code" = "200" ]; then
            log_success "Catalog API health endpoint responding"
        fi
    else
        log_warning "Catalog API health endpoint not available, checking if service is running..."
        if docker logs catalog.api 2>&1 | grep -q "Now listening on"; then
            log_success "Catalog API is running (no health endpoint configured)"
        else
            log_error "Catalog API may have startup issues"
        fi
    fi
    
    # Basket API
    log_info "Testing Basket API (port 8001)..."
    if docker logs basket.api 2>&1 | grep -q "Now listening on"; then
        log_success "Basket API is running"
    else
        log_error "Basket API may have startup issues"
    fi
    
    # Discount API (gRPC)
    log_info "Testing Discount API (gRPC port 8080)..."
    if docker logs discount.api 2>&1 | grep -q "Now listening on.*8080"; then
        log_success "Discount API is running on port 8080 (gRPC)"
    else
        log_warning "Discount API may not be listening on port 8080"
        log_info "Checking Discount API logs:"
        docker logs discount.api --tail 10
    fi
    
    # Ordering API
    log_info "Testing Ordering API (port 8003)..."
    if docker logs ordering.api 2>&1 | grep -q "Now listening on"; then
        log_success "Ordering API is running"
    else
        log_error "Ordering API may have startup issues"
    fi
    
    # API Gateway
    log_info "Testing API Gateway (port 8010)..."
    if curl -s http://localhost:8010 > /dev/null 2>&1; then
        log_success "API Gateway is responding"
    else
        log_error "API Gateway is not responding"
    fi
    
    echo ""
}

# Test critical integrations
test_integrations() {
    log_section "Integration Tests"
    
    # Test Catalog API through Gateway
    log_info "Testing Catalog API through Gateway..."
    if response=$(curl -s http://localhost:8010/Catalog/GetAllBrands 2>/dev/null); then
        if echo "$response" | grep -q "id\|name\|Name"; then
            log_success "Catalog API responding through Gateway with data"
        else
            log_warning "Catalog API responding but may not have data"
        fi
    else
        log_error "Cannot reach Catalog API through Gateway"
    fi
    
    # Test Basket-Discount gRPC integration
    log_info "Testing Basket-Discount gRPC integration..."
    if docker logs basket.api 2>&1 | grep -q "discount.api:8080"; then
        log_success "Basket API is configured to use Discount API on port 8080"
    else
        log_warning "Basket API may not be configured correctly for Discount gRPC"
    fi
    
    # Test RabbitMQ connectivity
    log_info "Testing RabbitMQ connectivity..."
    if curl -s -u guest:guest http://localhost:15672/api/overview > /dev/null 2>&1; then
        log_success "RabbitMQ Management API is accessible"
    else
        log_warning "RabbitMQ Management API is not accessible"
    fi
    
    # Test Elasticsearch connectivity
    log_info "Testing Elasticsearch connectivity..."
    if response=$(curl -s http://localhost:9200/_cluster/health 2>/dev/null); then
        status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        if [ "$status" = "green" ] || [ "$status" = "yellow" ]; then
            log_success "Elasticsearch cluster health: $status"
        else
            log_warning "Elasticsearch cluster health: $status"
        fi
    else
        log_error "Cannot connect to Elasticsearch"
    fi
    
    echo ""
}

# Check environment configuration
check_environment() {
    log_section "Environment Configuration"
    
    if [ ! -f ".env" ]; then
        log_error ".env file not found!"
        return 1
    fi
    
    source .env
    
    # Check MongoDB URL
    if [[ $MONGODB_URL =~ ^mongodb://.*:.*@catalogdb:27017.*authSource=admin ]]; then
        log_success "MONGODB_URL has correct authentication format"
    else
        log_error "MONGODB_URL missing authentication or authSource parameter"
        echo "   Current: $MONGODB_URL"
        echo "   Expected: mongodb://admin:admin1234@catalogdb:27017/CatalogDb?authSource=admin"
    fi
    
    # Check PostgreSQL URL
    if [[ $POSTGRES_URL =~ "SSL Mode=Disable" ]]; then
        log_success "POSTGRES_URL has SSL Mode=Disable"
    else
        log_warning "POSTGRES_URL should include 'SSL Mode=Disable'"
    fi
    
    # Check Discount port configuration
    if docker-compose config | grep -A5 "basket.api" | grep -q "discount.api:8080"; then
        log_success "Basket API configured to use Discount on port 8080"
    else
        log_error "Basket API not configured correctly for Discount gRPC port"
    fi
    
    # Check Elasticsearch version
    es_version=$(docker-compose config | grep -A1 "elasticsearch:" | grep "image:" | grep -o "7\.9\.2\|8\.14\.3")
    if [ "$es_version" = "7.9.2" ]; then
        log_success "Elasticsearch version: 7.9.2 (matches Helm)"
    else
        log_warning "Elasticsearch version: $es_version (Helm uses 7.9.2)"
    fi
    
    echo ""
}

# Show recent errors
show_errors() {
    log_section "Recent Errors in Logs"
    
    services=("catalog.api" "basket.api" "discount.api" "ordering.api" "ocelot.apigateway")
    
    for service in "${services[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^${service}$"; then
            errors=$(docker logs $service 2>&1 | grep -i "error\|exception\|fail" | tail -5)
            if [ ! -z "$errors" ]; then
                log_warning "Errors in $service:"
                echo "$errors"
                echo ""
            fi
        fi
    done
}

# Performance check
check_performance() {
    log_section "Resource Usage"
    
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep -E "catalog|basket|discount|order|ocelot|mongo|postgres|redis|rabbit|elastic"
    echo ""
}

# Main menu
show_menu() {
    echo ""
    echo "Docker Compose Troubleshooting Menu"
    echo "===================================="
    echo "1) Full diagnostic report"
    echo "2) Check container status"
    echo "3) Check database connections"
    echo "4) Check API endpoints"
    echo "5) Test integrations"
    echo "6) Check environment configuration"
    echo "7) Show recent errors"
    echo "8) Check resource usage"
    echo "9) View service logs (interactive)"
    echo "0) Exit"
    echo ""
}

# Interactive log viewer
view_logs() {
    echo ""
    echo "Select service to view logs:"
    echo "1) catalog.api"
    echo "2) basket.api"
    echo "3) discount.api"
    echo "4) ordering.api"
    echo "5) ocelot.apigateway"
    echo "6) catalogdb (MongoDB)"
    echo "7) discountdb (PostgreSQL)"
    echo "8) orderdb (SQL Server)"
    echo "9) rabbitmq"
    echo "10) elasticsearch"
    echo ""
    read -p "Enter choice (1-10): " service_choice
    
    case $service_choice in
        1) docker logs -f catalog.api ;;
        2) docker logs -f basket.api ;;
        3) docker logs -f discount.api ;;
        4) docker logs -f ordering.api ;;
        5) docker logs -f ocelot.apigateway ;;
        6) docker logs -f catalogdb ;;
        7) docker logs -f discountdb ;;
        8) docker logs -f orderdb ;;
        9) docker logs -f rabbitmq ;;
        10) docker logs -f elasticsearch ;;
        *) log_error "Invalid choice" ;;
    esac
}

# Full diagnostic
full_diagnostic() {
    check_containers
    check_environment
    check_databases
    check_apis
    test_integrations
    show_errors
    check_performance
}

# Main
if [ "$1" = "--auto" ]; then
    full_diagnostic
else
    while true; do
        show_menu
        read -p "Enter choice: " choice
        
        case $choice in
            1) full_diagnostic ;;
            2) check_containers ;;
            3) check_databases ;;
            4) check_apis ;;
            5) test_integrations ;;
            6) check_environment ;;
            7) show_errors ;;
            8) check_performance ;;
            9) view_logs ;;
            0) exit 0 ;;
            *) log_error "Invalid choice" ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
fi
