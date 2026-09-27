# =============================================================================
# Terraform & Provider Version Constraints
# =============================================================================
# This file pins the Terraform CLI version and provider versions.
# "~>" means: allow only patch-level upgrades (e.g., 5.80.0 -> 5.80.x).

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}
