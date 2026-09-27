# =============================================================================
# Security Module — Security Groups & IAM
# =============================================================================
# Security groups act as virtual firewalls for your AWS resources.
# Each group defines which traffic is allowed in (ingress) and out (egress).

# -----------------------------------------------------------------------------
# EKS Cluster Security Group
# -----------------------------------------------------------------------------
resource "aws_security_group" "eks_cluster" {
  name_prefix = "${var.project_name}-${var.environment}-eks-cluster-"
  description = "Security group for EKS cluster control plane"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-${var.environment}-eks-cluster-sg"
  }

  # Terraform destroys before creating when name conflicts; this fixes that
  lifecycle {
    create_before_destroy = true
  }
}

# EKS nodes need to talk to the control plane (API server) on port 443
resource "aws_security_group_rule" "eks_cluster_ingress_nodes" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.eks_nodes.id
  security_group_id        = aws_security_group.eks_cluster.id
  description              = "Allow worker nodes to communicate with cluster API"
}

resource "aws_security_group_rule" "eks_cluster_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.eks_cluster.id
  description       = "Allow all outbound traffic"
}

# -----------------------------------------------------------------------------
# EKS Node Security Group
# -----------------------------------------------------------------------------
resource "aws_security_group" "eks_nodes" {
  name_prefix = "${var.project_name}-${var.environment}-eks-nodes-"
  description = "Security group for EKS worker nodes"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-${var.environment}-eks-nodes-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Nodes need to talk to each other (for pod-to-pod communication)
resource "aws_security_group_rule" "eks_nodes_internal" {
  type                     = "ingress"
  from_port                = 0
  to_port                  = 65535
  protocol                 = "-1"
  source_security_group_id = aws_security_group.eks_nodes.id
  security_group_id        = aws_security_group.eks_nodes.id
  description              = "Allow nodes to communicate with each other"
}

# Control plane needs to talk to nodes (for kubectl exec, logs, etc.)
resource "aws_security_group_rule" "eks_nodes_ingress_cluster" {
  type                     = "ingress"
  from_port                = 1025
  to_port                  = 65535
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.eks_cluster.id
  security_group_id        = aws_security_group.eks_nodes.id
  description              = "Allow cluster control plane to communicate with nodes"
}

resource "aws_security_group_rule" "eks_nodes_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.eks_nodes.id
  description       = "Allow all outbound traffic"
}

# -----------------------------------------------------------------------------
# Database Security Group — Shared by all database resources
# -----------------------------------------------------------------------------
resource "aws_security_group" "databases" {
  name_prefix = "${var.project_name}-${var.environment}-databases-"
  description = "Security group for all database resources"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-${var.environment}-databases-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Allow EKS nodes to connect to MongoDB (DocumentDB)
resource "aws_security_group_rule" "db_mongodb" {
  type                     = "ingress"
  from_port                = 27017
  to_port                  = 27017
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.eks_nodes.id
  security_group_id        = aws_security_group.databases.id
  description              = "MongoDB/DocumentDB from EKS nodes"
}

# Allow EKS nodes to connect to Redis (ElastiCache)
resource "aws_security_group_rule" "db_redis" {
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.eks_nodes.id
  security_group_id        = aws_security_group.databases.id
  description              = "Redis/ElastiCache from EKS nodes"
}

# Allow EKS nodes to connect to PostgreSQL (RDS)
resource "aws_security_group_rule" "db_postgres" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.eks_nodes.id
  security_group_id        = aws_security_group.databases.id
  description              = "PostgreSQL/RDS from EKS nodes"
}

# Allow EKS nodes to connect to SQL Server (RDS)
resource "aws_security_group_rule" "db_mssql" {
  type                     = "ingress"
  from_port                = 1433
  to_port                  = 1433
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.eks_nodes.id
  security_group_id        = aws_security_group.databases.id
  description              = "SQL Server/RDS from EKS nodes"
}

resource "aws_security_group_rule" "db_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.databases.id
  description       = "Allow all outbound traffic"
}

# -----------------------------------------------------------------------------
# RabbitMQ (Amazon MQ) Security Group
# -----------------------------------------------------------------------------
resource "aws_security_group" "rabbitmq" {
  name_prefix = "${var.project_name}-${var.environment}-rabbitmq-"
  description = "Security group for Amazon MQ RabbitMQ"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-${var.environment}-rabbitmq-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# AMQP protocol port
resource "aws_security_group_rule" "rabbitmq_amqp" {
  type                     = "ingress"
  from_port                = 5671
  to_port                  = 5671
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.eks_nodes.id
  security_group_id        = aws_security_group.rabbitmq.id
  description              = "AMQP (TLS) from EKS nodes"
}

# RabbitMQ management console
resource "aws_security_group_rule" "rabbitmq_management" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.eks_nodes.id
  security_group_id        = aws_security_group.rabbitmq.id
  description              = "RabbitMQ management console from EKS nodes"
}

resource "aws_security_group_rule" "rabbitmq_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.rabbitmq.id
  description       = "Allow all outbound traffic"
}

# -----------------------------------------------------------------------------
# OpenSearch Security Group
# -----------------------------------------------------------------------------
resource "aws_security_group" "opensearch" {
  name_prefix = "${var.project_name}-${var.environment}-opensearch-"
  description = "Security group for Amazon OpenSearch"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-${var.environment}-opensearch-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group_rule" "opensearch_https" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.eks_nodes.id
  security_group_id        = aws_security_group.opensearch.id
  description              = "HTTPS from EKS nodes"
}

resource "aws_security_group_rule" "opensearch_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.opensearch.id
  description       = "Allow all outbound traffic"
}
