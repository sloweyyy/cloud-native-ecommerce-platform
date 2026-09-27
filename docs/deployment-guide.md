# 🚀 COMPLETE DEPLOYMENT GUIDE - Cloud-Native E-Commerce Platform

## 📋 **Prerequisites**

### **Required Tools**

#### **For Local Development (Minikube)**
```bash
# Install required tools (macOS)
brew install minikube helm kubectl docker

# Or check if already installed
minikube version
helm version
kubectl version --client
docker --version
```

#### **For AWS Deployment (EKS)**
```bash
# Install AWS CLI and tools
brew install awscli kubectl helm docker

# Configure AWS credentials
aws configure

# Verify installation
aws --version
kubectl version --client
helm version
docker --version
```

### **System Requirements**

#### **Local Development**
- **RAM**: Minimum 8GB (12GB+ recommended)
- **CPU**: 4+ cores
- **Disk**: 50GB+ free space
- **OS**: macOS, Linux, or Windows with WSL2

#### **AWS Deployment**
- **AWS Account**: Active AWS account with appropriate permissions
- **IAM Permissions**: EKS, EC2, VPC, S3, ECR, CloudFormation access
- **AWS Region**: Default: ap-southeast-1 (configurable)
- **Budget**: Estimated $50-200/month depending on usage

## 🔧 **Deployment Methods**

### **Choose Your Deployment Target**

| Method | Environment | Use Case | Script |
|--------|-------------|----------|--------|
| **Local Full** | Minikube | Complete local development with monitoring | `./scripts/deploy/deploy.sh` |
| **Local Docker** | Docker Compose | Quick local testing without K8s | `./scripts/deploy/docker-deploy.sh` |
| **AWS Minimal** | AWS EKS | Production core services only | `./scripts/deploy/deploy-aws-minimal.sh` |
| **AWS Full** | AWS EKS | Production with full monitoring | `./scripts/deploy/deploy-aws.sh` |

---

## 🔧 **Method 1: Local Deployment (Minikube)**

### **1A: One-Command Full Deployment (Recommended for Local)**

```bash
# Clone repository
git clone <repository-url>
cd cloud-native-ecommerce-platform

# Run single deployment script
chmod +x ./scripts/deploy/deploy.sh
./scripts/deploy/deploy.sh
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

### **1B: Docker Compose Deployment (Quickest Local Setup)**

```bash
# Run Docker Compose
chmod +x ./scripts/deploy/docker-deploy.sh
./scripts/deploy/docker-deploy.sh

# Or manually
docker-compose up -d
```

**Advantages:**
- ⚡ Fastest startup time
- 💻 Lower resource usage
- 🔧 Easier debugging
- 📦 No Kubernetes overhead

**Note:** Does not include monitoring stack or service mesh.

---

## ☁️ **Method 2: AWS Deployment (Production)**

### **2A: AWS Minimal Deployment (Recommended for Production)**

Deploys only core services needed for the application to run.

```bash
# Run minimal AWS deployment
chmod +x ./scripts/deploy/deploy-aws-minimal.sh
./scripts/deploy/deploy-aws-minimal.sh dev ap-southeast-1

# Arguments:
#   dev - Environment name (dev/staging/prod)
#   ap-southeast-1 - AWS region
```

**What's Included:**
- ✅ VPC + EKS Cluster (minimal configuration)
- ✅ Core Databases (MongoDB, Redis, PostgreSQL, SQL Server)
- ✅ Message Broker (RabbitMQ)
- ✅ Core APIs (Catalog, Basket, Discount, Ordering)
- ✅ API Gateway (Ocelot)
- ✅ S3 for product images

**What's NOT Included:**
- ❌ Monitoring (Prometheus, Grafana, Jaeger, Kiali)
- ❌ Service Mesh (Istio)
- ❌ Logging Stack (Elasticsearch, Kibana)

**Time:** ~15-20 minutes
**Cost:** Lower (core services only)

### **2B: AWS Full Deployment (Development/Staging)**

Deploys complete stack with monitoring and observability.

```bash
# Run full AWS deployment
chmod +x ./scripts/deploy/deploy-aws.sh
./scripts/deploy/deploy-aws.sh dev ap-southeast-1
```

**Additional Features:**
- ✅ Prometheus for metrics
- ✅ Grafana for dashboards
- ✅ Jaeger for distributed tracing
- ✅ Kiali for service mesh visualization
- ✅ Elasticsearch + Kibana for logging
- ✅ Istio service mesh

**Time:** ~25-30 minutes
**Cost:** Higher (full observability stack)

### **2C: AWS Deployment Options**

During deployment, you'll be prompted to choose:

```
🎯 Deployment Options:
  1) Full deployment (all steps)
  2) Skip image build (use existing images in ECR)
  3) Skip images + infrastructure (start from EBS CSI driver)
  4) Deploy only Kubernetes workloads (skip infrastructure)
  5) Exit
```

**Recommended choices:**
- **First deployment:** Option 1 (Full deployment)
- **Code changes only:** Option 2 (Skip infrastructure, rebuild images)
- **Config changes only:** Option 4 (Skip infrastructure and images)

---

## 🔨 **Method 3: Step-by-Step Manual Deployment (Local)**

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
docker build -t catalogapi:latest -f src/Services/Catalog/Catalog.API/Dockerfile .
docker build -t basketapi:latest -f src/Services/Basket/Basket.API/Dockerfile .
docker build -t discountapi:latest -f src/Services/Discount/Discount.API/Dockerfile .
docker build -t orderingapi:latest -f src/Services/Ordering/Ordering.API/Dockerfile .
docker build -t ocelotapigateway:latest -f src/ApiGateways/Ocelot.ApiGateway/Dockerfile .

# Tag images for Kubernetes
docker tag catalogapi:latest eshop/catalog.api:latest
docker tag basketapi:latest eshop/basket.api:latest  
docker tag discountapi:latest eshop/discount.grpc:latest
docker tag orderingapi:latest eshop/ordering.api:latest
docker tag ocelotapigateway:latest eshop/ocelot.apigw:latest
```

### **Step 3: Deploy Infrastructure Services**

```bash
cd deploy/helm

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

### **Local Deployment (Minikube)**

#### **Frontend Application**
```bash
🌐 Angular Client: http://localhost:4200
```

#### **API Gateway**
```bash
🔗 API Gateway: http://localhost:8010
📝 Test: curl http://localhost:8010/Catalog/GetAllProducts
```

#### **Monitoring Stack**
```bash
📈 Prometheus: http://localhost:9090
📊 Grafana: http://localhost:3000
🔍 Jaeger: http://localhost:16686
🕸️ Kiali: http://localhost:20001
```

#### **RabbitMQ Management**
```bash
🐰 Management UI: http://localhost:15672
📋 Credentials: guest/guest
```

#### **Easy Access Script**
```bash
# Use the interactive access script
./scripts/access/access-services.sh

# Select service by number and access instantly
```

### **AWS Deployment (EKS)**

#### **Smart Access Script (Recommended)**
```bash
# Auto-detects namespace and service names
./scripts/access/access-services-aws-smart.sh

# Shows which services are available
# Works with both deploy-aws.sh and deploy-aws-minimal.sh
```

**Features:**
- ✅ Auto-detects namespace (dev/default/ecommerce)
- ✅ Auto-detects service names (handles different naming conventions)
- ✅ Shows service availability status
- ✅ One-command access to any service
- ✅ Supports starting all port-forwards at once

#### **Manual Access (AWS)**

**RabbitMQ:**
```bash
kubectl port-forward -n dev svc/rabbitmq 15672:15672 5672:5672
# Access: http://localhost:15672 (guest/guest)
```

**API Gateway:**
```bash
kubectl port-forward -n dev svc/eshopping-ocelotapigw 8010:80
# Access: http://localhost:8010
```

**Catalog API:**
```bash
kubectl port-forward -n dev svc/eshopping-catalog 8001:80
# Test: curl http://localhost:8001/GetAllProducts
```

**MongoDB:**
```bash
kubectl port-forward -n dev svc/catalogdb 27017:27017
# Connect: mongo mongodb://admin:admin1234@localhost:27017/CatalogDb?authSource=admin
```

**View LoadBalancer URLs (External Access):**
```bash
# Get all LoadBalancer service URLs
kubectl get svc -n dev | grep LoadBalancer

# API Gateway external URL
kubectl get svc -n dev eshopping-ocelotapigw -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

---

## 🛠️ **Troubleshooting**

### **Local Deployment Issues**

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

### **AWS Deployment Issues**

**1. ECR Login Failed**

```bash
# Re-authenticate to ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com
```

**2. EKS Cluster Not Accessible**

```bash
# Update kubeconfig
aws eks update-kubeconfig --name dev-ecommerce-eks --region ap-southeast-1

# Verify connection
kubectl cluster-info
kubectl get nodes
```

**3. Pods Stuck in ImagePullBackOff**

```bash
# Check ECR permissions
aws ecr describe-repositories --region ap-southeast-1

# Check pod events
kubectl describe pod <pod-name> -n dev

# Verify image exists in ECR
aws ecr list-images --repository-name catalogapi --region ap-southeast-1
```

**4. LoadBalancer Service Stuck in Pending**

```bash
# Check AWS Load Balancer Controller
kubectl get pods -n kube-system | grep aws-load-balancer

# Check service events
kubectl describe svc <service-name> -n dev

# Verify security groups and subnets
aws ec2 describe-security-groups --filters "Name=tag:kubernetes.io/cluster/dev-ecommerce-eks,Values=owned"
```

**5. IRSA (IAM Roles for Service Accounts) Issues**

```bash
# Verify OIDC provider exists
aws eks describe-cluster --name dev-ecommerce-eks --region ap-southeast-1 \
  --query "cluster.identity.oidc.issuer" --output text

# Check service account annotation
kubectl get sa catalog -n dev -o yaml | grep eks.amazonaws.com/role-arn

# Test S3 access from pod
kubectl exec -it <catalog-pod> -n dev -- aws s3 ls
```

**6. Products Showing LocalStack URLs in AWS**

```bash
# Run migration script to update MongoDB
bash scripts/migrate-products-to-aws-s3.sh dev ecommerce-product-images-<account-id>

# Verify ConfigMap settings
kubectl get configmap cfg-eshopping-catalog -n dev -o yaml | grep -E "(USE_LOCALSTACK|AWS__S3__ServiceUrl)"

# Should show:
# USE_LOCALSTACK: "false"
# AWS__S3__ServiceUrl: ""
```

### **Verification Commands**

#### **Local (Minikube)**
```bash
# Check all pods status
kubectl get pods --all-namespaces

# Check services
kubectl get svc --all-namespaces

# Check Helm releases
helm list --all-namespaces

# Test API Gateway
curl http://localhost:8010/Catalog/GetAllProducts

# Check minikube status
minikube status
```

#### **AWS (EKS)**
```bash
# Check cluster status
aws eks describe-cluster --name dev-ecommerce-eks --region ap-southeast-1

# Check all pods in dev namespace
kubectl get pods -n dev

# Check services with external IPs
kubectl get svc -n dev | grep LoadBalancer

# Test API Gateway (replace with your LoadBalancer DNS)
GATEWAY_URL=$(kubectl get svc -n dev eshopping-ocelotapigw -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$GATEWAY_URL/Catalog/GetAllProducts

# Check ECR images
aws ecr describe-images --repository-name catalogapi --region ap-southeast-1

# Check S3 bucket
aws s3 ls s3://ecommerce-product-images-<account-id>/products/

# View pod logs
kubectl logs -n dev <pod-name> --tail=100
```

---

## 🔄 **Clean Up**

### **Local Deployment Cleanup**

#### **Quick Cleanup Script**
```bash
# Run cleanup script
./scripts/cleanup/cleanup.sh

# This will:
# - Uninstall all Helm releases
# - Delete namespaces
# - Stop minikube (optional)
```

#### **Manual Cleanup**
```bash
# Delete Helm releases
helm uninstall eshopping-basket eshopping-basketdb eshopping-catalog eshopping-catalogdb \
  eshopping-discount eshopping-discountdb eshopping-gateway eshopping-orderdb \
  eshopping-ordering eshopping-rabbitmq eshopping-elasticsearch eshopping-kibana -n default
helm uninstall prometheus -n monitoring

# Delete namespaces
kubectl delete namespace monitoring istio-system

# Stop minikube
minikube stop

# Delete minikube cluster (optional - destroys everything)
minikube delete
```

### **AWS Deployment Cleanup**

#### **Quick Cleanup Script**
```bash
# Run AWS cleanup script
./scripts/cleanup/cleanup-aws.sh dev

# Arguments:
#   dev - Environment name to clean up
```

**This will:**
- ✅ Uninstall all Helm releases
- ✅ Delete EKS cluster
- ✅ Delete VPC and networking
- ✅ Delete ECR repositories (optional)
- ✅ Delete S3 bucket (optional)

#### **Manual AWS Cleanup**

**Step 1: Delete Kubernetes Workloads**
```bash
# Delete all Helm releases in dev namespace
helm uninstall -n dev $(helm list -n dev -q)

# Delete monitoring stack
helm uninstall -n monitoring prometheus
```

**Step 2: Delete CloudFormation Stacks**
```bash
# Delete in reverse order
aws cloudformation delete-stack --stack-name dev-alb --region ap-southeast-1
aws cloudformation delete-stack --stack-name dev-eks --region ap-southeast-1
aws cloudformation delete-stack --stack-name dev-vpc --region ap-southeast-1

# Wait for stacks to delete
aws cloudformation wait stack-delete-complete --stack-name dev-alb --region ap-southeast-1
aws cloudformation wait stack-delete-complete --stack-name dev-eks --region ap-southeast-1
aws cloudformation wait stack-delete-complete --stack-name dev-vpc --region ap-southeast-1
```

**Step 3: Delete ECR Repositories (Optional)**
```bash
# List repositories
aws ecr describe-repositories --region ap-southeast-1

# Delete each repository
for repo in catalogapi basketapi discountapi orderingapi ocelotapigateway; do
  aws ecr delete-repository --repository-name $repo --region ap-southeast-1 --force
done
```

**Step 4: Delete S3 Bucket (Optional)**
```bash
# Empty bucket first
aws s3 rm s3://ecommerce-product-images-<account-id> --recursive

# Delete bucket
aws s3 rb s3://ecommerce-product-images-<account-id>
```

**Step 5: Delete IAM Resources (Optional)**
```bash
# Delete IAM policies and roles
aws iam detach-role-policy --role-name dev-catalog-s3-role \
  --policy-arn arn:aws:iam::<account-id>:policy/dev-catalog-s3-policy

aws iam delete-role --role-name dev-catalog-s3-role
aws iam delete-policy --policy-arn arn:aws:iam::<account-id>:policy/dev-catalog-s3-policy
```

**Step 6: Verify Cleanup**
```bash
# Check CloudFormation stacks
aws cloudformation describe-stacks --region ap-southeast-1

# Check EKS clusters
aws eks list-clusters --region ap-southeast-1

# Check ECR repositories
aws ecr describe-repositories --region ap-southeast-1

# Check S3 buckets
aws s3 ls | grep ecommerce-product-images
```

### **Docker Compose Cleanup**

```bash
# Stop all containers
docker-compose down

# Remove volumes (deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

---

## 📚 **Next Steps**

### **After Local Deployment**
1. **Explore the Platform**: Browse http://localhost:4200
2. **Monitor Services**: Use Grafana dashboards at http://localhost:3000
3. **View Traces**: Check distributed tracing at http://localhost:16686
4. **Access Services**: Run `./scripts/access/access-services.sh` for easy access
5. **Test APIs**: Use Postman collections in `tools/postman/`
6. **Scale Services**: `kubectl scale deployment <name> --replicas=3`

### **After AWS Deployment**
1. **Get LoadBalancer URLs**: `kubectl get svc -n dev | grep LoadBalancer`
2. **Access Services**: Run `./scripts/access/access-services-aws-smart.sh`
3. **Configure Frontend**: Update Angular environment with LoadBalancer URLs
4. **Monitor Costs**: Check AWS Cost Explorer regularly
5. **Setup Alerts**: Configure CloudWatch alarms for critical metrics
6. **Backup Data**: Setup automated backups for databases
7. **Security**: Review IAM policies and security groups

### **Learning Resources**
- **Architecture**: See `docs/architecture.md` for system design
- **API Documentation**: Check Swagger UI at API Gateway endpoints
- **Kubernetes**: Learn `kubectl` commands - https://kubernetes.io/docs/
- **AWS EKS**: AWS EKS Workshop - https://www.eksworkshop.com/
- **Monitoring**: Grafana tutorials - https://grafana.com/tutorials/

---

## 🚀 **Quick Reference**

### **Common Commands**

| Task | Local (Minikube) | AWS (EKS) |
|------|------------------|-----------|
| **Deploy** | `./scripts/deploy/deploy.sh` | `./scripts/deploy/deploy-aws-minimal.sh dev` |
| **Access Services** | `./scripts/access/access-services.sh` | `./scripts/access/access-services-aws-smart.sh` |
| **View Pods** | `kubectl get pods -n default` | `kubectl get pods -n dev` |
| **View Logs** | `kubectl logs <pod> -n default` | `kubectl logs <pod> -n dev` |
| **Restart Service** | `kubectl rollout restart deployment <name> -n default` | `kubectl rollout restart deployment <name> -n dev` |
| **Scale Service** | `kubectl scale deployment <name> --replicas=3` | `kubectl scale deployment <name> --replicas=3 -n dev` |
| **Cleanup** | `./scripts/cleanup/cleanup.sh` | `./scripts/cleanup/cleanup-aws.sh dev` |

### **Useful Scripts**

| Script | Purpose |
|--------|---------|
| `deploy.sh` | Full local deployment with monitoring |
| `docker-deploy.sh` | Quick Docker Compose deployment |
| `deploy-aws-minimal.sh` | AWS deployment (core services only) |
| `deploy-aws.sh` | AWS deployment (with monitoring) |
| `access-services.sh` | Access local services interactively |
| `access-services-aws-smart.sh` | Access AWS services (auto-detection) |
| `cleanup.sh` | Clean up local deployment |
| `cleanup-aws.sh` | Clean up AWS deployment |
| `check-logs.sh` | View logs from all services |
| `database-access.sh` | Connect to databases |
| `scripts/migrate-products-to-aws-s3.sh` | Migrate product URLs to AWS S3 |
| `scripts/setup-https-self-signed.sh` | Setup HTTPS with self-signed cert |

### **Key Files**

| File | Description |
|------|-------------|
| `docs/deployment-guide.md` | Complete deployment instructions (this file) |
| `docker-compose.yml` | Docker Compose configuration |
| `deploy/helm/*` | Helm charts for all services |
| `src/Services/*/*.API/Dockerfile` | Docker images for microservices |
| `deploy/aws/cloudformation/*` | AWS infrastructure templates |

### **Default Credentials**

| Service | Username | Password | Port |
|---------|----------|----------|------|
| RabbitMQ | guest | guest | 15672 |
| MongoDB | admin | admin1234 | 27017 |
| PostgreSQL | postgres | postgres | 5432 |
| Redis | - | (none) | 6379 |
| Grafana | admin | prom-operator | 3000 |

**⚠️ WARNING:** Change these credentials in production!

---

## 📖 **Additional Documentation**

- **[deploy/README.md](../deploy/README.md)** - Kubernetes / Helm / Istio deployment reference
- **[deploy/CONFIGURATION.md](../deploy/CONFIGURATION.md)** - Environment & configuration matrix
- **[deploy/aws/cloudformation/README.md](../deploy/aws/cloudformation/README.md)** - AWS CloudFormation stacks
- **[scripts/README.md](../scripts/README.md)** - Operational scripts
- **[tests/load/k6/README.md](../tests/load/k6/README.md)** - Load testing with k6

---

**🎊 Happy Deploying! 🎊**
