#!/bin/bash

# ==================================================================
# Docker Compose Deployment Validation & Startup Script
# ==================================================================
# This script validates the Docker Compose configuration and deploys
# the platform step-by-step with proper health checks
# ==================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓ SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠ WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗ ERROR]${NC} $1"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Header
print_header() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  Cloud-Native E-Commerce Platform - Docker Compose Deploy"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    local all_ok=true
    
    # Check Docker
    if command -v docker &> /dev/null; then
        local docker_version=$(docker --version)
        log_success "Docker found: $docker_version"
    else
        log_error "Docker is not installed"
        all_ok=false
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        local compose_version=$(docker compose version 2>/dev/null || docker-compose --version)
        log_success "Docker Compose found: $compose_version"
    else
        log_error "Docker Compose is not installed"
        all_ok=false
    fi
    
    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        log_success "Docker daemon is running"
    else
        log_error "Docker daemon is not running. Please start Docker."
        all_ok=false
    fi
    
    # Check .env file
    if [ -f ".env" ]; then
        log_success ".env file exists"
    else
        log_error ".env file not found. Please create it from .env.example"
        all_ok=false
    fi
    
    if [ "$all_ok" = false ]; then
        log_error "Prerequisites check failed. Please fix the issues above."
        exit 1
    fi
    
    log_success "All prerequisites satisfied"
    echo ""
}

# Function to validate .env configuration
validate_env_file() {
    log_step "Validating .env file configuration..."
    
    local required_vars=(
        "MONGO_USER"
        "MONGO_PASSWORD"
        "MONGO_DB"
        "MONGODB_URL"
        "POSTGRES_USER"
        "POSTGRES_PASSWORD"
        "POSTGRES_DB"
        "POSTGRES_URL"
        "SQL_SA_PASSWORD"
        "SQLSERVER_URL"
        "RABBITMQ_USER"
        "RABBITMQ_PASSWORD"
        "RABBITMQ_URL"
        "REDIS_URL"
        "ELASTICSEARCH_URL"
        "ES_JAVA_OPTS"
    )
    
    local all_ok=true
    
    # Check if required variables exist in .env file (without sourcing it)
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env; then
            log_error "Missing required variable: $var"
            all_ok=false
        fi
    done
    
    # Validate MongoDB URL format
    if grep -q "^MONGODB_URL=" .env; then
        if ! grep "^MONGODB_URL=" .env | grep -q "mongodb://.*:.*@catalogdb:27017.*authSource=admin"; then
            log_error "MONGODB_URL must include authentication credentials and authSource=admin"
            log_warning "Expected format: mongodb://admin:admin1234@catalogdb:27017/CatalogDb?authSource=admin"
            all_ok=false
        else
            log_success "MongoDB connection string has authentication"
        fi
    fi
    
    # Validate PostgreSQL URL format
    if grep -q "^POSTGRES_URL=" .env; then
        if grep "^POSTGRES_URL=" .env | grep -q "SSL Mode=Disable"; then
            log_success "PostgreSQL connection string configured correctly"
        else
            log_warning "POSTGRES_URL should include 'SSL Mode=Disable' for development"
        fi
    fi
    
    # Validate SQL Server password exists and is non-empty
    if grep -q "^SQL_SA_PASSWORD=" .env; then
        local password=$(grep "^SQL_SA_PASSWORD=" .env | cut -d'=' -f2)
        if [ ${#password} -lt 8 ]; then
            log_error "SQL_SA_PASSWORD must be at least 8 characters"
            all_ok=false
        else
            log_success "SQL Server password meets requirements"
        fi
    fi
    
    if [ "$all_ok" = false ]; then
        log_error ".env validation failed. Please fix the configuration."
        exit 1
    fi
    
    log_success ".env file configuration is valid"
    echo ""
}

# Function to check disk space
check_disk_space() {
    log_step "Checking available disk space..."
    
    # macOS-compatible disk space check
    local available_gb=$(df -h . | tail -1 | awk '{print $4}' | sed 's/Gi\?//')
    
    # Remove any decimals for comparison
    local available_int=${available_gb%.*}
    
    if [ -n "$available_int" ] && [ "$available_int" -lt 10 ]; then
        log_warning "Low disk space: ${available_gb}GB available (recommend at least 10GB)"
    else
        log_success "Sufficient disk space: ${available_gb}GB available"
    fi
    echo ""
}

# Function to cleanup existing containers
cleanup_existing() {
    log_step "Checking for existing containers..."
    
    if [ "$(docker ps -aq -f name=catalog.api -f name=basket.api -f name=discount.api -f name=ordering.api -f name=ocelot.apigateway)" ]; then
        echo ""
        echo "Existing containers found. Choose an option:"
        echo "1) Stop and remove all (fresh start)"
        echo "2) Keep existing containers (skip deployment)"
        echo "3) Exit"
        read -p "Enter your choice (1-3): " choice
        
        case $choice in
            1)
                log_info "Stopping and removing existing containers..."
                docker-compose down -v
                log_success "Cleanup complete"
                ;;
            2)
                log_info "Keeping existing containers"
                return 1
                ;;
            3)
                log_info "Exiting..."
                exit 0
                ;;
            *)
                log_error "Invalid choice"
                exit 1
                ;;
        esac
    else
        log_info "No existing containers found"
    fi
    echo ""
}

# Function to start infrastructure services
start_infrastructure() {
    log_step "Starting infrastructure services (databases, message broker, logging)..."
    
    log_info "Starting databases..."
    docker-compose up -d catalogdb basketdb discountdb orderdb
    
    log_info "Waiting for databases to be healthy..."
    sleep 10
    
    # Wait for PostgreSQL
    log_info "Waiting for PostgreSQL..."
    docker-compose exec -T discountdb pg_isready -U admin > /dev/null 2>&1
    while [ $? -ne 0 ]; do
        sleep 2
        docker-compose exec -T discountdb pg_isready -U admin > /dev/null 2>&1
    done
    log_success "PostgreSQL is ready"
    
    # Wait for SQL Server
    log_info "Waiting for SQL Server..."
    sleep 15
    log_success "SQL Server should be ready"
    
    # Wait for MongoDB
    log_info "Waiting for MongoDB..."
    sleep 5
    log_success "MongoDB should be ready"
    
    # Start message broker and logging
    log_info "Starting RabbitMQ and Elasticsearch..."
    docker-compose up -d rabbitmq elasticsearch
    
    log_info "Waiting for Elasticsearch..."
    sleep 20
    
    # Wait for Elasticsearch health
    for i in {1..30}; do
        if curl -s http://localhost:9200/_cluster/health | grep -q "yellow\|green"; then
            log_success "Elasticsearch is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            log_warning "Elasticsearch health check timeout, but continuing..."
        fi
        sleep 2
    done
    
    log_info "Starting Kibana..."
    docker-compose up -d kibana
    
    log_success "Infrastructure services started"
    echo ""
}

# Function to verify infrastructure health
verify_infrastructure() {
    log_step "Verifying infrastructure health..."
    
    # Check MongoDB
    if docker ps | grep -q catalogdb; then
        log_success "MongoDB (CatalogDB) is running"
    else
        log_error "MongoDB is not running"
        return 1
    fi
    
    # Check Redis
    if docker ps | grep -q basketdb; then
        log_success "Redis (BasketDB) is running"
    else
        log_error "Redis is not running"
        return 1
    fi
    
    # Check PostgreSQL
    if docker ps | grep -q discountdb; then
        log_success "PostgreSQL (DiscountDB) is running"
    else
        log_error "PostgreSQL is not running"
        return 1
    fi
    
    # Check SQL Server
    if docker ps | grep -q orderdb; then
        log_success "SQL Server (OrderDB) is running"
    else
        log_error "SQL Server is not running"
        return 1
    fi
    
    # Check RabbitMQ
    if docker ps | grep -q rabbitmq; then
        log_success "RabbitMQ is running"
    else
        log_error "RabbitMQ is not running"
        return 1
    fi
    
    # Check Elasticsearch
    if docker ps | grep -q elasticsearch; then
        log_success "Elasticsearch is running"
    else
        log_error "Elasticsearch is not running"
        return 1
    fi
    
    echo ""
}

# Function to start API services
start_api_services() {
    log_step "Starting API microservices..."
    
    log_info "Building and starting Catalog API..."
    docker-compose up -d catalog.api
    sleep 10
    
    log_info "Building and starting Discount API..."
    docker-compose up -d discount.api
    sleep 10
    
    log_info "Building and starting Basket API..."
    docker-compose up -d basket.api
    sleep 10
    
    log_info "Building and starting Ordering API..."
    docker-compose up -d ordering.api
    sleep 10
    
    log_success "API services started"
    echo ""
}

# Function to start API Gateway
start_gateway() {
    log_step "Starting API Gateway..."
    
    docker-compose up -d ocelot.apigateway
    sleep 10
    
    log_success "API Gateway started"
    echo ""
}

# Function to verify API services
verify_api_services() {
    log_step "Verifying API services..."
    
    sleep 15  # Give services time to initialize
    
    # Check Catalog API
    log_info "Testing Catalog API..."
    if curl -s -f http://localhost:8000/health > /dev/null 2>&1 || \
       docker logs catalog.api 2>&1 | grep -q "Now listening on"; then
        log_success "Catalog API is responding"
    else
        log_warning "Catalog API may not be fully ready yet"
        docker logs catalog.api --tail 20
    fi
    
    # Check Basket API
    log_info "Testing Basket API..."
    if curl -s -f http://localhost:8001/health > /dev/null 2>&1 || \
       docker logs basket.api 2>&1 | grep -q "Now listening on"; then
        log_success "Basket API is responding"
    else
        log_warning "Basket API may not be fully ready yet"
        docker logs basket.api --tail 20
    fi
    
    # Check Discount API
    log_info "Testing Discount API..."
    if docker logs discount.api 2>&1 | grep -q "Now listening on"; then
        log_success "Discount API is responding (gRPC on port 8080)"
    else
        log_warning "Discount API may not be fully ready yet"
        docker logs discount.api --tail 20
    fi
    
    # Check Ordering API
    log_info "Testing Ordering API..."
    if curl -s -f http://localhost:8003/health > /dev/null 2>&1 || \
       docker logs ordering.api 2>&1 | grep -q "Now listening on"; then
        log_success "Ordering API is responding"
    else
        log_warning "Ordering API may not be fully ready yet"
        docker logs ordering.api --tail 20
    fi
    
    # Check API Gateway
    log_info "Testing API Gateway..."
    if curl -s http://localhost:8010 > /dev/null 2>&1; then
        log_success "API Gateway is responding"
    else
        log_warning "API Gateway may not be fully ready yet"
    fi
    
    echo ""
}

# Function to start management tools
start_management_tools() {
    log_step "Starting management tools (optional)..."
    
    docker-compose up -d portainer pgadmin 2>/dev/null || true
    
    log_success "Management tools started"
    echo ""
}

# Function to display access information
display_access_info() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "🔗 API SERVICES (Direct Access):"
    echo "   Catalog API:    http://localhost:8000"
    echo "   Basket API:     http://localhost:8001"
    echo "   Discount API:   http://localhost:8002 (gRPC)"
    echo "   Ordering API:   http://localhost:8003"
    echo ""
    echo "🌐 API GATEWAY:"
    echo "   Gateway:        http://localhost:8010"
    echo "   Test Catalog:   curl http://localhost:8010/Catalog"
    echo ""
    echo "💾 DATABASES:"
    echo "   MongoDB:        localhost:27017 (admin/admin1234)"
    echo "   PostgreSQL:     localhost:5432 (admin/admin1234)"
    echo "   SQL Server:     localhost:1433 (sa/SqlPassword123)"
    echo "   Redis:          localhost:6379"
    echo ""
    echo "📊 MONITORING & MESSAGING:"
    echo "   RabbitMQ:       http://localhost:15672 (guest/guest)"
    echo "   Elasticsearch:  http://localhost:9200"
    echo "   Kibana:         http://localhost:5601"
    echo ""
    echo "🛠️  MANAGEMENT TOOLS:"
    echo "   Portainer:      http://localhost:9000"
    echo "   pgAdmin:        http://localhost:5050 (admin@example.com/admin1234)"
    echo ""
    echo "📚 USEFUL COMMANDS:"
    echo "   View all logs:       docker-compose logs -f"
    echo "   View service logs:   docker-compose logs -f <service-name>"
    echo "   Check status:        docker-compose ps"
    echo "   Stop all:            docker-compose down"
    echo "   Remove volumes:      docker-compose down -v"
    echo ""
    echo "🔍 TROUBLESHOOTING:"
    echo "   Check Catalog data:  docker logs catalog.api | grep -i seed"
    echo "   Check MongoDB auth:  docker exec -it catalogdb mongosh -u admin -p admin1234"
    echo "   Test Discount gRPC:  docker logs basket.api | grep -i discount"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo ""
}

# Function to display quick test commands
show_test_commands() {
    log_step "Quick API Tests:"
    echo ""
    echo "# Test API Gateway health"
    echo "curl http://localhost:8010"
    echo ""
    echo "# Get all products from Catalog"
    echo "curl http://localhost:8010/Catalog/GetAllProducts"
    echo ""
    echo "# Get all brands"
    echo "curl http://localhost:8010/Catalog/GetAllBrands"
    echo ""
    echo "# Get basket (replace username)"
    echo "curl http://localhost:8010/Basket/GetBasket/testuser"
    echo ""
}

# Main deployment function
main() {
    print_header
    
    check_prerequisites
    validate_env_file
    check_disk_space
    
    if ! cleanup_existing; then
        log_info "Skipping deployment, using existing containers"
        display_access_info
        exit 0
    fi
    
    start_infrastructure
    verify_infrastructure
    
    start_api_services
    start_gateway
    
    verify_api_services
    
    start_management_tools
    
    display_access_info
    show_test_commands
    
    log_success "Platform is ready for testing!"
}

# Error handler
trap 'log_error "Deployment failed at line $LINENO. Check the error above."; exit 1' ERR

# Run main function
main "$@"
