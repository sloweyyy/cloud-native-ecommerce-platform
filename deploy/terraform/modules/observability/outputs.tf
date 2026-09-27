output "opensearch_endpoint" {
  description = "OpenSearch domain endpoint (use as Elasticsearch URL)"
  value       = aws_opensearch_domain.logs.endpoint
}

output "opensearch_dashboard_endpoint" {
  description = "OpenSearch Dashboards URL (Kibana equivalent)"
  value       = aws_opensearch_domain.logs.dashboard_endpoint
}

output "opensearch_domain_name" {
  description = "OpenSearch domain name"
  value       = aws_opensearch_domain.logs.domain_name
}
