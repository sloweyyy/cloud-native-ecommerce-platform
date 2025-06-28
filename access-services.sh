#!/bin/bash

# 🌐 Service Access Portal - Interactive Menu for All Platform Services
# This script provides easy access to all monitoring, DevOps, and application services
# Compatible with Bash 3.2+ (macOS default)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Service configuration arrays (compatible with older Bash)
SERVICES_KEYS="frontend api-gateway prometheus grafana jaeger kiali rabbitmq kibana elasticsearch minikube-dashboard portainer portainer-edge pgadmin"

# Function to get service URL
get_service_url() {
    case $1 in
        "frontend") echo "http://localhost:4200" ;;
        "api-gateway") echo "http://localhost:8010" ;;
        "prometheus") echo "http://localhost:9090" ;;
        "grafana") echo "http://localhost:3000" ;;
        "jaeger") echo "http://localhost:16686" ;;
        "kiali") echo "http://localhost:20001" ;;
        "rabbitmq") echo "http://localhost:15672" ;;
        "kibana") echo "http://localhost:5601" ;;
        "elasticsearch") echo "http://localhost:9200" ;;
        "minikube-dashboard") echo "minikube dashboard" ;;
        "portainer") echo "http://localhost:9000" ;;
        "portainer-edge") echo "http://localhost:9080" ;;
        "pgadmin") echo "http://localhost:5050" ;;
        *) echo "" ;;
    esac
}

# Function to get service description
get_service_description() {
    case $1 in
        "frontend") echo "Angular E-Commerce Frontend Application" ;;
        "api-gateway") echo "Ocelot API Gateway - Main entry point for all APIs" ;;
        "prometheus") echo "Prometheus Monitoring - Metrics collection and alerting" ;;
        "grafana") echo "Grafana Dashboards - Data visualization and monitoring" ;;
        "jaeger") echo "Jaeger Tracing - Distributed tracing and performance monitoring" ;;
        "kiali") echo "Kiali Service Mesh - Istio service mesh observability" ;;
        "rabbitmq") echo "RabbitMQ Management - Message broker administration" ;;
        "kibana") echo "Kibana Logs - Elasticsearch log visualization" ;;
        "elasticsearch") echo "Elasticsearch - Search and analytics engine" ;;
        "minikube-dashboard") echo "Kubernetes Dashboard - Cluster management interface" ;;
        "portainer") echo "Portainer - Container management platform (Main UI)" ;;
        "portainer-edge") echo "Portainer Edge - Edge agent tunnel server (Advanced)" ;;
        "pgadmin") echo "pgAdmin - PostgreSQL administration tool" ;;
        *) echo "" ;;
    esac
}

# Function to get port forward command
get_port_forward_cmd() {
    case $1 in
        "api-gateway") echo "kubectl port-forward svc/ocelotapigw 8010:80 -n default" ;;
        "prometheus") echo "kubectl port-forward svc/prometheus-server 9090:80 -n monitoring" ;;
        "grafana") echo "kubectl port-forward svc/grafana 3000:3000 -n istio-system" ;;
        "jaeger") echo "kubectl port-forward svc/tracing 16686:80 -n istio-system" ;;
        "kiali") echo "kubectl port-forward svc/kiali 20001:20001 -n istio-system" ;;
        "rabbitmq") echo "kubectl port-forward svc/rabbitmq 15672:15672 -n default" ;;
        "kibana") echo "kubectl port-forward svc/kibana 5601:5601 -n default" ;;
        "elasticsearch") echo "kubectl port-forward svc/elasticsearch 9200:9200 -n default" ;;
        "portainer") echo "kubectl port-forward svc/portainer 9000:9000 -n default" ;;
        "portainer-edge") echo "kubectl port-forward svc/portainer 9080:8000 -n default" ;;
        "pgadmin") echo "kubectl port-forward svc/pgadmin 5050:80 -n default" ;;
        *) echo "" ;;
    esac
}

# Function to get service credentials
get_service_credentials() {
    case $1 in
        "rabbitmq") echo "Username: guest | Password: guest" ;;
        "grafana") echo "Username: admin | Password: prom-operator" ;;
        "pgadmin") echo "Username: admin@example.com | Password: admin1234" ;;
        *) echo "" ;;
    esac
}

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

# Function to display header
display_header() {
    clear
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${WHITE}                    🌐 CLOUD-NATIVE E-COMMERCE PLATFORM                      ${CYAN}║${NC}"
    echo -e "${CYAN}║${WHITE}                         Service Access Portal                               ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Function to check if a service is accessible
check_service_health() {
    local service_name=$1
    local url=$2

    if [[ $url == "minikube dashboard" ]]; then
        if minikube status | grep -q "Running"; then
            return 0
        else
            return 1
        fi
    fi

    if curl -s --max-time 3 "$url" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to display service status
display_service_status() {
    echo -e "${PURPLE}📊 Service Status Check:${NC}"
    echo ""

    for service in $SERVICES_KEYS; do
        local url=$(get_service_url "$service")
        local desc=$(get_service_description "$service")

        printf "%-20s" "$service"

        if check_service_health "$service" "$url"; then
            echo -e "${GREEN}✅ Online${NC}  - $desc"
        else
            echo -e "${RED}❌ Offline${NC} - $desc"
        fi
    done
    echo ""
}

# Function to start port forwards
start_port_forwards() {
    log_info "Starting port forwards for all services..."

    # Kill existing port forwards
    pkill -f "kubectl port-forward" || true
    sleep 2

    # Start port forwards for services that need them
    local services_with_forwards="api-gateway prometheus grafana jaeger kiali rabbitmq kibana elasticsearch portainer portainer-edge pgadmin"

    for service in $services_with_forwards; do
        local cmd=$(get_port_forward_cmd "$service")
        if [[ -n "$cmd" ]]; then
            log_info "Starting port-forward for $service..."
            eval "$cmd > /dev/null 2>&1 &"
        fi
    done

    # Start Angular frontend if not running
    if ! pgrep -f "ng serve" > /dev/null; then
        log_info "Starting Angular frontend..."
        cd client
        npm start > /dev/null 2>&1 &
        cd ..
    fi

    sleep 5
    log_success "All port forwards started!"
}

# Function to stop port forwards
stop_port_forwards() {
    log_info "Stopping all port forwards..."
    pkill -f "kubectl port-forward" || true
    pkill -f "ng serve" || true
    log_success "All port forwards stopped!"
}

# Function to open service in browser
open_service() {
    local service=$1
    local url=$(get_service_url "$service")
    local desc=$(get_service_description "$service")

    if [[ $url == "minikube dashboard" ]]; then
        log_info "Opening Minikube Dashboard..."
        minikube dashboard &
        return
    fi

    # Special handling for portainer-edge (not a web UI)
    if [[ "$service" == "portainer-edge" ]]; then
        log_info "Portainer Edge Agent tunnel server is for remote agent connections"
        log_info "This is not a web interface - it's used by Edge agents to connect"
        log_info "Port forward command: kubectl port-forward svc/portainer 9080:8000 -n default"
        echo -e "${YELLOW}ℹ️  This service is for Edge agent tunneling, not direct browser access${NC}"
        return
    fi

    if check_service_health "$service" "$url"; then
        log_info "Opening $desc..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open "$url"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open "$url"
        else
            log_warning "Please open $url manually in your browser"
        fi

        # Display credentials if available
        local credentials=$(get_service_credentials "$service")
        if [[ -n "$credentials" ]]; then
            echo -e "${YELLOW}🔑 Credentials: $credentials${NC}"
        fi
    else
        log_error "Service $service is not accessible at $url"
        log_info "Try starting port forwards first (option 14)"
    fi
}

# Function to display main menu
display_menu() {
    echo -e "${WHITE}🎯 Available Services:${NC}"
    echo ""
    
    echo -e "${CYAN}📱 APPLICATION SERVICES:${NC}"
    echo "  1) Frontend Application    - Angular E-Commerce UI"
    echo "  2) API Gateway             - Main API entry point"
    echo ""
    
    echo -e "${CYAN}📊 MONITORING STACK:${NC}"
    echo "  3) Prometheus              - Metrics and monitoring"
    echo "  4) Grafana                 - Dashboards and visualization"
    echo "  5) Jaeger                  - Distributed tracing"
    echo "  6) Kiali                   - Service mesh observability"
    echo ""
    
    echo -e "${CYAN}🔧 DEVOPS & INFRASTRUCTURE:${NC}"
    echo "  7) RabbitMQ Management     - Message broker admin"
    echo "  8) Kibana                  - Log analysis and search"
    echo "  9) Elasticsearch           - Search engine"
    echo " 10) Minikube Dashboard      - Kubernetes cluster UI"
    echo ""

    echo -e "${CYAN}🛠️  MANAGEMENT TOOLS:${NC}"
    echo " 11) Portainer              - Container management platform (Main UI)"
    echo " 12) Portainer Edge         - Edge agent tunnel server (Advanced)"
    echo " 13) pgAdmin                - PostgreSQL administration tool"
    echo ""

    echo -e "${CYAN}⚙️  MANAGEMENT OPTIONS:${NC}"
    echo " 14) Start All Port Forwards - Enable access to all services"
    echo " 15) Stop All Port Forwards  - Disable service access"
    echo " 16) Service Status Check    - Check which services are online"
    echo " 17) Open All Monitoring     - Open all monitoring tools"
    echo " 18) Quick Health Check      - Test all API endpoints"
    echo ""
    
    echo -e "${CYAN}🚪 EXIT:${NC}"
    echo "  0) Exit"
    echo ""
}

# Function to open all monitoring services
open_all_monitoring() {
    log_info "Opening all monitoring services..."

    local monitoring_services="prometheus grafana jaeger kiali"

    for service in $monitoring_services; do
        local url=$(get_service_url "$service")
        if check_service_health "$service" "$url"; then
            open_service "$service"
            sleep 1
        else
            log_warning "$service is not accessible"
        fi
    done
}

# Function to run quick health check
quick_health_check() {
    log_info "Running quick health check on all APIs..."
    echo ""
    
    # Check API Gateway
    echo -e "${CYAN}🔗 API Gateway Health:${NC}"
    if curl -s --max-time 5 "http://localhost:8010/" > /dev/null; then
        echo -e "${GREEN}✅ API Gateway${NC} - Responding"
    else
        echo -e "${RED}❌ API Gateway${NC} - Not responding"
    fi
    
    # Check individual APIs through gateway
    local apis=("Catalog/GetAllProducts" "Basket/GetBasket/test" "Discount/TestProduct" "Order/testuser")
    
    for api in "${apis[@]}"; do
        local service_name=$(echo "$api" | cut -d'/' -f1)
        echo -n "  Testing $service_name API... "
        
        if curl -s --max-time 5 "http://localhost:8010/$api" > /dev/null; then
            echo -e "${GREEN}✅ OK${NC}"
        else
            echo -e "${RED}❌ Failed${NC}"
        fi
    done
    
    echo ""
    echo -e "${CYAN}📊 Infrastructure Health:${NC}"
    
    # Check RabbitMQ
    if curl -s --max-time 3 "http://localhost:15672/" > /dev/null; then
        echo -e "${GREEN}✅ RabbitMQ${NC} - Management UI accessible"
    else
        echo -e "${RED}❌ RabbitMQ${NC} - Management UI not accessible"
    fi
    
    # Check Prometheus
    if curl -s --max-time 3 "http://localhost:9090/" > /dev/null; then
        echo -e "${GREEN}✅ Prometheus${NC} - Metrics collection active"
    else
        echo -e "${RED}❌ Prometheus${NC} - Not accessible"
    fi
    
    echo ""
}

# Function to handle user input
handle_menu_choice() {
    local choice=$1

    case $choice in
        1) open_service "frontend" ;;
        2) open_service "api-gateway" ;;
        3) open_service "prometheus" ;;
        4) open_service "grafana" ;;
        5) open_service "jaeger" ;;
        6) open_service "kiali" ;;
        7) open_service "rabbitmq" ;;
        8) open_service "kibana" ;;
        9) open_service "elasticsearch" ;;
        10) open_service "minikube-dashboard" ;;
        11) open_service "portainer" ;;
        12) open_service "portainer-edge" ;;
        13) open_service "pgadmin" ;;
        14) start_port_forwards ;;
        15) stop_port_forwards ;;
        16) display_service_status ;;
        17) open_all_monitoring ;;
        18) quick_health_check ;;
        0)
            log_info "Goodbye! 👋"
            exit 0
            ;;
        *)
            log_error "Invalid choice. Please try again."
            ;;
    esac
}

# Main function
main() {
    while true; do
        display_header
        display_menu

        echo -n -e "${WHITE}Enter your choice (0-18): ${NC}"
        read -r choice
        echo ""

        handle_menu_choice "$choice"

        echo ""
        echo -e "${YELLOW}Press Enter to continue...${NC}"
        read -r
    done
}

# Check prerequisites
check_prerequisites() {
    local missing_tools=()

    for tool in kubectl minikube curl; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done

    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Please install the missing tools and try again."
        exit 1
    fi

    # Check if minikube is running
    if ! minikube status | grep -q "Running"; then
        log_warning "Minikube is not running. Some services may not be accessible."
        log_info "Start minikube with: minikube start"
        echo ""
    fi
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_prerequisites
    main "$@"
fi
