# =============================================================================
# AWS Provider Configuration
# =============================================================================
# Configures how Terraform authenticates and connects to AWS.
# The region comes from a variable so you can deploy to any region.

provider "aws" {
  region = var.aws_region

  # Tags applied to EVERY resource Terraform creates.
  # This helps with cost tracking and identifying resources.
  default_tags {
    tags = {
      Project     = "cloud-native-ecommerce"
      ManagedBy   = "terraform"
      Environment = var.environment
    }
  }
}
