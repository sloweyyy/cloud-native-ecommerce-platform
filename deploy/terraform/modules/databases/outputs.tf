# These connection endpoints are what your microservices will use.

output "documentdb_endpoint" {
  description = "DocumentDB cluster endpoint (for Catalog service)"
  value       = aws_docdb_cluster.catalog.endpoint
}

output "documentdb_port" {
  description = "DocumentDB port"
  value       = aws_docdb_cluster.catalog.port
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint (for Basket service)"
  value       = aws_elasticache_replication_group.basket.primary_endpoint_address
}

output "redis_port" {
  description = "Redis port"
  value       = 6379
}

output "postgres_endpoint" {
  description = "RDS PostgreSQL endpoint (for Discount service)"
  value       = aws_db_instance.discount.endpoint
}

output "postgres_address" {
  description = "RDS PostgreSQL hostname only (without port)"
  value       = aws_db_instance.discount.address
}

output "mssql_endpoint" {
  description = "RDS SQL Server endpoint (for Ordering service)"
  value       = aws_db_instance.ordering.endpoint
}

output "mssql_address" {
  description = "RDS SQL Server hostname only (without port)"
  value       = aws_db_instance.ordering.address
}
