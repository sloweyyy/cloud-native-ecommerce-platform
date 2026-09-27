# =============================================================================
# Observability Module — Amazon OpenSearch (Elasticsearch + Kibana)
# =============================================================================
# Your services send logs to Elasticsearch. On AWS, the managed equivalent
# is Amazon OpenSearch Service. It includes OpenSearch Dashboards (Kibana).
#
# OpenSearch is API-compatible with Elasticsearch 7.x, so your existing
# logging code should work with minimal changes.

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

resource "aws_opensearch_domain" "logs" {
  domain_name    = "${var.project_name}-${var.environment}-logs"
  engine_version = "OpenSearch_2.11"

  # Cluster configuration
  cluster_config {
    instance_type  = var.opensearch_instance_type
    instance_count = var.opensearch_instance_count

    # Enable dedicated master nodes for production
    dedicated_master_enabled = var.environment == "prod"
    dedicated_master_type    = var.environment == "prod" ? "m6g.large.search" : null
    dedicated_master_count   = var.environment == "prod" ? 3 : null

    # Zone awareness for high availability
    zone_awareness_enabled = var.opensearch_instance_count > 1
  }

  # Storage
  ebs_options {
    ebs_enabled = true
    volume_size = var.opensearch_volume_size
    volume_type = "gp3"
  }

  # Place in VPC (not public internet)
  vpc_options {
    subnet_ids         = var.opensearch_instance_count > 1 ? var.private_subnet_ids : [var.private_subnet_ids[0]]
    security_group_ids = [var.opensearch_sg_id]
  }

  # Encryption
  encrypt_at_rest {
    enabled = true
  }

  node_to_node_encryption {
    enabled = true
  }

  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }

  # Access policy — allow VPC access
  access_policies = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { AWS = "*" }
      Action    = "es:*"
      Resource  = "arn:aws:es:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:domain/${var.project_name}-${var.environment}-logs/*"
    }]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-opensearch"
  }
}
