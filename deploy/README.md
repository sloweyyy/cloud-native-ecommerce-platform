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
kind create cluster --name eshopping
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

The raw manifests are a single [kustomize](https://kustomize.io/) tree (built
into `kubectl apply -k`). Everything lands in **one namespace, `ecommerce`**, and
resource names match the Helm release names (`eshopping-<chart>`), so the gateway
routing file `src/ApiGateways/Ocelot.ApiGateway/ocelot.k8s.json` serves both
deployment paths.

```
deploy/k8s/
├── base/                     # the platform: namespace, config, secrets, workloads
│   ├── kustomization.yaml    # ConfigMaps/Secrets (exact .NET config keys), image tags
│   ├── databases/            # MongoDB, Redis, PostgreSQL, SQL Server (StatefulSets + PVCs)
│   ├── messaging/            # RabbitMQ (StatefulSet + PVC)
│   ├── storage/              # LocalStack S3 (stands in for the product-images bucket)
│   ├── services/             # catalog, basket, discount (gRPC), ordering
│   ├── gateway/              # Ocelot + ocelot.k8s.json (kept in sync with src/ by CI)
│   └── policies/             # PodDisruptionBudgets (maxUnavailable: 1)
├── components/               # opt-in features
│   ├── logging/              # Elasticsearch + Kibana (Serilog sink target)
│   ├── network-policies/     # default-deny + explicit allow-list (DNS, data stores, bus, OTLP, S3)
│   ├── ingress/              # ingress-nginx host routes: api/rabbitmq/kibana.localhost
│   └── istio/                # sidecar injection for the namespace
├── overlays/
│   ├── local/                # base + logging + network-policies + ingress   (default)
│   ├── local-istio/          # local + istio
│   └── ci/                   # base + network-policies (used by k8s-deployment-test.yml)
├── addons/
│   ├── monitoring/           # Prometheus + Grafana in namespace `monitoring`
│   └── management/           # pgAdmin + Portainer (dev only; Portainer is cluster-admin)
├── deploy-all.sh             # apply an overlay (+ addons/Istio) and wait for rollouts
├── cleanup-all.sh            # delete everything deploy-all.sh created
├── validate-deployment.sh    # rollouts + endpoints + end-to-end gateway smoke test
└── port-forward.sh           # forward every deployed service to localhost
```

`deploy-k8s.sh` and `cleanup-k8s.sh` are kept as thin aliases for the scripts above.

### Configuration and secrets

Services read their settings from environment variables named after the real
.NET configuration keys (`DatabaseSettings__ConnectionString`,
`CacheSettings__ConnectionString`, `GrpcSettings__DiscountUrl`,
`EventBusSettings__HostAddress`, `ConnectionStrings__OrderingConnectionString`,
`ElasticConfiguration__Uri`, `AWS__S3__*`, ...), the same keys the Helm charts
set, so the `${MONGODB_URL}`-style placeholders in `appsettings.json` are always
overridden. Non-secret values come from `<service>-config` ConfigMaps;
connection strings and credentials from `<service>-secrets` Secrets. Both are
generated by kustomize with a content hash in the name, so changing a value
rolls the affected pods.

> The credentials in `base/kustomization.yaml` are **development/CI-only**.
> Production uses the Helm charts with managed AWS data stores (`deploy/terraform`).

### Ports and health probes

| Workload | Service | Port | Probes |
|----------|---------|------|--------|
| Catalog / Basket / Ordering | `eshopping-<name>` | 80 → `http` (80) | startup + liveness `/health/live`, readiness `/health/ready` |
| API gateway (Ocelot) | `eshopping-ocelotapigw` | 80 → `http` (80) | same; `ASPNETCORE_ENVIRONMENT=k8s` loads the mounted `ocelot.k8s.json` |
| Discount (gRPC, h2c only) | `eshopping-discount-discount-grpc` | 8080 → `grpc` (8080), `appProtocol: grpc` | TCP (kubelet HTTP probes cannot speak h2c) |

The HTTP probes rely on the `/health/live` and `/health/ready` endpoints of the
services; images built before those endpoints existed never become Ready.

### Quick start (kind)

```bash
kind create cluster --name eshopping

# Build the images with the names the manifests expect, then side-load them
docker build -f src/Services/Catalog/Catalog.API/Dockerfile     -t eshop/catalog.api:latest .
docker build -f src/Services/Basket/Basket.API/Dockerfile       -t eshop/basket.api:latest .
docker build -f src/Services/Discount/Discount.API/Dockerfile   -t eshop/discount.grpc:latest .
docker build -f src/Services/Ordering/Ordering.API/Dockerfile   -t eshop/ordering.api:latest .
docker build -f src/ApiGateways/Ocelot.ApiGateway/Dockerfile    -t eshop/ocelot.apigw:latest .
kind load docker-image --name eshopping eshop/catalog.api:latest eshop/basket.api:latest \
  eshop/discount.grpc:latest eshop/ordering.api:latest eshop/ocelot.apigw:latest
# (minikube: `minikube image load <image>`; Docker Desktop shares local images automatically)

deploy/k8s/deploy-all.sh                                   # overlays/local
deploy/k8s/deploy-all.sh --with-monitoring --with-management
deploy/k8s/deploy-all.sh --with-istio                      # needs istioctl
deploy/k8s/validate-deployment.sh
deploy/k8s/port-forward.sh                                 # gateway on http://localhost:8010
```

Plain kubectl works too:

```bash
kubectl kustomize deploy/k8s/overlays/local     # render / review
kubectl apply -k deploy/k8s/overlays/local
kubectl apply -k deploy/k8s/addons/monitoring   # optional
```

### Network policies

`components/network-policies` puts a `default-deny-all` policy on the namespace
and ships, in the same component, the allow rules each workload needs: DNS to
kube-dns, service → own data store, publishers/consumers → RabbitMQ, Basket →
Discount gRPC, Catalog → LocalStack/AWS S3 (443), all .NET workloads →
Elasticsearch and the OTLP collector in `istio-system`, and gateway → the four
APIs. The gateway and Kibana accept ingress from anywhere; the APIs only from the
gateway, `istio-system` and `monitoring`. Enforcement needs a policy-capable CNI
(Calico, Cilium, kindnet ≥ v0.24, AWS VPC CNI with network policies enabled).

### Cleanup

```bash
deploy/k8s/cleanup-all.sh            # asks for confirmation; --yes for CI
```

Deleting the namespace also deletes the database PVCs.

### Istio

`deploy/istio/gateway.yaml` and `virtualservices.yaml` expose the Ocelot gateway
through the Istio ingress gateway (Ocelot owns all public routes) and add gRPC
retries for Basket → Discount. `monitoring-virtualservices.yaml` exposes Grafana,
Prometheus, Jaeger and Kiali on `*.localhost` hosts through the same Gateway.
`deploy/k8s/deploy-all.sh --with-istio [--with-monitoring]` applies them.

## CI/CD Integration

### GitHub Actions

**K8s Deployment Test** (`.github/workflows/k8s-deployment-test.yml`), on PRs that
touch `deploy/k8s`, `deploy/istio`, `src` or Dockerfiles:
- builds all five images and loads them into a kind cluster
- applies `deploy/k8s/overlays/ci` with `deploy-all.sh` and fails if any workload
  does not roll out
- runs `validate-deployment.sh` (endpoints + an end-to-end request through the
  gateway to Catalog, crossing the network policies) and fails on any error
- collects pod status, events and logs as diagnostics when something fails

**CI** (`ci.yml`, `kubernetes-validation` job) validates every change under
`deploy/` offline with `.github/scripts/validate-k8s-manifests.sh`: yamllint,
`kubectl kustomize` for every overlay/addon, strict kubeconform schema
validation, `helm lint` + `helm template | kubeconform` for every chart, and a
drift check between `base/gateway/ocelot.k8s.json` and the copy in `src/`.

Run the same checks locally:

```bash
.github/scripts/validate-k8s-manifests.sh    # needs kubectl, helm, kubeconform, yamllint
```

## Monitoring and Management

### Access URLs (using port-forward)

`deploy/k8s/port-forward.sh` forwards everything that is deployed:

| Service | URL | Notes |
|---------|-----|-------|
| API gateway | http://localhost:8010 | |
| RabbitMQ management | http://localhost:15672 | `eshop` / `eshop1234` (dev only) |
| Kibana | http://localhost:5601 | local overlay |
| Grafana | http://localhost:3000 | addons/monitoring, `admin` / `admin` |
| Prometheus | http://localhost:9090 | addons/monitoring |
| pgAdmin | http://localhost:5050 | addons/management, `admin@eshopping.dev` / `admin1234` |
| Portainer | http://localhost:9000 | addons/management |

With ingress-nginx installed the same UIs are available on `api.localhost`,
`rabbitmq.localhost`, `kibana.localhost`, `grafana.localhost`,
`prometheus.localhost`, `pgadmin.localhost` and `portainer.localhost`.

### Viewing Logs

```bash
# View pod logs
kubectl logs -f <pod-name> -n ecommerce

# View logs for a deployment
kubectl logs -f deployment/eshopping-catalog -n ecommerce

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
kubectl run test-pod --image=busybox --rm -i --restart=Never -- /bin/sh -c "nslookup eshopping-catalog.ecommerce.svc.cluster.local"
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
deploy/k8s/validate-deployment.sh
```

It exits non-zero if any Deployment/StatefulSet is not rolled out, any Service
has no ready endpoint, or a request through the API gateway to the Catalog API
fails.

### Health Checks

```bash
# with deploy/k8s/port-forward.sh running
curl http://localhost:8010/health/ready          # API gateway
curl http://localhost:8010/Catalog/GetAllBrands  # gateway -> Catalog
curl http://localhost:3000/api/health            # Grafana (addons/monitoring)
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
    name: eshopping-catalog
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
