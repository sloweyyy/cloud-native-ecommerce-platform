#!/bin/bash

# ============================================================================
# KUBERNETES DEMO SCRIPT - Infrastructure Features Only
# ============================================================================
# Demo 1: Cluster Health
# Demo 2: HPA Auto-Scaling
# Demo 3: Rolling Update
# Demo 4: Service Resilience
# Demo 5: Manual Scaling
# Demo 6: Kubernetes Dashboard
# Demo 7: Observability Access
# ============================================================================

NAMESPACE="${1:-dev}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

header() {
    echo ""
    echo -e "${CYAN}=======================================${NC}"
    echo -e "${BOLD}$1${NC}"
    echo -e "${CYAN}=======================================${NC}"
    echo ""
}

step() { echo -e "${YELLOW}>>${NC} $1"; }
ok() { echo -e "${GREEN}OK${NC} $1"; }
info() { echo -e "${BLUE}i${NC} $1"; }
pause() { echo ""; echo -e "${MAGENTA}Press ENTER to continue...${NC}"; read -r; }

# DEMO 1: Cluster Health
demo1() {
    header "DEMO 1: Cluster Health Check"
    step "Checking pods..."
    kubectl get pods -n "$NAMESPACE" -o wide
    echo ""
    step "Checking services..."
    kubectl get svc -n "$NAMESPACE"
    echo ""
    step "Checking storage (PVC)..."
    kubectl get pvc -n "$NAMESPACE"
    echo ""
    step "Checking HPA..."
    kubectl get hpa -n "$NAMESPACE" 2>/dev/null || info "No HPA configured"
    echo ""
    step "Checking resource usage..."
    kubectl top pods -n "$NAMESPACE" 2>/dev/null || info "Metrics unavailable"
    echo ""
    step "Checking nodes..."
    kubectl get nodes -o wide
    ok "Cluster health check complete!"
    pause
}

# DEMO 2: HPA Auto-Scaling
demo2() {
    header "DEMO 2: HPA Auto-Scaling"
    step "Current HPA configuration..."
    kubectl get hpa -n "$NAMESPACE" -o wide 2>/dev/null
    echo ""
    step "Current Catalog pods..."
    kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=catalog
    echo ""
    info "To test HPA: k6 run tests/load/k6/stress-test.js"
    info "Watch scaling: watch -n 2 kubectl get hpa,pods -n $NAMESPACE"
    pause
}

# DEMO 3: Rolling Update
demo3() {
    header "DEMO 3: Rolling Update (Zero-Downtime)"
    step "Current deployment..."
    kubectl get deploy eshopping-catalog -n "$NAMESPACE"
    echo ""
    read -p "Trigger rolling update? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        step "Restarting deployment..."
        kubectl rollout restart deploy eshopping-catalog -n "$NAMESPACE"
        kubectl rollout status deploy eshopping-catalog -n "$NAMESPACE" --timeout=120s
        step "Rollout history..."
        kubectl rollout history deploy eshopping-catalog -n "$NAMESPACE" | tail -3
        ok "Zero-downtime update complete!"
    fi
    pause
}

# DEMO 4: Service Resilience
demo4() {
    header "DEMO 4: Service Resilience"
    step "Discount Service pods..."
    kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=discount-grpc
    echo ""
    read -p "Kill Discount Service? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl scale deploy eshopping-discount-discount-grpc -n "$NAMESPACE" --replicas=0
        echo -e "${RED}Discount Service DOWN${NC}"
        info "Test cart in UI - should work without discount"
        read -p "Press ENTER to restore..." -r
        kubectl scale deploy eshopping-discount-discount-grpc -n "$NAMESPACE" --replicas=1
        kubectl rollout status deploy eshopping-discount-discount-grpc -n "$NAMESPACE" --timeout=60s
        ok "Service restored!"
    fi
    pause
}

# DEMO 5: Manual Scaling
demo5() {
    header "DEMO 5: Manual Pod Scaling"
    step "Current replicas..."
    kubectl get deploy eshopping-catalog -n "$NAMESPACE"
    echo ""
    read -p "Scale to 3 replicas? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl scale deploy eshopping-catalog -n "$NAMESPACE" --replicas=3
        sleep 2
        kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=catalog
        read -p "Press ENTER to scale back to 1..." -r
        kubectl scale deploy eshopping-catalog -n "$NAMESPACE" --replicas=1
        ok "Scaled back to 1 replica!"
    fi
    pause
}

# DEMO 6: Kubernetes Dashboard
demo6() {
    header "DEMO 6: Kubernetes Dashboard"
    kubectl get pods -n kubernetes-dashboard 2>/dev/null || { info "Dashboard not installed"; pause; return; }
    echo ""
    step "Access Token:"
    kubectl -n kubernetes-dashboard create token admin-user 2>/dev/null
    echo ""
    info "Start proxy: kubectl proxy --port=8001"
    info "URL: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/"
    pause
}

# DEMO 7: Observability Access
demo7() {
    header "DEMO 7: Observability Access"
    echo -e "${CYAN}Grafana:${NC}    kubectl port-forward svc/grafana 3000:3000 -n monitoring"
    echo -e "${CYAN}Kibana:${NC}     kubectl port-forward svc/eshopping-kibana 5601:5601 -n $NAMESPACE"
    echo -e "${CYAN}Jaeger:${NC}     kubectl port-forward svc/jaeger-query 16686:16686 -n istio-system"
    echo -e "${CYAN}Kiali:${NC}      kubectl port-forward svc/kiali 20001:20001 -n istio-system"
    echo -e "${CYAN}Prometheus:${NC} kubectl port-forward svc/prometheus-server 9090:80 -n monitoring"
    pause
}

# Menu
menu() {
    clear
    echo -e "${CYAN}======================================${NC}"
    echo -e "${BOLD}   KUBERNETES DEMO - $NAMESPACE${NC}"
    echo -e "${CYAN}======================================${NC}"
    echo "1) Cluster Health"
    echo "2) HPA Auto-Scaling"
    echo "3) Rolling Update"
    echo "4) Service Resilience"
    echo "5) Manual Scaling"
    echo "6) K8s Dashboard"
    echo "7) Observability"
    echo "a) Run All"
    echo "q) Quit"
    echo ""
    echo -n "Choice: "
}

# Main loop
while true; do
    menu
    read -r choice
    case $choice in
        1) demo1;;
        2) demo2;;
        3) demo3;;
        4) demo4;;
        5) demo5;;
        6) demo6;;
        7) demo7;;
        a|A) demo1; demo2; demo3; demo4; demo5; demo6; demo7;;
        q|Q) ok "Demo complete!"; exit 0;;
        *) info "Invalid choice";;
    esac
done
