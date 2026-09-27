#!/bin/bash

set -e

# ============================================================================
# MINIMAL AWS DEPLOYMENT FOR E-COMMERCE BACKEND
# ============================================================================
# This script deploys only the core backend services needed for the application:
# - VPC + EKS Cluster (minimal resources)
# - Core Databases (MongoDB, Redis, PostgreSQL, SQL Server, RabbitMQ)
# - Core APIs (Catalog, Basket, Discount, Ordering)
# - API Gateway (Ocelot)
# - S3 for product images (AWS S3, not LocalStack)
#
# What's NOT included (can be added later):
# - Monitoring (Prometheus, Grafana, Jaeger, Kiali)
# - Service Mesh (Istio)
# - Logging (Elasticsearch, Kibana)
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
ENV_NAME="${1:-dev}"
AWS_REGION="${2:-ap-southeast-1}"
NAMESPACE="${ENV_NAME}"

# AWS Configuration
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
S3_BUCKET="ecommerce-product-images-${AWS_ACCOUNT_ID}"
CLUSTER_NAME="${ENV_NAME}-ecommerce-eks"

# CloudFormation Stack Names
STACK_NAME="${ENV_NAME}-ecommerce-minimal"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  MINIMAL AWS E-COMMERCE DEPLOYMENT                             ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo -e ""
echo -e "${BLUE}Configuration:${NC}"
echo -e "  Environment:   ${GREEN}${ENV_NAME}${NC}"
echo -e "  AWS Region:    ${GREEN}${AWS_REGION}${NC}"
echo -e "  AWS Account:   ${GREEN}${AWS_ACCOUNT_ID}${NC}"
echo -e "  Cluster Name:  ${GREEN}${CLUSTER_NAME}${NC}"
echo -e "  S3 Bucket:     ${GREEN}${S3_BUCKET}${NC}"
echo -e "  ECR Registry:  ${GREEN}${ECR_REGISTRY}${NC}"
echo -e ""

# Logging functions
log_step() { echo -e "\n${CYAN}[STEP]${NC} $1"; }
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

# ============================================================================
# STEP 1: Prerequisites Check
# ============================================================================
log_step "Step 1/8: Checking Prerequisites"

MISSING_TOOLS=()

if ! command -v aws &> /dev/null; then
    MISSING_TOOLS+=("aws")
fi

if ! command -v kubectl &> /dev/null; then
    MISSING_TOOLS+=("kubectl")
fi

if ! command -v helm &> /dev/null; then
    MISSING_TOOLS+=("helm")
fi

if ! command -v docker &> /dev/null; then
    MISSING_TOOLS+=("docker")
fi

if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
    log_error "Missing required tools: ${MISSING_TOOLS[*]}"
    exit 1
fi

log_success "All required tools are installed"

# Verify AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    log_error "AWS credentials not configured. Run 'aws configure'"
    exit 1
fi

log_success "AWS credentials verified"

# ============================================================================
# STEP 2: Create ECR Repositories
# ============================================================================
log_step "Step 2/8: Setting up ECR Repositories"

REPOSITORIES=("catalogapi" "basketapi" "discountapi" "orderingapi" "ocelotapigateway")

for repo in "${REPOSITORIES[@]}"; do
    if aws ecr describe-repositories --repository-names "${repo}" --region "${AWS_REGION}" &>/dev/null; then
        log_info "ECR repository already exists: ${repo}"
    else
        log_info "Creating ECR repository: ${repo}"
        aws ecr create-repository \
            --repository-name "${repo}" \
            --region "${AWS_REGION}" \
            --image-scanning-configuration scanOnPush=true \
            --output text &>/dev/null
        log_success "Created: ${repo}"
    fi
done

log_success "ECR repositories ready"

# ============================================================================
# STEP 3: Build and Push Docker Images
# ============================================================================
log_step "Step 3/8: Building and Pushing Docker Images"

# Login to ECR
log_info "Logging in to ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | \
    docker login --username AWS --password-stdin "${ECR_REGISTRY}"

# Build and push images (using simple arrays for Bash 3.2 compatibility)
build_and_push_image() {
    local image=$1
    local dockerfile=$2

    log_info "Building ${image} for AMD64 platform..."
    docker buildx build --platform linux/amd64 -f "${dockerfile}" -t "${ECR_REGISTRY}/${image}:latest" . --push

    log_success "Pushed: ${image}"
}

# Build each service
build_and_push_image "catalogapi" "src/Services/Catalog/Catalog.API/Dockerfile"
build_and_push_image "basketapi" "src/Services/Basket/Basket.API/Dockerfile"
build_and_push_image "discountapi" "src/Services/Discount/Discount.API/Dockerfile"
build_and_push_image "orderingapi" "src/Services/Ordering/Ordering.API/Dockerfile"
build_and_push_image "ocelotapigateway" "src/ApiGateways/Ocelot.ApiGateway/Dockerfile"

log_success "All Docker images pushed to ECR"

# ============================================================================
# STEP 4: Create S3 Bucket for Product Images
# ============================================================================
log_step "Step 4/8: Setting up S3 Bucket"

if aws s3 ls "s3://${S3_BUCKET}" 2>/dev/null; then
    log_info "S3 bucket already exists: ${S3_BUCKET}"
else
    log_info "Creating S3 bucket: ${S3_BUCKET}"

    if [ "${AWS_REGION}" == "us-east-1" ]; then
        aws s3api create-bucket --bucket "${S3_BUCKET}" --region "${AWS_REGION}"
    else
        aws s3api create-bucket \
            --bucket "${S3_BUCKET}" \
            --region "${AWS_REGION}" \
            --create-bucket-configuration LocationConstraint="${AWS_REGION}"
    fi

    log_success "S3 bucket created"
fi

# Disable S3 Block Public Access to allow public bucket policy
log_info "Disabling S3 Block Public Access..."
aws s3api put-public-access-block \
    --bucket "${S3_BUCKET}" \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
    --region "${AWS_REGION}"

# Set bucket policy for public read access to product images
log_info "Configuring S3 bucket policy for public read access..."
cat > /tmp/s3-bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${S3_BUCKET}/products/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
    --bucket "${S3_BUCKET}" \
    --policy file:///tmp/s3-bucket-policy.json

log_success "S3 bucket configured with public read access"

# Update seed data with correct S3 URLs before building Docker images
log_info "Updating product seed data with correct S3 bucket URLs..."
SEED_FILE="src/Services/Catalog/Catalog.Infrastructure/Data/SeedData/products.json"
S3_URL_PATTERN="https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/products/"
if [ -f "$SEED_FILE" ]; then
    sed -i.bak -E "s|https://ecommerce-product-images-[0-9]+\.s3\.[a-z0-9-]+\.amazonaws\.com/products/|${S3_URL_PATTERN}|g" "$SEED_FILE"
    rm -f "${SEED_FILE}.bak"
    log_success "Seed data updated with S3 URL: ${S3_URL_PATTERN}"
fi

# Upload product images if they exist
if [ -d "frontend/client/src/images/products" ]; then
    log_info "Uploading product images to S3..."
    aws s3 sync frontend/client/src/images/products/ "s3://${S3_BUCKET}/products/" --quiet
    IMAGE_COUNT=$(aws s3 ls "s3://${S3_BUCKET}/products/" --recursive | wc -l)
    log_success "Uploaded ${IMAGE_COUNT} product images"
else
    log_warning "Product images directory not found, skipping image upload"
fi

# ============================================================================
# STEP 5: Deploy CloudFormation Stack (VPC + EKS)
# ============================================================================
log_step "Step 5/8: Deploying Infrastructure (VPC + EKS Cluster)"

STACK_EXISTS=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${AWS_REGION}" 2>/dev/null || echo "NONE")

if echo "${STACK_EXISTS}" | grep -q "StackStatus"; then
    log_warning "Stack already exists: ${STACK_NAME}"
    log_info "Updating stack..."

    aws cloudformation update-stack \
        --stack-name "${STACK_NAME}" \
        --template-body file://Infrastructure/aws/cloudformation/minimal-stack.yaml \
        --parameters \
            ParameterKey=EnvName,ParameterValue="${ENV_NAME}" \
            ParameterKey=ClusterName,ParameterValue="${CLUSTER_NAME}" \
        --capabilities CAPABILITY_NAMED_IAM \
        --region "${AWS_REGION}" 2>/dev/null || log_info "No updates required"
else
    log_info "Creating new stack: ${STACK_NAME}"
    log_warning "This will take 15-20 minutes..."

    aws cloudformation create-stack \
        --stack-name "${STACK_NAME}" \
        --template-body file://Infrastructure/aws/cloudformation/minimal-stack.yaml \
        --parameters \
            ParameterKey=EnvName,ParameterValue="${ENV_NAME}" \
            ParameterKey=ClusterName,ParameterValue="${CLUSTER_NAME}" \
        --capabilities CAPABILITY_NAMED_IAM \
        --region "${AWS_REGION}"
fi

log_info "Waiting for stack to be ready..."
aws cloudformation wait stack-create-complete \
    --stack-name "${STACK_NAME}" \
    --region "${AWS_REGION}" 2>/dev/null || \
aws cloudformation wait stack-update-complete \
    --stack-name "${STACK_NAME}" \
    --region "${AWS_REGION}" 2>/dev/null || true

log_success "Infrastructure deployed"

# ============================================================================
# STEP 6: Configure kubectl
# ============================================================================
log_step "Step 6/8: Configuring kubectl"

log_info "Updating kubeconfig..."
aws eks update-kubeconfig \
    --name "${CLUSTER_NAME}" \
    --region "${AWS_REGION}"

log_info "Verifying cluster connection..."
if kubectl get nodes &>/dev/null; then
    log_success "Connected to EKS cluster"
    kubectl get nodes
else
    log_error "Failed to connect to cluster"
    exit 1
fi

# Create namespace
if kubectl get namespace "${NAMESPACE}" &>/dev/null; then
    log_info "Namespace already exists: ${NAMESPACE}"
else
    kubectl create namespace "${NAMESPACE}"
    log_success "Namespace created: ${NAMESPACE}"
fi

# Create ECR image pull secret
kubectl create secret docker-registry ecr-registry \
    --docker-server="${ECR_REGISTRY}" \
    --docker-username=AWS \
    --docker-password="$(aws ecr get-login-password --region "${AWS_REGION}")" \
    -n "${NAMESPACE}" \
    --dry-run=client -o yaml | kubectl apply -f - &>/dev/null

log_success "kubectl configured"

# ============================================================================
# STEP 7: Setup IRSA for S3 Access
# ============================================================================
log_step "Step 7/8: Setting up IAM Roles for Service Accounts (IRSA)"

# Get OIDC provider
OIDC_PROVIDER=$(aws eks describe-cluster \
    --name "${CLUSTER_NAME}" \
    --region "${AWS_REGION}" \
    --query 'cluster.identity.oidc.issuer' \
    --output text | sed -e "s/^https:\/\///")

log_info "OIDC Provider: ${OIDC_PROVIDER}"

# Create IAM policy for S3 access
POLICY_NAME="${ENV_NAME}-catalog-s3-policy"
cat > /tmp/s3-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::${S3_BUCKET}",
        "arn:aws:s3:::${S3_BUCKET}/*"
      ]
    }
  ]
}
EOF

if aws iam get-policy --policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${POLICY_NAME}" &>/dev/null; then
    log_info "IAM policy already exists: ${POLICY_NAME}"
else
    aws iam create-policy \
        --policy-name "${POLICY_NAME}" \
        --policy-document file:///tmp/s3-policy.json &>/dev/null
    log_success "IAM policy created"
fi

# Create IAM role with trust relationship
ROLE_NAME="${ENV_NAME}-catalog-s3-role"
cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/${OIDC_PROVIDER}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "${OIDC_PROVIDER}:sub": "system:serviceaccount:${NAMESPACE}:catalog",
          "${OIDC_PROVIDER}:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
EOF

if aws iam get-role --role-name "${ROLE_NAME}" &>/dev/null; then
    log_info "IAM role already exists: ${ROLE_NAME}"
else
    aws iam create-role \
        --role-name "${ROLE_NAME}" \
        --assume-role-policy-document file:///tmp/trust-policy.json &>/dev/null
    log_success "IAM role created"
fi

# Attach policy to role
aws iam attach-role-policy \
    --role-name "${ROLE_NAME}" \
    --policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${POLICY_NAME}" &>/dev/null

log_success "IRSA configured for S3 access"

# ============================================================================
# STEP 8: Deploy Applications via Helm
# ============================================================================
log_step "Step 8/8: Deploying Core Services"

cd deploy/helm

# Deploy Databases
log_info "Deploying databases..."
DATABASES=("catalogdb" "basketdb" "discountdb" "orderdb" "rabbitmq")

for db in "${DATABASES[@]}"; do
    log_info "  - ${db}"
    helm upgrade --install "eshopping-${db}" \
        "./${db}" \
        -n "${NAMESPACE}" \
        --set image.registry="${ECR_REGISTRY}" \
        --wait \
        --timeout 300s &>/dev/null || log_warning "    ${db} deployment may need manual check"
    log_success "    ${db} deployed"
done

log_success "Databases deployed"

# Wait for databases to be ready
log_info "Waiting for databases to be ready..."
sleep 30

# Deploy Microservices
log_info "Deploying microservices..."
MICROSERVICES=("catalog" "basket" "discount" "ordering")

for service in "${MICROSERVICES[@]}"; do
    log_info "  - ${service}"

    # Special handling for catalog service (needs IRSA annotation)
    if [ "${service}" == "catalog" ]; then
        helm upgrade --install "eshopping-${service}" \
            "./${service}" \
            -n "${NAMESPACE}" \
            --set image.registry="${ECR_REGISTRY}" \
            --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"="arn:aws:iam::${AWS_ACCOUNT_ID}:role/${ROLE_NAME}" \
            --set configmap.AWS__S3__BucketName="${S3_BUCKET}" \
            --set configmap.AWS__S3__Region="${AWS_REGION}" \
            --set env.USE_LOCALSTACK="false" \
            --wait \
            --timeout 300s &>/dev/null || log_warning "    ${service} deployment may need manual check"
    else
        helm upgrade --install "eshopping-${service}" \
            "./${service}" \
            -n "${NAMESPACE}" \
            --set image.registry="${ECR_REGISTRY}" \
            --wait \
            --timeout 300s &>/dev/null || log_warning "    ${service} deployment may need manual check"
    fi

    log_success "    ${service} deployed"
done

log_success "Microservices deployed"

# Deploy API Gateway
log_info "Deploying API Gateway..."
helm upgrade --install eshopping-ocelotapigw \
    "./ocelotapigw" \
    -n "${NAMESPACE}" \
    --set image.registry="${ECR_REGISTRY}" \
    --wait \
    --timeout 300s &>/dev/null || log_warning "API Gateway deployment may need manual check"

log_success "API Gateway deployed"

cd ../..

# ============================================================================
# POST-DEPLOYMENT: Update MongoDB S3 URLs
# ============================================================================
log_info "Updating MongoDB product URLs to use correct S3 bucket..."

MONGO_POD=$(kubectl get pods -n "${NAMESPACE}" | grep catalogdb | awk '{print $1}' | head -1)

if [ -n "$MONGO_POD" ]; then
    S3_URL="https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/products/"
    
    # Update any products with old S3 bucket URLs
    kubectl exec -n "${NAMESPACE}" "$MONGO_POD" -- mongo CatalogDb \
        -u admin -p admin1234 --authenticationDatabase admin \
        --quiet --eval "
        var result = db.Products.updateMany(
            { 'ImageFile': { \$regex: 'ecommerce-product-images-(?!${AWS_ACCOUNT_ID})' } },
            [{ \$set: { 'ImageFile': { \$replaceAll: { input: '\$ImageFile', find: /ecommerce-product-images-[0-9]+\.s3\.[a-z0-9-]+\.amazonaws\.com/, replacement: '${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com' } } } }]
        );
        print('Products updated - Matched: ' + result.matchedCount + ', Modified: ' + result.modifiedCount);
        " 2>/dev/null && log_success "MongoDB URLs updated" || log_info "MongoDB URL update skipped (no changes needed)"
else
    log_warning "MongoDB catalogdb pod not found, skipping URL update"
fi

# ============================================================================
# DEPLOYMENT SUMMARY
# ============================================================================
echo -e ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  DEPLOYMENT COMPLETE                                           ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo -e ""

log_success "All services deployed successfully!"

echo -e ""
echo -e "${BLUE}Deployed Services:${NC}"
kubectl get pods -n "${NAMESPACE}" -o wide

echo -e ""
echo -e "${BLUE}Service Endpoints:${NC}"
kubectl get svc -n "${NAMESPACE}"

echo -e ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Check pod status:"
echo -e "     ${CYAN}kubectl get pods -n ${NAMESPACE}${NC}"
echo -e ""
echo -e "  2. Check service logs:"
echo -e "     ${CYAN}kubectl logs -n ${NAMESPACE} -l app=eshopping-catalog --tail=100${NC}"
echo -e ""
echo -e "  3. Port-forward API Gateway:"
echo -e "     ${CYAN}kubectl port-forward -n ${NAMESPACE} svc/eshopping-ocelotapigw 8080:80${NC}"
echo -e ""
echo -e "  4. Test Catalog API:"
echo -e "     ${CYAN}curl http://localhost:8080/Catalog/GetAllProducts${NC}"
echo -e ""
echo -e "  5. Check S3 bucket:"
echo -e "     ${CYAN}aws s3 ls s3://${S3_BUCKET}/products/${NC}"
echo -e ""
echo -e "${YELLOW}Resource Information:${NC}"
echo -e "  EKS Cluster:   ${GREEN}${CLUSTER_NAME}${NC}"
echo -e "  S3 Bucket:     ${GREEN}${S3_BUCKET}${NC}"
echo -e "  ECR Registry:  ${GREEN}${ECR_REGISTRY}${NC}"
echo -e "  Namespace:     ${GREEN}${NAMESPACE}${NC}"
echo -e ""
echo -e "${YELLOW}Clean Up (when needed):${NC}"
echo -e "  ${CYAN}helm uninstall -n ${NAMESPACE} \$(helm list -n ${NAMESPACE} -q)${NC}"
echo -e "  ${CYAN}aws cloudformation delete-stack --stack-name ${STACK_NAME} --region ${AWS_REGION}${NC}"
echo -e "  ${CYAN}aws s3 rb s3://${S3_BUCKET} --force${NC}"
echo -e ""
