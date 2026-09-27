# =============================================================================
# Root Outputs — Important values printed after `terraform apply`
# =============================================================================
# These are the values you'll need to configure your app and connect kubectl.

# --- Networking ---
output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

# --- EKS ---
output "eks_cluster_name" {
  description = "EKS cluster name (use with: aws eks update-kubeconfig --name <this>)"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS API server endpoint"
  value       = module.eks.cluster_endpoint
}

# --- ECR ---
output "ecr_repository_urls" {
  description = "ECR repository URLs for each service"
  value       = module.ecr.repository_urls
}

# --- Databases ---
output "documentdb_endpoint" {
  description = "DocumentDB endpoint (Catalog service)"
  value       = module.databases.documentdb_endpoint
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint (Basket service)"
  value       = module.databases.redis_endpoint
}

output "postgres_endpoint" {
  description = "RDS PostgreSQL endpoint (Discount service)"
  value       = module.databases.postgres_endpoint
}

output "mssql_endpoint" {
  description = "RDS SQL Server endpoint (Ordering service)"
  value       = module.databases.mssql_endpoint
}

# --- Messaging ---
output "rabbitmq_endpoint" {
  description = "Amazon MQ RabbitMQ endpoint"
  value       = module.messaging.rabbitmq_endpoint
}

# --- Storage ---
output "product_images_bucket" {
  description = "S3 bucket name for product images"
  value       = module.storage.product_images_bucket_name
}

# --- Observability ---
output "opensearch_endpoint" {
  description = "OpenSearch endpoint (Elasticsearch-compatible)"
  value       = module.observability.opensearch_endpoint
}

output "opensearch_dashboard" {
  description = "OpenSearch Dashboards URL (Kibana equivalent)"
  value       = module.observability.opensearch_dashboard_endpoint
}
