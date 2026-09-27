#!/bin/bash

# Smart Port Forwarding with Health Checking and Reuse
# Checks if port is already in use, validates if it's healthy, reuses or recreates

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

# Configuration
NAMESPACE="${NAMESPACE:-dev}"
PROMETHEUS_NAMESPACE="${PROMETHEUS_NAMESPACE:-monitoring}"

# Service definitions: "k8s-service:local-port:remote-port:service-name:health-endpoint:namespace"
# Using actual endpoints from the test files
SERVICES=(
  "eshopping-catalog:8081:80:catalog:/api/v1/Catalog/GetAllProducts:dev"
  "eshopping-basket:8082:80:basket:/api/v1/Basket/GetBasket/testuser:dev"
  "eshopping-ordering:8083:80:ordering:/api/v1/Order/testuser:dev"
  "prometheus-server:9090:80:prometheus:/api/v1/query?query=up:monitoring"
)

# Check if port is in use
is_port_in_use() {
  local port=$1
  if command -v lsof &> /dev/null; then
    lsof -i :"$port" -t >/dev/null 2>&1
  elif command -v netstat &> /dev/null; then
    netstat -an | grep -q ":$port.*LISTEN"
  else
    # Fallback: try to bind to the port
    (echo >/dev/tcp/localhost/"$port") 2>/dev/null
  fi
}

# Check if port-forward is healthy
is_port_forward_healthy() {
  local port=$1
  local health_endpoint=$2

  # Check if port is in use
  if ! is_port_in_use "$port"; then
    return 1
  fi

  # Try to connect to service (with short timeout)
  # Accept any HTTP response (200-499) as healthy - just need to connect
  local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "http://localhost:$port$health_endpoint" 2>/dev/null)

  # If we got any HTTP response (even 404), the port-forward is working
  if [ -n "$status_code" ] && [ "$status_code" -ge 200 ] && [ "$status_code" -lt 500 ]; then
    return 0
  else
    return 1
  fi
}

# Get PID of process using a port
get_port_pid() {
  local port=$1
  if command -v lsof &> /dev/null; then
    lsof -i :"$port" -t 2>/dev/null | head -1
  else
    netstat -anp 2>/dev/null | grep ":$port.*LISTEN" | awk '{print $7}' | cut -d'/' -f1 | head -1
  fi
}

# Kill port-forward on a port
kill_port_forward() {
  local port=$1
  local pid=$(get_port_pid "$port")

  if [ -n "$pid" ]; then
    log_warning "Killing unhealthy port-forward on port $port (PID: $pid)"
    kill "$pid" 2>/dev/null || true
    sleep 1
  fi
}

# Start port-forward for a service
start_port_forward() {
  local k8s_service=$1
  local local_port=$2
  local remote_port=$3
  local service_name=$4
  local health_endpoint=$5
  local service_namespace=$6

  log_info "Setting up port-forward for $service_name..."

  # Check if already healthy
  if is_port_forward_healthy "$local_port" "$health_endpoint"; then
    log_success "Port $local_port already in use and healthy - reusing existing port-forward"
    return 0
  fi

  # Port in use but not healthy - kill it
  if is_port_in_use "$local_port"; then
    log_warning "Port $local_port in use but not healthy - recreating port-forward"
    kill_port_forward "$local_port"
  fi

  # Check if service exists in cluster
  if ! kubectl get svc -n "$service_namespace" "$k8s_service" >/dev/null 2>&1; then
    log_error "Service $k8s_service not found in namespace $service_namespace"
    return 1
  fi

  # Start new port-forward
  log_info "Starting port-forward: $k8s_service -> localhost:$local_port"
  kubectl port-forward -n "$service_namespace" "svc/$k8s_service" "$local_port:$remote_port" >/dev/null 2>&1 &
  local pid=$!

  # Give it a moment to start
  sleep 2

  # Wait for port-forward to be ready
  local max_attempts=15
  local attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if is_port_forward_healthy "$local_port" "$health_endpoint"; then
      log_success "Port-forward started: $service_name -> localhost:$local_port (PID: $pid)"
      return 0
    fi
    sleep 1
    attempt=$((attempt + 1))
  done

  log_error "Failed to start healthy port-forward for $service_name after $max_attempts attempts"
  log_error "Health check endpoint: http://localhost:$local_port$health_endpoint"
  log_error "Try manually: kubectl port-forward -n $service_namespace svc/$k8s_service $local_port:$remote_port"
  return 1
}

# Check prerequisites
check_prerequisites() {
  if ! command -v kubectl &> /dev/null; then
    log_error "kubectl is not installed"
    exit 1
  fi

  if ! command -v curl &> /dev/null; then
    log_error "curl is not installed"
    exit 1
  fi

  if ! kubectl cluster-info &> /dev/null; then
    log_error "Cannot connect to Kubernetes cluster"
    exit 1
  fi
}

# Main execution
main() {
  echo ""
  log_info "=== Smart Port Forwarding Setup ==="
  log_info "Namespace: $NAMESPACE"
  log_info "Cluster: $(kubectl config current-context)"
  echo ""

  check_prerequisites

  local failed=0

  for service_def in "${SERVICES[@]}"; do
    IFS=':' read -r k8s_svc local_port remote_port svc_name health_ep service_ns <<< "$service_def"

    if ! start_port_forward "$k8s_svc" "$local_port" "$remote_port" "$svc_name" "$health_ep" "$service_ns"; then
      log_error "Failed to setup port-forward for $svc_name"
      failed=$((failed + 1))
    fi
    echo ""
  done

  if [ $failed -eq 0 ]; then
    log_success "=== Port Forwarding Complete ==="
    echo ""
    log_info "Services available at:"
    log_info "  - Catalog:  http://localhost:8081"
    log_info "  - Basket:   http://localhost:8082"
    log_info "  - Ordering: http://localhost:8083"
    log_info "  - Prometheus: http://localhost:9090"
    echo ""
    return 0
  else
    log_error "=== Port Forwarding Failed ==="
    log_error "$failed service(s) failed to setup"
    return 1
  fi
}

# Run main function
main "$@"
