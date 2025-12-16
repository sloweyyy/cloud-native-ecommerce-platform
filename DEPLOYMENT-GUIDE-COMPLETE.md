# 🚀 COMPLETE DEPLOYMENT GUIDE - Cloud-Native E-Commerce Platform

## 📋 **Prerequisites**

### **Required Tools**

```bash
# Install required tools (macOS)
brew install minikube helm kubectl docker

# Or check if already installed
minikube version
helm version  
kubectl version --client
docker --version
```

### **System Requirements**

- **RAM**: Minimum 8GB (12GB+ recommended)
- **CPU**: 4+ cores
- **Disk**: 50GB+ free space
- **OS**: macOS, Linux, or Windows with WSL2

## 🔧 **Method 1: One-Command Deployment (Recommended)**

### **Quick Start**

```bash
# Clone repository
git clone <repository-url>
cd cloud-native-ecommerce-platform

# Run single deployment script
chmod +x deploy.sh
./deploy.sh
```

**This script will:**

- ✅ Start minikube with optimal configuration
- ✅ Install Helm and required addons  
- ✅ Deploy all infrastructure services (databases, RabbitMQ)
- ✅ Deploy all API microservices
- ✅ Deploy monitoring stack (Prometheus, Grafana, Jaeger)
- ✅ Configure Angular client with correct API endpoints
- ✅ Start all port-forwards for easy access
- ✅ Display access URLs and credentials

---

## 🔨 **Method 2: Step-by-Step Manual Deployment**

### **Step 1: Start Minikube**

```bash
# Start minikube with sufficient resources
minikube start --driver=docker --memory=10240 --cpus=8 --disk-size=50g

# Enable required addons
minikube addons enable ingress
minikube addons enable dashboard  
minikube addons enable metrics-server

# Configure Docker environment
eval $(minikube docker-env)
```

### **Step 2: Build Docker Images**

```bash
# Build all microservice images
docker build -t catalogapi:latest -f Services/Catalog/Catalog.API/Dockerfile .
docker build -t basketapi:latest -f Services/Basket/Basket.API/Dockerfile .
docker build -t discountapi:latest -f Services/Discount/Discount.API/Dockerfile .
docker build -t orderingapi:latest -f Services/Ordering/Ordering.API/Dockerfile .
docker build -t ocelotapigateway:latest -f ApiGateways/Ocelot.ApiGateway/Dockerfile .

# Tag images for Kubernetes
docker tag catalogapi:latest eshop/catalog.api:latest
docker tag basketapi:latest eshop/basket.api:latest  
docker tag discountapi:latest eshop/discount.grpc:latest
docker tag orderingapi:latest eshop/ordering.api:latest
docker tag ocelotapigateway:latest eshop/ocelot.apigw:latest
```

### **Step 3: Deploy Infrastructure Services**

```bash
cd Deployments/helm

# Install databases
helm install eshopping-basketdb ./basketdb --namespace default
helm install eshopping-catalogdb ./catalogdb --namespace default  
helm install eshopping-discountdb ./discountdb --namespace default
helm install eshopping-orderdb ./orderdb --namespace default

# Install message broker
helm install eshopping-rabbitmq ./rabbitmq --namespace default

# Install logging stack
helm install eshopping-elasticsearch ./elasticsearch --namespace default
helm install eshopping-kibana ./kibana --namespace default

# Wait for services to be ready
kubectl wait --for=condition=ready pod --all --timeout=300s -n default
```

### **Step 4: Deploy API Services**

```bash
# Install microservices
helm install eshopping-catalog ./catalog --namespace default
helm install eshopping-basket ./basket --namespace default
helm install eshopping-discount ./discount --namespace default  
helm install eshopping-ordering ./ordering --namespace default
helm install eshopping-gateway ./ocelotapigw --namespace default

# Verify deployment
kubectl get pods -n default
```

### **Step 5: Deploy Monitoring Stack**

```bash
# Create monitoring namespace
kubectl create namespace monitoring

# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/prometheus --namespace monitoring

# Install Istio (optional, includes Grafana, Jaeger, Kiali)
curl -L https://istio.io/downloadIstio | sh -
./istio-*/bin/istioctl install --set values.defaultRevision=default -y
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/grafana.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml
```

### **Step 6: Configure Frontend**

```bash
cd client

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start
```

### **Step 7: Setup Port Forwards**

```bash
# Core services
kubectl port-forward svc/ocelotapigw 8010:80 -n default &

# Monitoring
kubectl port-forward svc/prometheus-server 9090:80 -n monitoring &
kubectl port-forward svc/grafana 3000:3000 -n istio-system &
kubectl port-forward svc/tracing 16686:80 -n istio-system &
kubectl port-forward svc/kiali 20001:20001 -n istio-system &

# RabbitMQ Management
kubectl port-forward svc/rabbitmq 15672:15672 -n default &
```

---

## 🎯 **Access Information**

### **Frontend Application**

```bash
🌐 Angular Client: http://localhost:4200
```

### **API Gateway**

```bash
🔗 API Gateway: http://localhost:8010
📝 Test: curl http://localhost:8010/
```

### **Monitoring Stack**

```bash
📈 Prometheus: http://localhost:9090
📊 Grafana: http://localhost:3000  
🔍 Jaeger: http://localhost:16686
🕸️ Kiali: http://localhost:20001
```

### **RabbitMQ Management**

```bash
🐰 Management UI: http://localhost:15672
📋 Credentials: guest/guest
```

---

## 🛠️ **Troubleshooting**

### **Common Issues**

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

### **Verification Commands**

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

---

## 🔄 **Clean Up**

### **Remove Everything**

```bash
# Delete Helm releases
helm uninstall eshopping-basket eshopping-basketdb eshopping-catalog eshopping-catalogdb eshopping-discount eshopping-discountdb eshopping-gateway eshopping-orderdb eshopping-ordering eshopping-rabbitmq eshopping-elasticsearch eshopping-kibana -n default
helm uninstall prometheus -n monitoring

# Delete namespaces
kubectl delete namespace monitoring istio-system

# Stop minikube
minikube stop

# Delete minikube cluster (optional)
minikube delete
```

---

## 📚 **Next Steps**

1. **Explore the Platform**: Browse <http://localhost:4200>
2. **Monitor Services**: Use Grafana dashboards at <http://localhost:3000>
3. **View Traces**: Check distributed tracing at <http://localhost:16686>  
4. **Scale Services**: Use `kubectl scale deployment <name> --replicas=3`
5. **Test APIs**: Use Postman collections in `/PostmanCollection/`

**🎊 Happy Deploying! 🎊**
