variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for database placement"
  type        = list(string)
}

variable "databases_sg_id" {
  description = "Security group ID for database access"
  type        = string
}

# --- DocumentDB (MongoDB) ---

variable "mongodb_username" {
  description = "Master username for DocumentDB"
  type        = string
  default     = "admin"
}

variable "mongodb_password" {
  description = "Master password for DocumentDB"
  type        = string
  sensitive   = true # Marked sensitive — Terraform won't show it in logs
}

variable "documentdb_instance_class" {
  description = "Instance class for DocumentDB (db.t3.medium is smallest)"
  type        = string
  default     = "db.t3.medium"
}

variable "documentdb_instance_count" {
  description = "Number of DocumentDB instances (1 for dev, 2+ for prod)"
  type        = number
  default     = 1
}

# --- ElastiCache Redis ---

variable "redis_node_type" {
  description = "Node type for ElastiCache Redis"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_clusters" {
  description = "Number of Redis cache clusters (1 for dev, 2+ for HA)"
  type        = number
  default     = 1
}

# --- RDS (PostgreSQL & SQL Server) ---

variable "rds_instance_class" {
  description = "Instance class for RDS databases"
  type        = string
  default     = "db.t3.micro"
}

variable "postgres_db_name" {
  description = "Database name for the discount service"
  type        = string
  default     = "DiscountDb"
}

variable "postgres_username" {
  description = "Master username for PostgreSQL"
  type        = string
  default     = "admin"
}

variable "postgres_password" {
  description = "Master password for PostgreSQL"
  type        = string
  sensitive   = true
}

variable "mssql_password" {
  description = "SA password for SQL Server"
  type        = string
  sensitive   = true
}
