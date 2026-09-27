#!/bin/bash

# 🚀 Start Services Script - For Already Deployed Platform
# Use this script if the platform is already deployed and you just need to start the services

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Kill existing port forwards
log_info "Stopping existing port forwards..."
pkill -f "kubectl port-forward" || true
sleep 2

# Start minikube if not running
log_info "Checking minikube status..."
if ! minikube status | grep -q "Running"; then
    log_info "Starting minikube..."
    minikube start
fi

# Setup port forwards
log_info "Setting up port forwards..."

# Core services
kubectl port-forward svc/ocelotapigw 8010:80 -n default > /dev/null 2>&1 &

# Monitoring services
kubectl port-forward svc/prometheus-server 9090:80 -n monitoring > /dev/null 2>&1 &
kubectl port-forward svc/grafana 3000:3000 -n istio-system > /dev/null 2>&1 &
kubectl port-forward svc/tracing 16686:80 -n istio-system > /dev/null 2>&1 &
kubectl port-forward svc/kiali 20001:20001 -n istio-system > /dev/null 2>&1 &

# RabbitMQ Management
kubectl port-forward svc/rabbitmq 15672:15672 -n default > /dev/null 2>&1 &

sleep 5

log_success "Port forwards started!"

# Start Angular frontend
log_info "Starting Angular frontend..."
cd frontend/client
npm start > /dev/null 2>&1 &
cd ../..

sleep 3

# Display access information
echo ""
echo "🎉 ==============================================="
echo "🎉  ALL SERVICES STARTED!"
echo "🎉 ==============================================="
echo ""
echo "🌐 FRONTEND APPLICATION:"
echo "   Angular Client: http://localhost:4200"
echo ""
echo "🔗 API GATEWAY:"
echo "   API Gateway: http://localhost:8010"
echo ""
echo "📊 MONITORING STACK:"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana: http://localhost:3000"
echo "   Jaeger: http://localhost:16686"
echo "   Kiali: http://localhost:20001"
echo ""
echo "🐰 RABBITMQ MANAGEMENT:"
echo "   Management UI: http://localhost:15672"
echo "   Credentials: guest/guest"
echo ""
echo "🎊 Platform is ready for use! 🎊"
echo "" 