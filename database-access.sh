#!/bin/bash

# Database Access Script for Cloud-Native E-Commerce Platform
# This script manages port forwarding for all databases

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
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to get database config (Bash 3.2+ compatible)
get_database_config() {
    local db_key=$1
    case $db_key in
        "MongoDB_CatalogDB") echo "catalogdb:27017:27017" ;;
        "PostgreSQL_DiscountDB") echo "discountdb:5432:5432" ;;
        "SQLServer_OrderDB") echo "eshopping-orderdb:1433:1433" ;;
        "Redis_BasketDB") echo "basketdb:6379:6379" ;;
    esac
}

# Function to get database display name (Bash 3.2+ compatible)
get_database_name() {
    local db_key=$1
    case $db_key in
        "MongoDB_CatalogDB") echo "MongoDB (CatalogDB)" ;;
        "PostgreSQL_DiscountDB") echo "PostgreSQL (DiscountDB)" ;;
        "SQLServer_OrderDB") echo "SQL Server (OrderDB)" ;;
        "Redis_BasketDB") echo "Redis (BasketDB)" ;;
    esac
}

# Function to start database port forwards
start_database_forwards() {
    log_info "Starting database port forwards..."

    # Kill existing database port forwards
    pkill -f "kubectl port-forward.*db" || true
    sleep 2

    # Database list (Bash 3.2+ compatible)
    local databases="MongoDB_CatalogDB PostgreSQL_DiscountDB SQLServer_OrderDB Redis_BasketDB"

    # Start port forwards for each database
    for db_key in $databases; do
        local db_name=$(get_database_name "$db_key")
        local config=$(get_database_config "$db_key")
        IFS=':' read -r service local_port remote_port <<< "$config"

        log_info "Starting port-forward for $db_name ($service)..."

        # Check if port is already in use
        if check_port $local_port; then
            log_warning "Port $local_port is already in use. Attempting to free it..."
            lsof -ti:$local_port | xargs kill -9 2>/dev/null || true
            sleep 1
        fi

        # Start port forward
        kubectl port-forward svc/$service $local_port:$remote_port -n default > /dev/null 2>&1 &

        # Verify the port forward started
        sleep 2
        if check_port $local_port; then
            log_success "$db_name accessible on localhost:$local_port"
        else
            log_error "Failed to start port-forward for $db_name"
        fi
    done

    echo ""
    log_success "Database port forwards setup complete!"
}

# Function to stop database port forwards
stop_database_forwards() {
    log_info "Stopping database port forwards..."
    pkill -f "kubectl port-forward.*db" || true
    log_success "Database port forwards stopped!"
}

# Function to check database status
check_database_status() {
    echo ""
    log_info "Checking database connectivity..."
    echo ""
    
    # MongoDB (CatalogDB)
    echo -e "${CYAN}📊 MongoDB (CatalogDB)${NC}"
    echo "   Host: localhost"
    echo "   Port: 27017"
    echo "   Username: admin"
    echo "   Password: admin1234"
    echo "   Database: CatalogDb"
    if check_port 27017; then
        echo -e "   Status: ${GREEN}✅ Accessible${NC}"
    else
        echo -e "   Status: ${RED}❌ Not accessible${NC}"
    fi
    echo ""

    # PostgreSQL (DiscountDB)
    echo -e "${CYAN}📊 PostgreSQL (DiscountDB)${NC}"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Username: admin"
    echo "   Password: admin1234"
    echo "   Database: DiscountDb"
    if check_port 5432; then
        echo -e "   Status: ${GREEN}✅ Accessible${NC}"
    else
        echo -e "   Status: ${RED}❌ Not accessible${NC}"
    fi
    echo ""

    # SQL Server (OrderDB)
    echo -e "${CYAN}📊 SQL Server (OrderDB)${NC}"
    echo "   Host: localhost"
    echo "   Port: 1433"
    echo "   Username: sa"
    echo "   Password: SqlPassword123"
    echo "   Database: OrderDb"
    if check_port 1433; then
        echo -e "   Status: ${GREEN}✅ Accessible${NC}"
    else
        echo -e "   Status: ${RED}❌ Not accessible${NC}"
    fi
    echo ""

    # Redis (BasketDB)
    echo -e "${CYAN}📊 Redis (BasketDB)${NC}"
    echo "   Host: localhost"
    echo "   Port: 6379"
    echo "   Authentication: None required"
    if check_port 6379; then
        echo -e "   Status: ${GREEN}✅ Accessible${NC}"
    else
        echo -e "   Status: ${RED}❌ Not accessible${NC}"
    fi
    echo ""
}

# Function to display menu
display_menu() {
    clear
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    🗄️  DATABASE ACCESS MANAGER                              ║${NC}"
    echo -e "${CYAN}║                   Cloud-Native E-Commerce Platform                          ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}🎯 Database Management Options:${NC}"
    echo ""
    echo "  1) Start Database Port Forwards  - Enable database access"
    echo "  2) Stop Database Port Forwards   - Disable database access"
    echo "  3) Check Database Status         - View connection details"
    echo "  4) Show Connection Details       - Display DataGrip settings"
    echo ""
    echo -e "${RED}  0) Exit${NC}"
    echo ""
}

# Function to show connection details for DataGrip
show_connection_details() {
    echo ""
    log_info "DataGrip Connection Details:"
    echo ""
    
    echo -e "${CYAN}🍃 MongoDB (Catalog Database)${NC}"
    echo "   Database Type: MongoDB"
    echo "   Host: localhost"
    echo "   Port: 27017"
    echo "   Database: CatalogDb"
    echo "   Username: admin"
    echo "   Password: admin1234"
    echo "   Authentication Database: admin"
    echo ""
    
    echo -e "${CYAN}🐘 PostgreSQL (Discount Database)${NC}"
    echo "   Database Type: PostgreSQL"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: DiscountDb"
    echo "   Username: admin"
    echo "   Password: admin1234"
    echo ""
    
    echo -e "${CYAN}🗄️ SQL Server (Order Database)${NC}"
    echo "   Database Type: SQL Server"
    echo "   Host: localhost"
    echo "   Port: 1433"
    echo "   Database: OrderDb"
    echo "   Username: sa"
    echo "   Password: SqlPassword123"
    echo "   Note: Enable 'Trust Server Certificate' if SSL errors occur"
    echo ""
    
    echo -e "${CYAN}🔴 Redis (Basket Database)${NC}"
    echo "   Database Type: Redis"
    echo "   Host: localhost"
    echo "   Port: 6379"
    echo "   Authentication: None required"
    echo "   Note: Use Redis plugin for DataGrip or dedicated Redis client"
    echo ""
}

# Main menu loop
main() {
    while true; do
        display_menu
        echo -n "Enter your choice (0-4): "
        read -r choice
        
        case $choice in
            1)
                start_database_forwards
                echo ""
                echo "Press Enter to continue..."
                read -r
                ;;
            2)
                stop_database_forwards
                echo ""
                echo "Press Enter to continue..."
                read -r
                ;;
            3)
                check_database_status
                echo "Press Enter to continue..."
                read -r
                ;;
            4)
                show_connection_details
                echo "Press Enter to continue..."
                read -r
                ;;
            0)
                log_info "Goodbye! 👋"
                exit 0
                ;;
            *)
                log_error "Invalid choice. Please try again."
                sleep 2
                ;;
        esac
    done
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if we can connect to Kubernetes cluster
if ! kubectl cluster-info &> /dev/null; then
    log_error "Cannot connect to Kubernetes cluster. Make sure minikube is running."
    exit 1
fi

# Run main function
main
