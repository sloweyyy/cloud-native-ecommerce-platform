# AWS EKS Deployment Guide

This guide helps you deploy the entire e-commerce platform to AWS EKS with a single command.

## 🚀 Quick Start

### Prerequisites

1. **AWS CLI configured**:
   ```bash
   aws configure
   # Or set AWS_PROFILE for a specific profile
   export AWS_PROFILE=your-profile
   ```

2. **Required tools installed**:
   - AWS CLI v2+
   - kubectl
   - helm v3+
   - docker
   - jq

3. **Verify AWS credentials**:
   ```bash
   aws sts get-caller-identity
   ```

### Deploy to AWS EKS

Run from the project root:

```bash
# Deploy everything to AWS
./deploy-aws.sh dev ap-southeast-1
```

This single command will:
1. ✅ Create ECR repositories
2. ✅ Build and push Docker images to ECR
3. ✅ Deploy VPC (10.0.0.0/16) with public/private subnets
4. ✅ Deploy EKS cluster (Kubernetes 1.30)
5. ✅ Install EBS CSI driver
6. ✅ Deploy all databases (MongoDB, Redis, PostgreSQL, SQL Server, RabbitMQ, Elasticsearch)
7. ✅ Deploy all microservices (Catalog, Basket, Discount, Ordering, API Gateway)
8. ✅ Deploy monitoring (Prometheus, Grafana, Istio, Jaeger, Kiali)
9. ✅ Create Application Load Balancer

**Time**: ~25-35 minutes

### Access Services

After deployment completes, access services using `kubectl port-forward`:

```bash
# API Gateway (main application entry point)
kubectl port-forward -n default svc/ocelotapigw 8010:80
# Then open: http://localhost:8010

# Grafana (monitoring dashboards)
kubectl port-forward -n istio-system svc/grafana 3000:3000
# Then open: http://localhost:3000

# Prometheus (metrics)
kubectl port-forward -n monitoring svc/prometheus-server 9090:80
# Then open: http://localhost:9090

# Jaeger (distributed tracing)
kubectl port-forward -n istio-system svc/tracing 16686:80
# Then open: http://localhost:16686

# Kiali (service mesh visualization)
kubectl port-forward -n istio-system svc/kiali 20001:20001
# Then open: http://localhost:20001

# Kibana (log analytics)
kubectl port-forward -n default svc/kibana 5601:5601
# Then open: http://localhost:5601

# RabbitMQ (message broker management)
kubectl port-forward -n default svc/rabbitmq 15672:15672
# Then open: http://localhost:15672 (guest/guest)
```

### Cleanup

When you're done, cleanup all AWS resources:

```bash
./cleanup-aws.sh dev ap-southeast-1
```

**Time**: ~15-20 minutes

This will remove:
- All Kubernetes workloads
- EKS cluster
- VPC and networking
- ECR repositories and images
- Load balancers
- EBS volumes

## 💰 Cost Information

Running this deployment costs approximately **$217/month**:
- EKS Control Plane: $73/month
- EC2 Nodes (2x t3.medium): $60/month
- NAT Gateway: $45/month
- ALB: $23/month
- EBS Volumes: $16/month
- Data Transfer: variable

**💡 Cost Saving Tip**: Run cleanup when not in use to avoid charges!

## 📊 Monitoring Your Deployment

### Check deployment status:
```bash
# View all pods across namespaces
kubectl get pods --all-namespaces

# Check services
kubectl get svc --all-namespaces

# View CloudFormation stacks
aws cloudformation list-stacks --region ap-southeast-1 --query "StackSummaries[?StackStatus!='DELETE_COMPLETE']"
```

### View logs:
```bash
# Application logs
kubectl logs -n default -l app=catalog --tail=100

# Follow logs in real-time
kubectl logs -n default -l app=ocelotapigw -f
```

### Scale services:
```bash
# Scale a deployment
kubectl scale deployment/catalog -n default --replicas=3

# Scale EKS nodes (edit CloudFormation stack)
aws cloudformation update-stack \
  --stack-name dev-eks \
  --use-previous-template \
  --parameters ParameterKey=NodeDesiredCapacity,ParameterValue=3
```

## 🐛 Troubleshooting

### Deployment fails with "Services: no such file or directory"
**Solution**: Make sure you run the script from the project root:
```bash
cd /path/to/cloud-native-ecommerce-platform
./deploy-aws.sh dev ap-southeast-1
```

### ECR login fails
**Solution**: Ensure AWS CLI is configured and you have ECR permissions:
```bash
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.ap-southeast-1.amazonaws.com
```

### Pod stuck in Pending state
**Solution**: Check node resources and events:
```bash
kubectl get nodes
kubectl describe pod <pod-name> -n default
```

### CloudFormation stack fails
**Solution**: Check stack events:
```bash
aws cloudformation describe-stack-events \
  --stack-name dev-eks \
  --region ap-southeast-1 \
  --max-items 20
```

## 🔄 Update Existing Deployment

To update an existing deployment with new code:

```bash
# Simply re-run the deploy script
./deploy-aws.sh dev ap-southeast-1
```

The script will:
- Detect existing stacks and update them (not recreate)
- Build and push new Docker images
- Update Helm releases with new images
- Preserve your data (databases use persistent volumes)

## 📚 Advanced Options

### Deploy to different environment:
```bash
./deploy-aws.sh staging ap-southeast-1
./deploy-aws.sh prod us-east-1
```

### Use a specific AWS profile:
```bash
export AWS_PROFILE=my-production-account
./deploy-aws.sh prod us-east-1
```

### Manual step-by-step deployment:
See [Infrastructure/aws/cloudformation/README.md](Infrastructure/aws/cloudformation/README.md) for manual CloudFormation deployment steps.

## 🔐 Security Notes

1. **Secrets**: Database passwords are hardcoded in Helm values (dev only). For production, use AWS Secrets Manager.
2. **Network**: Databases run as ClusterIP (internal only). Only ALB is publicly accessible.
3. **IAM**: The script creates necessary IAM roles for EKS. Review these in production.
4. **Audit**: Enable CloudTrail for compliance and audit requirements.

## 📖 Additional Resources

- **Detailed Architecture**: [Infrastructure/aws/cloudformation/README.md](Infrastructure/aws/cloudformation/README.md)
- **Local Development**: [deploy.sh](deploy.sh) for Minikube deployment
- **Main README**: [README.md](README.md) for project overview

## 🎯 Comparison: Local vs AWS

| Aspect | Local (Minikube) | AWS EKS |
|--------|------------------|---------|
| **Command** | `./deploy.sh` | `./deploy-aws.sh` |
| **Runtime** | Docker Desktop | AWS Cloud |
| **Cost** | Free | ~$217/month |
| **Setup Time** | ~15 minutes | ~30 minutes |
| **Scalability** | Limited (laptop resources) | Production-ready |
| **Cleanup** | `./cleanup.sh` | `./cleanup-aws.sh` |
| **Use Case** | Development, testing | Staging, production |

---

**Need help?** Check the [troubleshooting guide](Infrastructure/aws/cloudformation/README.md#-troubleshooting) or open an issue on GitHub.
