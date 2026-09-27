# =============================================================================
# Root Variables — Input values for the entire infrastructure
# =============================================================================
# Set these in terraform.tfvars (for local) or via CI/CD environment variables.
# Variables marked "sensitive" won't appear in Terraform's output or logs.

# --- General ---

variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name — used as prefix for all resource names"
  type        = string
  default     = "ecommerce"
}

variable "environment" {
  description = "Environment: dev, staging, or prod"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# --- Networking ---

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# --- EKS ---

variable "kubernetes_version" {
  description = "Kubernetes version for EKS"
  type        = string
  default     = "1.29"
}

variable "node_instance_types" {
  description = "EC2 instance types for EKS worker nodes"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_desired_size" {
  description = "Desired number of EKS worker nodes"
  type        = number
  default     = 2
}

variable "node_min_size" {
  description = "Minimum number of EKS worker nodes"
  type        = number
  default     = 1
}

variable "node_max_size" {
  description = "Maximum number of EKS worker nodes"
  type        = number
  default     = 4
}

# --- Database Credentials ---
# These are sensitive — store in terraform.tfvars (gitignored) or use
# AWS Secrets Manager / environment variables in CI/CD.

variable "mongodb_password" {
  description = "Password for DocumentDB (MongoDB)"
  type        = string
  sensitive   = true
}

variable "postgres_password" {
  description = "Password for RDS PostgreSQL"
  type        = string
  sensitive   = true
}

variable "mssql_password" {
  description = "SA password for RDS SQL Server"
  type        = string
  sensitive   = true
}

variable "rabbitmq_password" {
  description = "Password for Amazon MQ RabbitMQ"
  type        = string
  sensitive   = true
}
