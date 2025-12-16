#!/bin/bash

# 🚀 Complete Cloud-Native E-Commerce Platform Deployment Script
# This script deploys the entire platform with all fixes applied

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if required tools are installed
    for tool in minikube helm kubectl docker; do
        if ! command -v $tool &> /dev/null; then
            log_error "$tool is not installed. Please install it first."
            exit 1
        fi
    done
    
    log_success "All required tools are available"
}

# Function to check and handle existing Helm releases
check_existing_deployments() {
    log_info "Checking for existing Helm deployments..."
    
    EXISTING_RELEASES=$(helm list -n default -q 2>/dev/null | grep -c "eshopping-" || echo "0")
    
    if [ "$EXISTING_RELEASES" -gt 0 ]; then
        log_warning "Found $EXISTING_RELEASES existing Helm releases"
        echo ""
        echo "Options:"
        echo "1) Upgrade existing releases (recommended for updates)"
        echo "2) Delete all and reinstall (fresh deployment)"
        echo "3) Skip deployment (keep existing)"
        echo "4) Exit"
        echo ""
        read -p "Enter your choice (1-4): " choice
        
        case $choice in
            1)
                log_info "Will upgrade existing releases..."
                DEPLOYMENT_MODE="upgrade"
                ;;
            2)
                log_warning "Deleting all existing releases..."
                helm list -n default -q | grep "eshopping-" | xargs -r helm uninstall -n default
                log_success "Cleanup complete"
                DEPLOYMENT_MODE="install"
                ;;
            3)
                log_info "Skipping deployment, using existing infrastructure..."
                DEPLOYMENT_MODE="skip"
                ;;
            4)
                log_info "Exiting..."
                exit 0
                ;;
            *)
                log_error "Invalid choice"
                exit 1
                ;;
        esac
    else
        log_info "No existing deployments found"
        DEPLOYMENT_MODE="install"
    fi
}

# Function to start minikube
start_minikube() {
    log_info "Starting minikube..."
    
    # Check if minikube is already running
    if minikube status | grep -q "Running"; then
        log_warning "Minikube is already running"
        return 0
    fi
    
    # Start minikube with increased configuration for better stability
    minikube start --driver=docker --memory=10240 --cpus=8 --disk-size=80g
    
    # Enable required addons
    log_info "Enabling minikube addons..."
    minikube addons enable ingress
    minikube addons enable dashboard
    minikube addons enable metrics-server
    
    log_success "Minikube started successfully"
}

# Function to build Docker images
build_images() {
    log_info "Building Docker images..."
    
    # Configure Docker environment to use minikube
    eval $(minikube docker-env)
    
    # Build all microservice images
    log_info "Building Catalog API..."
    docker build -t catalogapi:latest -f Services/Catalog/Catalog.API/Dockerfile .
    
    log_info "Building Basket API..."
    docker build -t basketapi:latest -f Services/Basket/Basket.API/Dockerfile .
    
    log_info "Building Discount API..."
    docker build -t discountapi:latest -f Services/Discount/Discount.API/Dockerfile .
    
    log_info "Building Ordering API..."
    docker build -t orderingapi:latest -f Services/Ordering/Ordering.API/Dockerfile .
    
    log_info "Building API Gateway..."
    docker build -t ocelotapigateway:latest -f ApiGateways/Ocelot.ApiGateway/Dockerfile .
    
    # Tag images for Kubernetes
    log_info "Tagging images for Kubernetes..."
    docker tag catalogapi:latest eshop/catalog.api:latest
    docker tag basketapi:latest eshop/basket.api:latest
    docker tag discountapi:latest eshop/discount.grpc:latest
    docker tag orderingapi:latest eshop/ordering.api:latest
    docker tag ocelotapigateway:latest eshop/ocelot.apigw:latest
    
    log_success "All Docker images built and tagged successfully"
}

# Function to deploy infrastructure services
deploy_infrastructure() {
    if [ "$DEPLOYMENT_MODE" = "skip" ]; then
        log_info "Skipping infrastructure deployment (using existing)"
        return 0
    fi
    
    log_info "Deploying infrastructure services..."
    
    cd Deployments/helm
    
    HELM_CMD="install"
    if [ "$DEPLOYMENT_MODE" = "upgrade" ]; then
        HELM_CMD="upgrade --install"
    fi
    
    # Install databases with increased timeout
    log_info "Installing databases..."
    helm $HELM_CMD eshopping-basketdb ./basketdb --namespace default --timeout 600s
    helm $HELM_CMD eshopping-catalogdb ./catalogdb --namespace default --timeout 600s
    helm $HELM_CMD eshopping-discountdb ./discountdb --namespace default --timeout 600s
    helm $HELM_CMD eshopping-orderdb ./orderdb --namespace default --timeout 600s
    
    # Install message broker
    log_info "Installing RabbitMQ..."
    helm $HELM_CMD eshopping-rabbitmq ./rabbitmq --namespace default --timeout 600s
    
    # Install logging stack
    log_info "Installing logging stack..."
    helm $HELM_CMD eshopping-elasticsearch ./elasticsearch --namespace default --timeout 600s
    helm $HELM_CMD eshopping-kibana ./kibana --namespace default --timeout 600s

    # Install management tools
    log_info "Installing management tools..."
    helm $HELM_CMD eshopping-portainer ./portainer --namespace default --timeout 600s
    helm $HELM_CMD eshopping-pgadmin ./pgadmin --namespace default --timeout 600s

    # Wait for management tools to be ready
    log_info "Waiting for management tools to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=portainer -n default --timeout=600s || log_warning "Portainer pod may not be ready yet"
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=pgadmin -n default --timeout=600s || log_warning "pgAdmin pod may not be ready yet"

    cd ../..

    log_success "Infrastructure services deployed"
}

# Function to wait for pods to be ready
wait_for_pods() {
    log_info "Waiting for infrastructure pods to be ready..."
    kubectl wait --for=condition=ready pod --all --timeout=900s -n default
    log_success "All infrastructure pods are ready"
}

# Function to deploy API services
deploy_apis() {
    if [ "$DEPLOYMENT_MODE" = "skip" ]; then
        log_info "Skipping API deployment (using existing)"
        return 0
    fi
    
    log_info "Deploying API microservices..."
    
    cd Deployments/helm
    
    HELM_CMD="install"
    if [ "$DEPLOYMENT_MODE" = "upgrade" ]; then
        HELM_CMD="upgrade --install"
    fi
    
    # Install microservices with increased timeout
    helm $HELM_CMD eshopping-catalog ./catalog --namespace default --timeout 600s
    helm $HELM_CMD eshopping-basket ./basket --namespace default --timeout 600s
    helm $HELM_CMD eshopping-discount ./discount --namespace default --timeout 600s
    helm $HELM_CMD eshopping-ordering ./ordering --namespace default --timeout 600s
    helm $HELM_CMD eshopping-gateway ./ocelotapigw --namespace default --timeout 600s
    
    cd ../..
    
    log_success "API microservices deployed"
}

# Function to deploy monitoring stack
deploy_monitoring() {
    
    log_info "Deploying monitoring stack..." 
    
    # Create monitoring namespace
    kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
    
    # Install Prometheus
    log_info "Installing Prometheus..."
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
    helm repo update
    
    # Check if Prometheus exists and upgrade or install
    if helm list -n monitoring -q | grep -q "^prometheus$"; then
        log_info "Upgrading existing Prometheus installation..."
        helm upgrade prometheus prometheus-community/prometheus --namespace monitoring --timeout 600s
    else
        log_info "Installing new Prometheus..."
        helm install prometheus prometheus-community/prometheus --namespace monitoring --timeout 600s
    fi
    
    # Install Istio and addons
    log_info "Installing Istio..."
    if [ ! -d "istio-1.20.0" ]; then
        curl -L https://istio.io/downloadIstio | sh -
    fi
    
    # Find the istio directory
    ISTIO_DIR=$(find . -maxdepth 1 -name "istio-*" -type d | head -n 1)
    
    ${ISTIO_DIR}/bin/istioctl install --set values.defaultRevision=default -y
    
    # Install Istio addons
    log_info "Installing Istio addons..."
    kubectl apply -f ${ISTIO_DIR}/samples/addons/grafana.yaml
    kubectl apply -f ${ISTIO_DIR}/samples/addons/jaeger.yaml
    kubectl apply -f ${ISTIO_DIR}/samples/addons/kiali.yaml

    # Wait for Grafana pod to be ready
    log_info "Waiting for Grafana to be ready..."
    kubectl wait --for=condition=ready pod -l app=grafana -n istio-system --timeout=600s || log_warning "Grafana pod may not be ready yet, but continuing deployment"

    # Wait for Kiali pod to be ready
    log_info "Waiting for Kiali to be ready..."
    kubectl wait --for=condition=ready pod -l app=kiali -n istio-system --timeout=600s || log_warning "Kiali pod may not be ready yet, but continuing deployment"

    # Fix Kiali-Prometheus connection
    log_info "Applying Kiali-Prometheus connection fix..."
    if [ -f "scripts/monitoring/fix-kiali-prometheus-connection.sh" ]; then
        ./scripts/monitoring/fix-kiali-prometheus-connection.sh
    else
        log_warning "Kiali fix script not found, Kiali may have connectivity issues"
    fi

    # Enable Istio metrics collection
    log_info "Enabling Istio metrics collection..."
    if [ -f "scripts/monitoring/enable-istio-metrics.sh" ]; then
        ./scripts/monitoring/enable-istio-metrics.sh
    else
        log_warning "Istio metrics script not found, Grafana dashboards may show no data"
    fi

    # Apply permanent Grafana fix
    log_info "Applying Grafana configuration..."
    if [ -f "scripts/setup-grafana.sh" ]; then
        ./scripts/setup-grafana.sh
    fi

    # Setup Grafana-Prometheus connection
    log_info "Setting up Grafana-Prometheus connection..."
    if [ -f "scripts/monitoring/setup-grafana-prometheus-connection.sh" ]; then
        ./scripts/monitoring/setup-grafana-prometheus-connection.sh > /dev/null 2>&1 || log_warning "Grafana setup script failed, but continuing..."
    fi

    log_success "Monitoring stack deployed"
}

# Function to configure Angular client
configure_frontend() {
    log_info "Configuring Angular frontend..."
    
    cd client
    
    # Update API endpoints to use localhost:8010
    log_info "Updating API endpoints..."
    
    # Update store service
    sed -i.bak 's|baseUrl = .*|baseUrl = '\''http://localhost:8010/'\'';|g' src/app/store/store.service.ts
    
    # Update discount service
    sed -i.bak 's|private baseUrl = .*|private baseUrl = '\''http://localhost:8010/'\'';|g' src/app/shared/services/discount.service.ts
    
    # Update basket service
    sed -i.bak 's|baseUrl = .*|baseUrl = '\''http://localhost:8010'\'';|g' src/app/basket/basket.service.ts
    sed -i.bak 's|http://.*:31823/api/v2/Basket/Checkout|http://localhost:8010/api/v2/Basket/Checkout|g' src/app/basket/basket.service.ts
    
    # Update constants
    sed -i.bak 's|public static apiRoot = .*|public static apiRoot = '\''http://localhost:8010'\'';|g' src/app/account/constants.ts
    
    # Install dependencies
    log_info "Installing npm dependencies..."
    npm install --legacy-peer-deps
    
    cd ..
    
    log_success "Angular frontend configured"
}

# Function to setup port forwards
setup_port_forwards() {
    log_info "Setting up port forwards..."
    
    # Kill existing port forwards
    pkill -f "kubectl port-forward" || true
    sleep 2
    
    # Core services
    log_info "Starting API Gateway port-forward..."
    kubectl port-forward svc/ocelotapigw 8010:80 -n default > /dev/null 2>&1 &
    
    # Monitoring services
    log_info "Starting monitoring port-forwards..."
    kubectl port-forward svc/prometheus-server 9090:80 -n monitoring > /dev/null 2>&1 &
    kubectl port-forward svc/grafana 3000:3000 -n istio-system > /dev/null 2>&1 &
    kubectl port-forward svc/tracing 16686:80 -n istio-system > /dev/null 2>&1 &
    kubectl port-forward svc/kiali 20001:20001 -n istio-system > /dev/null 2>&1 &
    
    # Logging & Metrics services
    log_info "Starting Kibana port-forward..."
    kubectl port-forward svc/kibana 5601:5601 -n default > /dev/null 2>&1 &
    
    # RabbitMQ Management
    log_info "Starting RabbitMQ management port-forward..."
    kubectl port-forward svc/rabbitmq 15672:15672 -n default > /dev/null 2>&1 &
    
    sleep 5  # Give port forwards time to start
    
    log_success "Port forwards configured"
}

# Function to start Angular dev server
start_frontend() {
    log_info "Starting Angular development server..."
    
    cd client
    
    # Start Angular in background
    npm start > /dev/null 2>&1 &
    
    cd ..
    
    log_success "Angular development server started"
}

# Function to verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Wait a bit for services to be ready
    sleep 10
    
    # Test API Gateway
    log_info "Testing API Gateway..."
    for i in {1..5}; do
        if curl -s http://localhost:8010/ | grep -q "Ocelot"; then
            log_success "API Gateway is responding"
            break
        else
            log_warning "API Gateway not ready, retrying in 5 seconds..."
            sleep 5
        fi
    done
    
    # Check pod status
    log_info "Checking pod status..."
    kubectl get pods -n default
    kubectl get pods -n monitoring
    kubectl get pods -n istio-system
    
    log_success "Deployment verification completed"
}

# Function to display access information
display_access_info() {
    echo ""
    echo "🎉 ==============================================="
    echo "🎉  DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "🎉 ==============================================="
    echo ""
    echo "🌐 FRONTEND APPLICATION:"
    echo "   Angular Client: http://localhost:4200"
    echo ""
    echo "🔗 API GATEWAY:"
    echo "   API Gateway: http://localhost:8010"
    echo "   Test: curl http://localhost:8010/"
    echo ""
    echo "📊 MONITORING STACK:"
    echo "   Prometheus: http://localhost:9090"
    echo "   Grafana: http://localhost:3000"
    echo "   Jaeger: http://localhost:16686"
    echo "   Kiali: http://localhost:20001"
    echo ""
    echo "📈 LOGGING & METRICS:"
    echo "   Kibana: http://localhost:5601"
    echo "   RabbitMQ Metrics: Available in Kibana dashboards"
    echo ""
    echo "🐰 RABBITMQ MANAGEMENT:"
    echo "   Management UI: http://localhost:15672"
    echo "   Credentials: guest/guest"
    echo ""
    echo "📚 ADDITIONAL COMMANDS:"
    echo "   Check pods: kubectl get pods --all-namespaces"
    echo "   Check services: kubectl get svc --all-namespaces"
    echo "   View logs: kubectl logs <pod-name> -n <namespace>"
    echo ""
    echo "🎊 Platform is ready for use! 🎊"
    echo ""
}

# Function to handle cleanup on exit
cleanup() {
    if [ $? -ne 0 ]; then
        log_error "Deployment failed. Check the logs above for details."
        echo ""
        echo "🛠️  TROUBLESHOOTING TIPS:"
        echo "   1. Check minikube status: minikube status"
        echo "   2. Check pod logs: kubectl logs <pod-name> -n default"
        echo "   3. Reset minikube: minikube delete && minikube start"
        echo "   4. Ensure enough resources: memory=12GB+, cpus=6+"
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Main deployment function
main() {
    echo "🚀 Starting Cloud-Native E-Commerce Platform Deployment..."
    echo ""
    
    check_prerequisites
    check_existing_deployments
    start_minikube
    build_images
    deploy_infrastructure
    wait_for_pods
    deploy_apis
    deploy_monitoring
    configure_frontend
    setup_port_forwards
    start_frontend
    verify_deployment
    display_access_info
}

# Run main function
main "$@" 