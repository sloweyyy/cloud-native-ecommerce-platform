# =============================================================================
# Terraform State Backend
# =============================================================================
# Terraform tracks what it has created in a "state file".
# By default, state is stored locally in terraform.tfstate.
#
# For team collaboration, store state remotely in S3 with DynamoDB locking.
# Uncomment the block below after creating the S3 bucket and DynamoDB table.
#
# To bootstrap (create the bucket/table), first run with local state,
# then migrate: terraform init -migrate-state

# terraform {
#   backend "s3" {
#     bucket         = "ecommerce-terraform-state"
#     key            = "infrastructure/terraform.tfstate"
#     region         = "ap-southeast-1"
#     encrypt        = true
#     dynamodb_table = "ecommerce-terraform-locks"
#   }
# }
