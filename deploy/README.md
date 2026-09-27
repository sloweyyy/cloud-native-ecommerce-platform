# Cloud Native E-commerce Platform - Deployment Guide

This directory contains deployment configurations for the Cloud Native E-commerce Platform using both Helm charts and raw Kubernetes manifests.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Helm Deployment](#helm-deployment)
- [Kubernetes Manifest Deployment](#kubernetes-manifest-deployment)
- [CI/CD Integration](#cicd-integration)
- [Monitoring and Management](#monitoring-and-management)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- **Kubernetes Cluster**: v1.28+ (Minikube, Kind, EKS, GKE, AKS, etc.)
- **kubectl**: v1.28+
- **Helm**: v3.0+ (for Helm deployments)
- **Docker**: v20.0+ (for building images)

### Minimum Resource Requirements

| Environment | CPUs | Memory | Disk Space |
|-------------|------|--------|------------|
| Development | 4    | 12GB   | 50GB       |
| Testing     | 6    | 16GB   | 100GB      |
| Production  | 12   | 32GB   | 200GB      |

### Cluster Setup

**Using Minikube:**
```bash
minikube start --cpus=6 --memory=16384 --disk-size=100g --driver=docker
```

**Using Kind:**
```bash
kind create cluster --config=k8s/kind-config.yaml
```

## Deployment Options

### 1. Helm Deployment (Recommended for Production)

Helm charts provide:
- Templating and configuration management
- Easy upgrades and rollbacks
- Version control
- Package management

### 2. Kubernetes Manifest Deployment (Good for CI/CD)

Raw Kubernetes manifests provide:
- Full control and transparency
- No external dependencies
- Faster CI/CD pipelines
- Easier troubleshooting

## Helm Deployment

### Quick Start

```bash
cd deploy/helm

# Install all components
./install-helm.sh

# Or with custom app name
./install-helm.sh myapp
```

### Manual Installation

```bash
cd deploy/helm

# Install infrastructure
helm install eshopping-basketdb basketdb
helm install eshopping-catalogdb catalogdb
helm install eshopping-discountdb discountdb
helm install eshopping-orderdb orderdb
helm install eshopping-rabbitmq rabbitmq
helm install eshopping-elasticsearch elasticsearch
helm install eshopping-kibana kibana

# Install microservices
helm install eshopping-catalog catalog
helm install eshopping-basket basket
helm install eshopping-discount discount
helm install eshopping-ordering ordering

# Install API gateway
helm install eshopping-gateway ocelotapigw

# Install monitoring (optional)
helm install eshopping-prometheus prometheus
helm install eshopping-portainer portainer
helm install eshopping-pgadmin pgadmin
```

### Uninstallation

```bash
cd deploy/helm

# Uninstall all components
./uninstall-helm.sh

# Or manually
helm uninstall eshopping-gateway
helm uninstall eshopping-ordering
helm uninstall eshopping-discount
helm uninstall eshopping-catalog
helm uninstall eshopping-basket
# ... and so on
```

### Upgrade Existing Release

```bash
helm upgrade eshopping-catalog catalog --set image.tag=v2.0.0
```

## Kubernetes Manifest Deployment

### Quick Start

```bash
cd deploy/k8s

# Build Docker images first
cd ../..
docker build -f src/Services/Catalog/Catalog.API/Dockerfile -t eshop/catalog.api:latest .
docker build -f src/Services/Basket/Basket.API/Dockerfile -t eshop/basket.api:latest .
docker build -f src/Services/Discount/Discount.API/Dockerfile -t eshop/discount.grpc:latest .
docker build -f src/Services/Ordering/Ordering.API/Dockerfile -t eshop/ordering.api:latest .
docker build -f src/ApiGateways/Ocelot.ApiGateway/Dockerfile -t eshop/ocelot.apigw:latest .

# Load images to cluster (Minikube example)
minikube image load eshop/catalog.api:latest
minikube image load eshop/basket.api:latest
minikube image load eshop/discount.grpc:latest
minikube image load eshop/ordering.api:latest
minikube image load eshop/ocelot.apigw:latest

# Deploy to Kubernetes
cd deploy/k8s
./deploy-k8s.sh
```

### Manual Deployment

```bash
cd deploy/k8s

# Create namespaces
kubectl apply -f namespace.yaml

# Deploy configurations
kubectl apply -f secrets.yaml
kubectl apply -f configmaps.yaml

# Deploy databases
kubectl apply -f databases/mongodb.yaml
kubectl apply -f databases/redis.yaml
kubectl apply -f databases/postgresql.yaml
kubectl apply -f databases/sqlserver.yaml

# Deploy infrastructure
kubectl apply -f infrastructure/rabbitmq.yaml
kubectl apply -f infrastructure/elasticsearch.yaml
kubectl apply -f infrastructure/kibana.yaml

# Deploy microservices
kubectl apply -f services/catalog-api.yaml
kubectl apply -f services/basket-api.yaml
kubectl apply -f services/discount-api.yaml
kubectl apply -f services/ordering-api.yaml

# Deploy gateway
kubectl apply -f gateway/ocelot-gateway.yaml

# Deploy monitoring
kubectl apply -f monitoring/rbac.yaml
kubectl apply -f monitoring/prometheus.yaml
kubectl apply -f deploy/monitoring/grafana.yaml

# Deploy management tools
kubectl apply -f management/portainer.yaml
kubectl apply -f management/pgadmin.yaml

# Deploy ingress
kubectl apply -f ingress/api-ingress.yaml
kubectl apply -f ingress/monitoring-ingress.yaml
```

### Cleanup

```bash
cd deploy/k8s
./cleanup-k8s.sh
```

## CI/CD Integration

### GitHub Actions

The platform includes automated CI/CD workflows:

**K8s Deployment Test** (`.github/workflows/k8s-deployment-test.yml`):
- Runs on PR to `main` or `develop`
- Builds Docker images
- Deploys to Minikube
- Validates deployment
- Tests service connectivity
- Tests API endpoints

### Running CI Tests Locally

```bash
# Install act (GitHub Actions local runner)
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow locally
act pull_request -W .github/workflows/k8s-deployment-test.yml
```

## Monitoring and Management

### Access URLs (using port-forward)

```bash
# API Gateway
kubectl port-forward svc/ocelotapigw-service 8010:80 -n ecommerce

# Grafana Dashboard
kubectl port-forward svc/grafana-service 3000:3000 -n monitoring
# Default credentials: admin/admin

# Prometheus
kubectl port-forward svc/prometheus-service 9090:9090 -n monitoring

# Kibana
kubectl port-forward svc/kibana-service 5601:5601 -n ecommerce

# RabbitMQ Management
kubectl port-forward svc/rabbitmq-service 15672:15672 -n ecommerce
# Default credentials: guest/guest

# Portainer
kubectl port-forward svc/portainer-service 9000:9000 -n ecommerce

# pgAdmin
kubectl port-forward svc/pgadmin-service 8080:80 -n ecommerce
# Default credentials: admin@admin.com/admin
```

### Viewing Logs

```bash
# View pod logs
kubectl logs -f <pod-name> -n ecommerce

# View logs for a deployment
kubectl logs -f deployment/catalog-deployment -n ecommerce

# View logs from all containers in a pod
kubectl logs -f <pod-name> -n ecommerce --all-containers=true
```

### Checking Status

```bash
# Check all pods
kubectl get pods -n ecommerce
kubectl get pods -n monitoring

# Check services
kubectl get svc -n ecommerce
kubectl get svc -n monitoring

# Check deployments
kubectl get deployments -n ecommerce

# Check events
kubectl get events -n ecommerce --sort-by='.lastTimestamp'

# Describe a pod for detailed information
kubectl describe pod <pod-name> -n ecommerce
```

## Troubleshooting

### Common Issues

#### 1. Pods in CrashLoopBackOff

```bash
# Check pod logs
kubectl logs <pod-name> -n ecommerce --previous

# Describe pod for events
kubectl describe pod <pod-name> -n ecommerce
```

**Common causes:**
- Database not ready (wait for DB pods)
- Configuration errors (check configmaps/secrets)
- Resource constraints (check node resources)

#### 2. Kibana Takes Long to Start

Kibana requires significant resources and Elasticsearch to be fully ready.

**Solutions:**
- Wait 5-10 minutes for first startup
- Check Elasticsearch is ready: `kubectl get pods -l app=elasticsearch -n ecommerce`
- Increase resources: Edit `infrastructure/kibana.yaml`
- Check logs: `kubectl logs -f <kibana-pod> -n ecommerce`

#### 3. Services Not Accessible

```bash
# Check service endpoints
kubectl get endpoints -n ecommerce

# Check if pods are running
kubectl get pods -n ecommerce

# Test internal connectivity
kubectl run test-pod --image=busybox --rm -i --restart=Never -- /bin/sh -c "nslookup catalog-service.ecommerce.svc.cluster.local"
```

#### 4. ImagePullBackOff

```bash
# For Minikube, ensure images are loaded
minikube image load <image-name>

# For other clusters, push to registry
docker tag <image-name> <registry>/<image-name>
docker push <registry>/<image-name>
```

#### 5. Resource Exhaustion

```bash
# Check node resources
kubectl top nodes

# Check pod resources
kubectl top pods -n ecommerce

# Describe node for capacity
kubectl describe node <node-name>
```

**Solutions:**
- Increase cluster resources
- Reduce replica counts
- Adjust resource requests/limits

### Validation Script

```bash
cd deploy/k8s
./validate-deployment.sh
```

This script checks:
- Namespace existence
- Pod readiness
- Service availability
- PVC binding
- Ingress configuration

### Health Checks

```bash
# Check API Gateway health
curl http://localhost:8010/health

# Check Catalog API health
curl http://localhost:8001/health

# Check Grafana
curl http://localhost:3000/api/health
```

## Performance Tuning

### Production Recommendations

1. **Resource Limits**: Adjust based on load testing
2. **Horizontal Pod Autoscaling**: Enable HPA for APIs
3. **Persistent Volume**: Use production-grade storage classes
4. **Networking**: Configure proper ingress with TLS
5. **Security**: Enable RBAC, network policies, pod security policies
6. **Monitoring**: Set up proper alerting rules in Prometheus
7. **Logging**: Configure log aggregation and retention

### Example HPA Configuration

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: catalog-api-hpa
  namespace: ecommerce
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: catalog-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Support

For issues and questions:
- **GitHub Issues**: https://github.com/sloweyyy/cloud-native-ecommerce-platform/issues
- **Documentation**: Check the main README.md
- **Logs**: Always include pod logs when reporting issues

## License

This project is part of the Cloud Native E-commerce Platform.
