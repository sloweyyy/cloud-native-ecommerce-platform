output "eks_cluster_sg_id" {
  description = "Security group ID for EKS cluster"
  value       = aws_security_group.eks_cluster.id
}

output "eks_nodes_sg_id" {
  description = "Security group ID for EKS worker nodes"
  value       = aws_security_group.eks_nodes.id
}

output "databases_sg_id" {
  description = "Security group ID for databases"
  value       = aws_security_group.databases.id
}

output "rabbitmq_sg_id" {
  description = "Security group ID for RabbitMQ"
  value       = aws_security_group.rabbitmq.id
}

output "opensearch_sg_id" {
  description = "Security group ID for OpenSearch"
  value       = aws_security_group.opensearch.id
}
