# AWS CloudFormation Stacks – EKS with Self-Managed Databases

This folder provides modular CloudFormation templates to deploy the e-commerce platform to AWS using **EKS** with **self-managed databases running inside the cluster** (MongoDB, Redis, PostgreSQL, SQL Server, RabbitMQ, Elasticsearch) via the existing Helm charts.

## 🚀 Quick Start - One Command Deployment

The easiest way to deploy the entire platform is using the **end-to-end deployment script** from the project root:

```bash
# Deploy to AWS EKS (builds images, creates infrastructure, deploys everything)
./deploy-aws.sh dev ap-southeast-1

# Cleanup everything when done
./cleanup-aws.sh dev ap-southeast-1
```

This single script handles:

- ✅ ECR repository creation
- ✅ Docker image building and pushing to ECR
- ✅ VPC, subnets, NAT gateway deployment
- ✅ EKS cluster and node group creation
- ✅ EBS CSI driver installation
- ✅ Self-managed databases deployment (MongoDB, Redis, PostgreSQL, SQL Server, RabbitMQ)
- ✅ API microservices deployment
- ✅ Monitoring stack (Prometheus, Grafana, Istio, Jaeger, Kiali)
- ✅ Application Load Balancer setup

## 📋 Prerequisites

Before running the deployment script, ensure you have:

1. **AWS CLI** configured with appropriate credentials:

   ```bash
   aws configure
   # Or use AWS_PROFILE environment variable
   export AWS_PROFILE=your-profile
   ```

2. **Required tools installed**:
   - AWS CLI v2+
   - kubectl
   - helm v3+
   - docker
   - jq

3. **AWS Permissions**: Your AWS account/role needs permissions for:
   - CloudFormation (full access)
   - EKS (full access)
   - EC2 (VPC, subnets, security groups, load balancers)
   - ECR (repository creation, image push/pull)
   - IAM (role creation for EKS)

4. **Sufficient AWS Service Limits**:
   - VPCs: 1
   - Elastic IPs: 1 (for NAT Gateway)
   - EKS clusters: 1
   - EC2 instances: 2-3 (for EKS nodes)

## 📚 Deployment Scripts

### 1. Complete End-to-End Deployment (Recommended)

**File**: `deploy-aws.sh` (located at project root)

This is a comprehensive script that mirrors the local `deploy.sh` functionality for AWS:

```bash
# Usage (run from project root)
./deploy-aws.sh [environment] [region]

# Examples
./deploy-aws.sh dev ap-southeast-1
./deploy-aws.sh staging us-east-1
./deploy-aws.sh prod eu-west-1
```

**What it does** (10 steps):

1. Checks prerequisites (AWS CLI, kubectl, helm, docker)
2. Creates ECR repositories for all microservices
3. Builds Docker images and pushes to ECR
4. Deploys VPC with public/private subnets, NAT gateway
5. Deploys EKS cluster with managed node groups
6. Installs EBS CSI driver for persistent volumes
7. Deploys self-managed databases via Helm charts
8. Deploys API microservices with ECR images
9. Deploys monitoring stack (Prometheus, Istio, Grafana, Jaeger, Kiali)
10. Creates Application Load Balancer for ingress

**Time**: ~25-35 minutes for complete deployment

### 2. Cleanup Script

**File**: `cleanup-aws.sh` (located at project root)

Removes all AWS resources created by the deployment:

```bash
# Usage (run from project root)
./cleanup-aws.sh [environment] [region]

# Example
./cleanup-aws.sh dev ap-southeast-1
```

**What it deletes**:

- Kubernetes workloads (Helm releases, pods, services, PVCs)
- Istio and monitoring stack
- EKS cluster and node groups
- Application Load Balancer
- VPC, subnets, NAT gateway
- ECR repositories and images
- Orphaned EBS volumes and load balancers

**Time**: ~15-20 minutes

## 🏗️ CloudFormation Stack Architecture

### Stack Order

1. **VPC Stack** (`vpc.yaml`) - Networking foundation
2. **EKS Stack** (`eks-cluster.yaml`) - Kubernetes cluster
3. **ALB Stack** (`alb-ingress.yaml`) - Ingress load balancer

### Stack Details

#### 1. VPC Stack (`vpc.yaml`)

Creates networking infrastructure:

- VPC with CIDR 10.0.0.0/16
- 2 Public subnets (10.0.1.0/24, 10.0.2.0/24) across 2 AZs
- 2 Private subnets (10.0.11.0/24, 10.0.12.0/24) across 2 AZs
- Internet Gateway for public subnet internet access
- NAT Gateway (single AZ for dev cost savings)
- Route tables for public and private subnets

**Exports**:

- `${EnvName}-vpc-id`
- `${EnvName}-public-subnet-ids`
- `${EnvName}-private-subnet-ids`

#### 2. EKS Stack (`eks-cluster.yaml`)

Creates Kubernetes cluster:

- EKS control plane (version 1.30)
- Managed node group in private subnets
- Node configuration: t3.medium, 80GB disk, 1-3 nodes
- IAM roles for cluster and nodes
- Security groups for node-to-node communication

**Exports**:

- `${EnvName}-eks-cluster-name`
- `${EnvName}-eks-cluster-endpoint`

#### 3. ALB Stack (`alb-ingress.yaml`)

Creates public load balancer:

- Application Load Balancer in public subnets
- Security group allowing HTTP/HTTPS
- Target group for routing to Kubernetes services

**Exports**:

- `${EnvName}-alb-dns`
- `${EnvName}-alb-arn`
- `${EnvName}-target-group-arn`

## 🔍 Manual Usage (Advanced)

If you want to deploy stacks individually:

### 1. Validate Templates

```bash
aws cloudformation validate-template --template-body file://Infrastructure/aws/cloudformation/vpc.yaml
aws cloudformation validate-template --template-body file://Infrastructure/aws/cloudformation/eks-cluster.yaml
aws cloudformation validate-template --template-body file://Infrastructure/aws/cloudformation/alb-ingress.yaml
```

### 2. Deploy VPC

```bash
aws cloudformation deploy \
  --region ap-southeast-1 \
  --stack-name dev-vpc \
  --template-file Infrastructure/aws/cloudformation/vpc.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides EnvName=dev
```

### 3. Get VPC Outputs

```bash
VPC_ID=$(aws cloudformation describe-stacks \
  --region ap-southeast-1 \
  --stack-name dev-vpc \
  --query "Stacks[0].Outputs[?ExportName=='dev-vpc-id'].OutputValue" \
  --output text)

PRIV_SUBNETS=$(aws cloudformation describe-stacks \
  --region ap-southeast-1 \
  --stack-name dev-vpc \
  --query "Stacks[0].Outputs[?ExportName=='dev-private-subnet-ids'].OutputValue" \
  --output text)
```

### 4. Deploy EKS

```bash
aws cloudformation deploy \
  --region ap-southeast-1 \
  --stack-name dev-eks \
  --template-file Infrastructure/aws/cloudformation/eks-cluster.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    EnvName=dev \
    ClusterName=dev-eks \
    KubernetesVersion=1.30 \
    PrivateSubnetIds="$PRIV_SUBNETS" \
    NodeDiskSize=80
```

### 5. Configure kubectl

```bash
aws eks update-kubeconfig --region ap-southeast-1 --name dev-eks
kubectl cluster-info
```

### 6. Install EBS CSI Driver

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm upgrade --install aws-ebs-csi-driver eks/aws-ebs-csi-driver \
  --namespace kube-system \
  --set serviceAccount.controller.create=true
```

### 7. Deploy Helm Charts

```bash
cd Deployments/helm

# Databases
helm upgrade --install eshopping-catalogdb ./catalogdb -n default
helm upgrade --install eshopping-basketdb ./basketdb -n default
helm upgrade --install eshopping-discountdb ./discountdb -n default
helm upgrade --install eshopping-orderdb ./orderdb -n default
helm upgrade --install eshopping-rabbitmq ./rabbitmq -n default

# Services (with ECR images)
ECR_REGISTRY="<account-id>.dkr.ecr.ap-southeast-1.amazonaws.com"
helm upgrade --install eshopping-catalog ./catalog -n default \
  --set image.registry=$ECR_REGISTRY \
  --set image.repository=catalogapi \
  --set image.tag=latest

# Repeat for other services...
```

## 📊 Accessing Services

After deployment, use `kubectl port-forward` to access services:

### API Gateway

```bash
kubectl port-forward -n default svc/ocelotapigw 8010:80
# Access: http://localhost:8010
```

### Monitoring

```bash
# Prometheus
kubectl port-forward -n monitoring svc/prometheus-server 9090:80
# Access: http://localhost:9090

# Grafana
kubectl port-forward -n istio-system svc/grafana 3000:3000
# Access: http://localhost:3000

# Jaeger (Tracing)
kubectl port-forward -n istio-system svc/tracing 16686:80
# Access: http://localhost:16686

# Kiali (Service Mesh)
kubectl port-forward -n istio-system svc/kiali 20001:20001
# Access: http://localhost:20001
```

### Logging

```bash
# Kibana
kubectl port-forward -n default svc/kibana 5601:5601
# Access: http://localhost:5601
```

### RabbitMQ

```bash
kubectl port-forward -n default svc/rabbitmq 15672:15672
# Access: http://localhost:15672 (guest/guest)
```

## 💰 Cost Considerations

### Approximate Monthly Costs (ap-southeast-1, dev environment)

- **EKS Control Plane**: ~$73/month
- **EC2 Nodes** (2x t3.medium): ~$60/month
- **NAT Gateway**: ~$45/month + data transfer
- **Application Load Balancer**: ~$23/month + LCU charges
- **EBS Volumes** (80GB x 2): ~$16/month
- **Data Transfer**: Variable

**Total**: ~$217/month + data transfer charges

### Cost Optimization Tips

1. **Development**:
   - Use the deployment for testing, then cleanup when not in use
   - Schedule auto-shutdown during non-working hours
   - Use spot instances for node groups (edit eks-cluster.yaml)

2. **Production**:
   - Enable Auto Scaling for nodes
   - Use Reserved Instances or Savings Plans
   - Enable EBS volume optimization
   - Consider using S3 for logging instead of Elasticsearch

3. **Network Costs**:
   - NAT Gateway is expensive - use NAT instances for dev
   - Minimize cross-AZ data transfer
   - Use VPC endpoints for AWS services

## 🔐 Security Best Practices

1. **Secrets Management**:
   - Do NOT commit database passwords in Helm values
   - Use AWS Secrets Manager or Kubernetes Secrets
   - Rotate credentials regularly

2. **Network Security**:
   - Databases are in ClusterIP (not exposed externally)
   - API services use ClusterIP by default (expose via ALB/Ingress)
   - Review security group rules

3. **IAM Roles**:
   - Follow principle of least privilege
   - Use IRSA (IAM Roles for Service Accounts) for pod permissions
   - Enable CloudTrail for audit logs

4. **Cluster Hardening**:
   - Enable EKS cluster encryption
   - Use Pod Security Standards
   - Enable network policies
   - Regular security patches for nodes

## 📝 Notes

- **Region**: Defaults to `ap-southeast-1`. Change via script parameter or `AWS_DEFAULT_REGION`
- **NAT Gateway**: Single-AZ for dev cost savings. Use multi-AZ for production
- **Instance Sizes**: Minimal (t3.medium) for dev. Scale up for production
- **Persistent Volumes**: Databases use EBS volumes via EBS CSI driver
- **Monitoring**: Istio service mesh provides observability out of the box

## 🐛 Troubleshooting

### Deployment Fails

1. **Check CloudFormation Console**:

   ```bash
   aws cloudformation describe-stack-events --stack-name dev-vpc --region ap-southeast-1
   ```

2. **Check EKS Node Status**:

   ```bash
   kubectl get nodes
   kubectl describe node <node-name>
   ```

3. **Check Pod Status**:

   ```bash
   kubectl get pods --all-namespaces
   kubectl describe pod <pod-name> -n <namespace>
   kubectl logs <pod-name> -n <namespace>
   ```

4. **ECR Access Issues**:

   ```bash
   aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com
   ```

### Cleanup Stuck

1. **Manually Delete Load Balancers**:
   - Check AWS Console > EC2 > Load Balancers
   - Delete any orphaned ALBs/NLBs

2. **Manually Delete EBS Volumes**:

   ```bash
   aws ec2 describe-volumes --region ap-southeast-1 --filters Name=status,Values=available
   aws ec2 delete-volume --volume-id vol-xxxxx --region ap-southeast-1
   ```

3. **Force Delete CloudFormation Stack**:

   ```bash
   aws cloudformation delete-stack --stack-name dev-eks --region ap-southeast-1
   ```

## 🔄 Update/Redeploy

To update an existing deployment:

```bash
# The script will detect existing stacks and update them
./deploy-aws.sh dev ap-southeast-1

# Or manually update a specific stack
aws cloudformation deploy \
  --stack-name dev-eks \
  --template-file Infrastructure/aws/cloudformation/eks-cluster.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

Helm releases are updated with `helm upgrade --install`, so re-running the script will update existing releases.

## 🚀 Next Steps

After deployment:

1. **Set up DNS**: Point your domain to the ALB DNS name
2. **Configure Ingress**: Create Kubernetes Ingress resources for routing
3. **Set up CI/CD**: Automate image builds and deployments
4. **Configure Monitoring**: Set up alerts in Prometheus/Grafana
5. **Enable Auto Scaling**: Configure HPA for services and Cluster Autoscaler for nodes
6. **Backup Strategy**: Set up EBS snapshot policies for databases
