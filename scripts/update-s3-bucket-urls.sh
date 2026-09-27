#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  UPDATE S3 BUCKET URLs IN MONGODB                             ║${NC}"
echo -e "${BLUE}║  (From old account's bucket to your current bucket)           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
NAMESPACE="${1:-dev}"
AWS_ACCOUNT_ID="${2:-$(aws sts get-caller-identity --query Account --output text 2>/dev/null)}"
AWS_REGION="${3:-us-east-1}"

# Old bucket (hardcoded in seed data)
OLD_ACCOUNT_ID="321426549525"
OLD_S3_BUCKET="ecommerce-product-images-${OLD_ACCOUNT_ID}"
OLD_REGION="us-east-1"

# New bucket (your current account)
NEW_S3_BUCKET="ecommerce-product-images-${AWS_ACCOUNT_ID}"

OLD_URL_PATTERN="https://${OLD_S3_BUCKET}.s3.${OLD_REGION}.amazonaws.com/products/"
NEW_URL="https://${NEW_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/products/"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Namespace: ${NAMESPACE}"
echo "  Your AWS Account: ${AWS_ACCOUNT_ID}"
echo "  Your AWS Region: ${AWS_REGION}"
echo ""
echo -e "${YELLOW}URL Migration:${NC}"
echo -e "  FROM: ${CYAN}${OLD_URL_PATTERN}${NC}"
echo -e "  TO:   ${GREEN}${NEW_URL}${NC}"
echo ""

if [ "${AWS_ACCOUNT_ID}" == "${OLD_ACCOUNT_ID}" ]; then
    echo -e "${GREEN}✓ Your account ID matches the old bucket. No migration needed.${NC}"
    exit 0
fi

read -p "Continue with migration? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# ============================================================================
# STEP 1: Get MongoDB Pod
# ============================================================================
echo -e "\n${BLUE}[1/4] Finding MongoDB pod...${NC}"

MONGO_POD=$(kubectl get pods -n "${NAMESPACE}" -l app.kubernetes.io/name=catalogdb -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -z "${MONGO_POD}" ]; then
    # Try alternative label
    MONGO_POD=$(kubectl get pods -n "${NAMESPACE}" -l app.kubernetes.io/instance=eshopping-catalogdb -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
fi

if [ -z "${MONGO_POD}" ]; then
    # Try grep pattern
    MONGO_POD=$(kubectl get pods -n "${NAMESPACE}" 2>/dev/null | grep catalogdb | awk '{print $1}' | head -1)
fi

if [ -z "${MONGO_POD}" ]; then
    echo -e "${RED}Error: MongoDB pod not found in namespace ${NAMESPACE}${NC}"
    echo "Available pods:"
    kubectl get pods -n "${NAMESPACE}" | grep -iE "mongo|catalog" || kubectl get pods -n "${NAMESPACE}"
    exit 1
fi

echo -e "${GREEN}✓ Found MongoDB pod: ${MONGO_POD}${NC}"

# ============================================================================
# STEP 2: Check Current Product URLs
# ============================================================================
echo -e "\n${BLUE}[2/4] Checking current product URLs...${NC}"

OLD_BUCKET_COUNT=$(kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- mongosh CatalogDb \
    --username admin \
    --password admin1234 \
    --authenticationDatabase admin \
    --quiet \
    --eval "db.Products.countDocuments({'ImageFile': {\$regex: '${OLD_ACCOUNT_ID}'}})" 2>/dev/null || echo "0")

TOTAL_COUNT=$(kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- mongosh CatalogDb \
    --username admin \
    --password admin1234 \
    --authenticationDatabase admin \
    --quiet \
    --eval 'db.Products.countDocuments({})' 2>/dev/null || echo "0")

echo -e "${YELLOW}Products with old S3 bucket (${OLD_ACCOUNT_ID}): ${OLD_BUCKET_COUNT}${NC}"
echo -e "${YELLOW}Total products: ${TOTAL_COUNT}${NC}"

if [ "${OLD_BUCKET_COUNT}" == "0" ]; then
    echo -e "${GREEN}✓ No products with old S3 bucket URLs found.${NC}"
    
    # Check if there are any S3 URLs at all
    echo ""
    echo "Sample product URLs:"
    kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- mongosh CatalogDb \
        --username admin \
        --password admin1234 \
        --authenticationDatabase admin \
        --quiet \
        --eval 'db.Products.find({}, {ImageFile: 1, Name: 1}).limit(3).forEach(p => print(p.Name + ": " + p.ImageFile))' 2>/dev/null || true
    exit 0
fi

# ============================================================================
# STEP 3: Update Product URLs
# ============================================================================
echo -e "\n${BLUE}[3/4] Updating product URLs to your S3 bucket...${NC}"

# Create MongoDB update script
cat > /tmp/mongo-update-s3-urls.js <<EOF
db = db.getSiblingDB('CatalogDb');

// Update all products with old S3 bucket URLs
var result = db.Products.updateMany(
    { "ImageFile": { \$regex: "${OLD_ACCOUNT_ID}" } },
    [{
        \$set: {
            "ImageFile": {
                \$replaceOne: {
                    input: "\$ImageFile",
                    find: "${OLD_URL_PATTERN}",
                    replacement: "${NEW_URL}"
                }
            }
        }
    }]
);

print("Matched: " + result.matchedCount);
print("Modified: " + result.modifiedCount);
EOF

# Copy script to pod and execute
kubectl cp /tmp/mongo-update-s3-urls.js "${NAMESPACE}/${MONGO_POD}:/tmp/mongo-update-s3-urls.js"

RESULT=$(kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- mongosh CatalogDb \
    --username admin \
    --password admin1234 \
    --authenticationDatabase admin \
    --quiet \
    --file /tmp/mongo-update-s3-urls.js 2>/dev/null) || {
    # Fallback to old mongo shell if mongosh fails
    RESULT=$(kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- mongo CatalogDb \
        --username admin \
        --password admin1234 \
        --authenticationDatabase admin \
        --quiet \
        /tmp/mongo-update-s3-urls.js 2>/dev/null)
}

echo "${RESULT}"

# Clean up
kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- rm -f /tmp/mongo-update-s3-urls.js 2>/dev/null || true
rm -f /tmp/mongo-update-s3-urls.js

echo -e "${GREEN}✓ Product URLs updated${NC}"

# ============================================================================
# STEP 4: Verify Migration
# ============================================================================
echo -e "\n${BLUE}[4/4] Verifying migration...${NC}"

# Check for any remaining old URLs
REMAINING_OLD=$(kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- mongosh CatalogDb \
    --username admin \
    --password admin1234 \
    --authenticationDatabase admin \
    --quiet \
    --eval "db.Products.countDocuments({'ImageFile': {\$regex: '${OLD_ACCOUNT_ID}'}})" 2>/dev/null || echo "0")

# Check new S3 URLs
NEW_S3_COUNT=$(kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- mongosh CatalogDb \
    --username admin \
    --password admin1234 \
    --authenticationDatabase admin \
    --quiet \
    --eval "db.Products.countDocuments({'ImageFile': {\$regex: '${AWS_ACCOUNT_ID}'}})" 2>/dev/null || echo "0")

echo -e "${YELLOW}Products with old bucket URLs remaining: ${REMAINING_OLD}${NC}"
echo -e "${GREEN}Products with new bucket URLs: ${NEW_S3_COUNT}${NC}"

# Show sample updated URLs
echo ""
echo -e "${BLUE}Sample updated product URLs:${NC}"
kubectl exec -n "${NAMESPACE}" "${MONGO_POD}" -- mongosh CatalogDb \
    --username admin \
    --password admin1234 \
    --authenticationDatabase admin \
    --quiet \
    --eval 'db.Products.find({}, {ImageFile: 1, Name: 1}).limit(3).forEach(p => print(p.Name + ": " + p.ImageFile))' 2>/dev/null || true

if [ "${REMAINING_OLD}" == "0" ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ MIGRATION COMPLETED SUCCESSFULLY!                          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Verify images are in your S3 bucket:"
    echo -e "     ${CYAN}aws s3 ls s3://${NEW_S3_BUCKET}/products/${NC}"
    echo ""
    echo "  2. If images are missing, upload them:"
    echo -e "     ${CYAN}aws s3 sync frontend/legacy-angular/src/images/products/ s3://${NEW_S3_BUCKET}/products/${NC}"
    echo ""
    echo "  3. Restart the Catalog API pod to clear any cache:"
    echo -e "     ${CYAN}kubectl rollout restart deployment catalog -n ${NAMESPACE}${NC}"
else
    echo ""
    echo -e "${RED}⚠ WARNING: Some products still have old bucket URLs${NC}"
    echo "  You may need to run this script again or check the URLs manually."
fi
