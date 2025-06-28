# Deployment Guide

This page provides comprehensive information about deploying the Cloud-Native E-commerce Platform.

## Deployment Options

The platform supports multiple deployment options:

1. **One-Command Deployment** - Automated script for quick setup
2. **Helm-Based Deployment** - Using Helm charts for Kubernetes
3. **Raw Kubernetes Deployment** - Using raw Kubernetes manifests
4. **Local Development** - Using Docker Compose

## Prerequisites

### System Requirements

- **RAM**: Minimum 8GB (12GB+ recommended)
- **CPU**: 4+ cores
- **Disk**: 50GB+ free space
- **OS**: macOS, Linux, or Windows with WSL2

### Required Tools

- Docker
- Kubernetes (minikube for local deployment)
- Helm
- kubectl
- Git

```bash
# Install required tools (macOS)
brew install minikube helm kubectl docker

# Install required tools (Linux)
# Docker: https://docs.docker.com/engine/install/
# Minikube: https://minikube.sigs.k8s.io/docs/start/
# Helm: https://helm.sh/docs/intro/install/
# kubectl: https://kubernetes.io/docs/tasks/tools/install-kubectl/
```

## Option 1: One-Command Deployment

The easiest way to deploy the platform is using our automated script:

```bash
# Deploy everything from scratch
./deploy.sh
```

This script:

- Starts minikube with optimal configuration
- Installs all infrastructure services (databases, RabbitMQ)
- Deploys all API microservices
- Deploys monitoring stack
- Configures Angular client
- Starts all port-forwards

### Starting Services (If Already Deployed)

```bash
# Start port-forwards and frontend for existing deployment
./start.sh
```

### Cleanup

```bash
# Remove all deployed resources
./cleanup.sh
```

## Option 2: Helm-Based Deployment

For more control over the deployment process, you can use Helm charts directly:

```bash
# Start minikube
minikube start --driver=docker --memory=7168 --cpus=4 --disk-size=50g

# Configure Docker environment
eval $(minikube docker-env)

# Deploy infrastructure services
cd Deployments/helm
helm install eshopping-basketdb ./basketdb --namespace default
helm install eshopping-catalogdb ./catalogdb --namespace default
helm install eshopping-discountdb ./discountdb --namespace default
helm install eshopping-orderdb ./orderdb --namespace default
helm install eshopping-rabbitmq ./rabbitmq --namespace default
helm install eshopping-elasticsearch ./elasticsearch --namespace default
helm install eshopping-kibana ./kibana --namespace default

# Deploy API services
helm install eshopping-catalog ./catalog --namespace default
helm install eshopping-basket ./basket --namespace default
helm install eshopping-discount ./discount --namespace default
helm install eshopping-ordering ./ordering --namespace default
helm install eshopping-gateway ./ocelotapigw --namespace default

# Deploy monitoring stack
kubectl create namespace monitoring
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/prometheus --namespace monitoring
```

## Option 3: Raw Kubernetes Deployment

For environments where Helm is not available, you can use raw Kubernetes manifests:

```bash
# Deploy using raw Kubernetes manifests
./deploy-raw-k8s.sh
```

To uninstall:

```bash
# Uninstall raw Kubernetes deployment
./uninstall-raw-k8s.sh
```

## Option 4: Local Development with Docker Compose

For local development without Kubernetes:

```bash
# Start all services with Docker Compose
docker-compose up -d

# Start specific services
docker-compose up -d mongodb redis postgres rabbitmq
```

## Access Information

After deployment, services are available at:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | <http://localhost:4200> | - |
| **API Gateway** | <http://localhost:8010> | - |
| **Prometheus** | <http://localhost:9090> | - |
| **Grafana** | <http://localhost:3000> | admin/prom-operator |
| **Jaeger** | <http://localhost:16686> | - |
| **Kiali** | <http://localhost:20001> | - |
| **RabbitMQ** | <http://localhost:15672> | guest/guest |

## Deployment Architecture

### Kubernetes Resources

Each microservice deployment includes:

- **Deployment**: Pod specifications and replicas
- **Service**: Network access to pods
- **ConfigMap**: Configuration data
- **Secret**: Sensitive data
- **HorizontalPodAutoscaler**: Automatic scaling

### Helm Charts

Each service has its own Helm chart in `Deployments/helm/`:

- **basketdb**: Redis for basket service
- **catalogdb**: MongoDB for catalog service
- **discountdb**: PostgreSQL for discount service
- **orderdb**: SQL Server for ordering service
- **rabbitmq**: Message broker
- **elasticsearch**: Log storage
- **kibana**: Log visualization
- **basket**: Basket microservice
- **catalog**: Catalog microservice
- **discount**: Discount microservice
- **ordering**: Ordering microservice
- **ocelotapigw**: API Gateway

### Raw Kubernetes Manifests

Raw Kubernetes manifests are available in `Deployments/k8s/`:

- **basket/**: Basket service and database
- **catalog/**: Catalog service and database
- **discount/**: Discount service and database
- **ordering/**: Ordering service and database
- **ocelotapigw/**: API Gateway
- **rabbitmq/**: Message broker
- **elasticsearch/**: Log storage
- **kibana/**: Log visualization
- **monitoring/**: Prometheus and Grafana

## CI/CD Pipeline

Our GitHub Actions workflow automates:

- Building and testing code
- Building Docker images
- Validating Helm charts and Kubernetes manifests
- Publishing Docker images to registry

## Troubleshooting

### Common Issues

**1. Minikube Won't Start**

```bash
# Reset minikube
minikube delete
minikube start --driver=docker --memory=7168 --cpus=4
```

**2. Pods Stuck in Pending/CrashLoopBackOff**

```bash
# Check pod status
kubectl describe pod <pod-name> -n default

# Check logs  
kubectl logs <pod-name> -n default

# Restart deployment
kubectl rollout restart deployment <deployment-name> -n default
```

**3. Port Forward Issues**

```bash
# Kill existing port forwards
pkill -f "kubectl port-forward"

# Restart specific port forward
kubectl port-forward svc/<service-name> <local-port>:<service-port> -n <namespace>
```

**4. Image Pull Errors**

```bash
# Ensure Docker environment is set
eval $(minikube docker-env)

# Rebuild and retag images
docker build -t <image-name>:latest -f <dockerfile-path> .
```

### Verification Commands

```bash
# Check all pods status
kubectl get pods --all-namespaces

# Check services
kubectl get svc --all-namespaces

# Check Helm releases
helm list --all-namespaces

# Test API Gateway
curl http://localhost:8010/

# Check minikube status
minikube status
```
