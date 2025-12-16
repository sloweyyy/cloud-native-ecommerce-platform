#!/usr/bin/env bash
set -euo pipefail

# 🗑️ Complete AWS EKS Cleanup Script
# This script removes all AWS resources created by deploy-e2e-complete.sh
# Usage: ./cleanup-all.sh [env] [region]

ENV_NAME="${1:-dev}"
REGION="${2:-${AWS_DEFAULT_REGION:-ap-southeast-1}}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Stack names
STACK_VPC="${ENV_NAME}-vpc"
STACK_EKS="${ENV_NAME}-eks"
STACK_ALB="${ENV_NAME}-alb"
CLUSTER_NAME="${ENV_NAME}-eks"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

aws_cmd() {
    if [[ -n "${AWS_PROFILE:-}" ]]; then
        aws --profile "$AWS_PROFILE" "$@"
    else
        aws "$@"
    fi
}

echo "🗑️  AWS EKS Complete Cleanup"
echo "================================"
echo "Environment: ${ENV_NAME}"
echo "Region: ${REGION}"
echo ""
log_warning "This will delete all resources including:"
echo "  - Kubernetes workloads (pods, services, persistent volumes)"
echo "  - EKS cluster and node groups"
echo "  - Application Load Balancer"
echo "  - VPC and networking resources"
echo "  - ECR repositories and container images"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [[ "$confirm" != "yes" ]]; then
    log_info "Cleanup cancelled"
    exit 0
fi

# Update kubeconfig if cluster still exists
log_info "Attempting to connect to cluster..."
if aws_cmd eks describe-cluster --region "$REGION" --name "$CLUSTER_NAME" >/dev/null 2>&1; then
    aws_cmd eks update-kubeconfig --region "$REGION" --name "$CLUSTER_NAME" || true

    # Delete Helm releases
    log_info "[1/7] Deleting Helm releases..."
    if command -v helm >/dev/null 2>&1; then
        helm list -n default -q | xargs -r helm uninstall -n default || log_warning "Some Helm releases may have already been deleted"
        helm list -n monitoring -q | xargs -r helm uninstall -n monitoring || log_warning "Monitoring releases may have already been deleted"
        helm list -n kube-system -q | grep aws-ebs-csi-driver | xargs -r helm uninstall -n kube-system || log_warning "EBS CSI driver may have already been deleted"
    fi

    # Delete Istio
    log_info "Uninstalling Istio..."
    ISTIO_DIR=$(find . -maxdepth 1 -name "istio-*" -type d | head -n 1)
    if [ -n "$ISTIO_DIR" ] && [ -f "${ISTIO_DIR}/bin/istioctl" ]; then
        ${ISTIO_DIR}/bin/istioctl uninstall --purge -y || log_warning "Istio may have already been uninstalled"
    fi

    # Delete namespaces (this will cascade delete all resources)
    log_info "Deleting Kubernetes namespaces..."
    kubectl delete namespace monitoring --ignore-not-found=true --wait=false || true
    kubectl delete namespace istio-system --ignore-not-found=true --wait=false || true

    # Delete persistent volumes
    log_info "Deleting persistent volumes..."
    kubectl delete pvc --all -n default --ignore-not-found=true || true
    kubectl delete pv --all --ignore-not-found=true || true

    log_success "Kubernetes resources cleanup initiated"
else
    log_warning "Cluster not found or already deleted, skipping Kubernetes cleanup"
fi

# Delete ALB stack
log_info "[2/7] Deleting ALB stack: $STACK_ALB"
if aws_cmd cloudformation describe-stacks --region "$REGION" --stack-name "$STACK_ALB" >/dev/null 2>&1; then
    aws_cmd cloudformation delete-stack --region "$REGION" --stack-name "$STACK_ALB"
    log_info "Waiting for ALB stack deletion..."
    aws_cmd cloudformation wait stack-delete-complete --region "$REGION" --stack-name "$STACK_ALB" || log_warning "ALB stack deletion may have failed"
    log_success "ALB stack deleted"
else
    log_warning "ALB stack not found"
fi

# Delete EKS stack
log_info "[3/7] Deleting EKS stack: $STACK_EKS"
if aws_cmd cloudformation describe-stacks --region "$REGION" --stack-name "$STACK_EKS" >/dev/null 2>&1; then
    aws_cmd cloudformation delete-stack --region "$REGION" --stack-name "$STACK_EKS"
    log_info "Waiting for EKS stack deletion (this may take 10-15 minutes)..."
    aws_cmd cloudformation wait stack-delete-complete --region "$REGION" --stack-name "$STACK_EKS" || log_warning "EKS stack deletion may have failed"
    log_success "EKS stack deleted"
else
    log_warning "EKS stack not found"
fi

# Delete VPC stack
log_info "[4/7] Deleting VPC stack: $STACK_VPC"
if aws_cmd cloudformation describe-stacks --region "$REGION" --stack-name "$STACK_VPC" >/dev/null 2>&1; then
    aws_cmd cloudformation delete-stack --region "$REGION" --stack-name "$STACK_VPC"
    log_info "Waiting for VPC stack deletion..."
    aws_cmd cloudformation wait stack-delete-complete --region "$REGION" --stack-name "$STACK_VPC" || log_warning "VPC stack deletion may have failed"
    log_success "VPC stack deleted"
else
    log_warning "VPC stack not found"
fi

# Clean up ECR repositories
log_info "[5/7] Cleaning up ECR repositories..."
SERVICES=(
    "catalogapi"
    "basketapi"
    "discountapi"
    "orderingapi"
    "ocelotapigateway"
)

for service in "${SERVICES[@]}"; do
    if aws_cmd ecr describe-repositories --region "$REGION" --repository-names "$service" >/dev/null 2>&1; then
        log_info "Deleting ECR repository: ${service}"
        aws_cmd ecr delete-repository --region "$REGION" --repository-name "$service" --force || log_warning "Failed to delete ${service}"
    fi
done

log_success "ECR repositories cleaned"

# Clean up orphaned EBS volumes
log_info "[6/7] Checking for orphaned EBS volumes..."
VOLUMES=$(aws_cmd ec2 describe-volumes \
    --region "$REGION" \
    --filters "Name=tag:kubernetes.io/cluster/${CLUSTER_NAME},Values=owned" \
    --query "Volumes[?State=='available'].VolumeId" \
    --output text 2>/dev/null || echo "")

if [ -n "$VOLUMES" ]; then
    log_warning "Found orphaned EBS volumes, deleting..."
    for vol in $VOLUMES; do
        aws_cmd ec2 delete-volume --region "$REGION" --volume-id "$vol" || log_warning "Failed to delete volume ${vol}"
    done
    log_success "Orphaned EBS volumes deleted"
else
    log_info "No orphaned EBS volumes found"
fi

# Clean up load balancers (if any remain)
log_info "[7/7] Checking for orphaned load balancers..."
LBS=$(aws_cmd elbv2 describe-load-balancers \
    --region "$REGION" \
    --query "LoadBalancers[?contains(LoadBalancerName, '${ENV_NAME}')].LoadBalancerArn" \
    --output text 2>/dev/null || echo "")

if [ -n "$LBS" ]; then
    log_warning "Found orphaned load balancers, deleting..."
    for lb in $LBS; do
        aws_cmd elbv2 delete-load-balancer --region "$REGION" --load-balancer-arn "$lb" || log_warning "Failed to delete LB ${lb}"
    done
    log_success "Orphaned load balancers deleted"
else
    log_info "No orphaned load balancers found"
fi

echo ""
echo "🎉 =========================================================="
echo "🎉  CLEANUP COMPLETED!"
echo "🎉 =========================================================="
echo ""
log_success "All resources for environment '${ENV_NAME}' have been cleaned up"
echo ""
echo "Note: It may take a few minutes for all AWS resources to be fully removed."
echo "You can verify in the AWS Console:"
echo "  - CloudFormation: https://console.aws.amazon.com/cloudformation"
echo "  - EKS: https://console.aws.amazon.com/eks"
echo "  - ECR: https://console.aws.amazon.com/ecr"
echo ""
