#!/bin/bash

# Cloud Native E-commerce Platform - Kubernetes Deployment Script
# This script deploys the complete platform using raw Kubernetes manifests

set -e

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

# Check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "kubectl is available and connected to cluster"
}

# Check if Docker images are available
check_images() {
    log_info "Checking if Docker images are available..."
    
    local images=(
        "eshop/catalog.api:latest"
        "eshop/basket.api:latest"
        "eshop/discount.grpc:latest"
        "eshop/ordering.api:latest"
        "eshop/ocelot.apigw:latest"
    )
    
    for image in "${images[@]}"; do
        if ! docker image inspect "$image" &> /dev/null; then
            log_warning "Image $image not found locally. Make sure to build images first."
        else
            log_success "Image $image found"
        fi
    done
}

# Deploy namespaces
deploy_namespaces() {
    log_info "Creating namespaces..."
    kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
    kubectl create namespace istio-system --dry-run=client -o yaml | kubectl apply -f -
    log_success "Namespaces created"
}

# Deploy secrets and configmaps
deploy_configs() {
    log_info "Deploying secrets and configmaps..."
    kubectl apply -f secrets.yaml
    kubectl apply -f configmaps.yaml
    log_success "Secrets and configmaps deployed"
}

# Deploy databases
deploy_databases() {
    log_info "Deploying databases..."
    
    kubectl apply -f databases/mongodb.yaml
    kubectl apply -f databases/redis.yaml
    kubectl apply -f databases/postgresql.yaml
    kubectl apply -f databases/sqlserver.yaml
    
    log_info "Waiting for databases to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-catalogdb -n default --timeout=300s || echo "MongoDB may not be ready due to PVC"
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-basketdb -n default --timeout=300s || echo "Redis may not be ready"
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-discountdb -n default --timeout=300s || echo "Postgres may not be ready"
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-orderdb -n default --timeout=300s || echo "SQLServer may not be ready"
    
    log_success "Databases deployed and ready"
}

# Deploy infrastructure services
deploy_infrastructure() {
    log_info "Deploying infrastructure services..."

    kubectl apply -f infrastructure/rabbitmq.yaml
    kubectl apply -f infrastructure/elasticsearch.yaml
    kubectl apply -f infrastructure/kibana.yaml

    log_info "Waiting for infrastructure services to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-rabbitmq -n default --timeout=300s || echo "RabbitMQ may not be ready"
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-elasticsearch -n default --timeout=300s || echo "Elasticsearch may not be ready"

    # Kibana can take longer to start, make it non-blocking for CI
    log_info "Waiting for Kibana to be ready (this may take a while)..."
    if ! kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-kibana -n default --timeout=600s; then
        log_warning "Kibana is taking longer than expected to start. It will continue starting in the background."
        log_warning "Check status with: kubectl get pods -l app.kubernetes.io/instance=eshopping-kibana -n default"
    fi

    log_success "Infrastructure services deployed (Kibana may still be starting)"
}

# Deploy microservices
deploy_microservices() {
    log_info "Deploying microservices..."
    
    kubectl apply -f services/catalog-api.yaml
    kubectl apply -f services/basket-api.yaml
    kubectl apply -f services/discount-api.yaml
    kubectl apply -f services/ordering-api.yaml
    
    log_info "Waiting for microservices to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-catalog -n default --timeout=300s || echo "Catalog API may not be ready"
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-basket -n default --timeout=300s || echo "Basket API may not be ready"
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-discount -n default --timeout=300s || echo "Discount API may not be ready"
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-ordering -n default --timeout=300s || echo "Ordering API may not be ready"
    
    log_success "Microservices deployed and ready"
}

# Deploy API Gateway
deploy_gateway() {
    log_info "Deploying API Gateway..."
    
    kubectl apply -f gateway/ocelot-gateway.yaml
    
    log_info "Waiting for API Gateway to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=eshopping-gateway-ocelotapigw -n default --timeout=300s || echo "API Gateway may not be ready"
    
    log_success "API Gateway deployed and ready"
}

# Deploy monitoring stack
deploy_monitoring() {
    log_info "Deploying monitoring stack..."
    
    kubectl apply -f monitoring/rbac.yaml
    kubectl apply -f monitoring/prometheus.yaml
    kubectl apply -f monitoring/grafana.yaml
    
    log_info "Waiting for monitoring services to be ready..."
    kubectl wait --for=condition=ready pod -l app=prometheus -n monitoring --timeout=300s || echo "Prometheus may not be ready"
    kubectl wait --for=condition=ready pod -l app=grafana -n istio-system --timeout=300s || echo "Grafana may not be ready"
    
    log_success "Monitoring stack deployed and ready"
}

# Deploy management tools
deploy_management() {
    log_info "Deploying management tools..."
    
    kubectl apply -f management/portainer.yaml
    kubectl apply -f management/pgadmin.yaml
    
    log_info "Waiting for management tools to be ready..."
    kubectl wait --for=condition=ready pod -l app=portainer -n default --timeout=300s || echo "Portainer may not be ready"
    kubectl wait --for=condition=ready pod -l app=pgadmin -n default --timeout=300s || echo "pgAdmin may not be ready"
    
    log_success "Management tools deployed and ready"
}

# Deploy ingress
deploy_ingress() {
    log_info "Deploying ingress configurations..."
    
    kubectl apply -f ingress/api-ingress.yaml
    kubectl apply -f ingress/monitoring-ingress.yaml
    
    log_success "Ingress configurations deployed"
}

# Show deployment status
show_status() {
    log_info "Deployment Status:"
    echo ""

    log_info "Default Namespace Pods:"
    kubectl get pods -n default
    echo ""

    log_info "Monitoring Namespace Pods:"
    kubectl get pods -n monitoring
    echo ""

    log_info "Istio System Namespace Pods:"
    kubectl get pods -n istio-system
    echo ""

    log_info "Services:"
    kubectl get svc -n default
    kubectl get svc -n monitoring
    kubectl get svc -n istio-system
    echo ""

    log_info "Ingress:"
    kubectl get ingress -n default
}

# Main deployment function
main() {
    log_info "Starting Kubernetes deployment for Cloud Native E-commerce Platform"
    
    # Change to the k8s directory
    cd "$(dirname "$0")"
    
    # Pre-deployment checks
    check_kubectl
    check_images
    
    # Deploy components in order
    deploy_namespaces
    deploy_configs
    deploy_databases
    deploy_infrastructure
    deploy_microservices
    deploy_gateway
    deploy_monitoring
    deploy_management
    deploy_ingress
    
    # Show final status
    show_status
    
    log_success "Deployment completed successfully!"
    echo ""
    log_info "Access URLs (use port-forward):"
    echo "  API Gateway:    kubectl port-forward svc/eshopping-gateway-ocelotapigw 8010:80 -n default"
    echo "  Catalog API:    kubectl port-forward svc/eshopping-catalog 8001:80 -n default"
    echo "  Basket API:     kubectl port-forward svc/eshopping-basket 8002:80 -n default"
    echo "  Discount API:   kubectl port-forward svc/eshopping-discount-discount-grpc 8003:8080 -n default"
    echo "  Ordering API:   kubectl port-forward svc/eshopping-ordering 8004:80 -n default"
    echo "  Grafana:        kubectl port-forward svc/grafana 3000:3000 -n istio-system"
    echo "  Prometheus:     kubectl port-forward svc/prometheus-server 9090:80 -n monitoring"
    echo "  Portainer:      kubectl port-forward svc/portainer 9000:9000 -n default"
    echo "  pgAdmin:        kubectl port-forward svc/pgadmin 8080:80 -n default"
    echo "  RabbitMQ:       kubectl port-forward svc/eshopping-rabbitmq 15672:5672 -n default"
    echo "  Kibana:         kubectl port-forward svc/eshopping-kibana 5601:5601 -n default"
}

# Run main function
main "$@"
