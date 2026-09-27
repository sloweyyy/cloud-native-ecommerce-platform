# =============================================================================
# Databases Module — All Managed Database Services
# =============================================================================
# Maps your docker-compose databases to AWS managed services:
#
#   Local (docker-compose)        AWS Managed Service
#   ─────────────────────         ───────────────────
#   MongoDB (catalogdb)      -->  Amazon DocumentDB
#   Redis (basketdb)         -->  Amazon ElastiCache Redis
#   PostgreSQL (discountdb)  -->  Amazon RDS PostgreSQL
#   SQL Server (orderdb)     -->  Amazon RDS SQL Server

# Subnet groups tell AWS "put the database in these subnets"
resource "aws_db_subnet_group" "main" {
  name        = "${var.project_name}-${var.environment}-db-subnet"
  description = "Database subnet group for RDS instances"
  subnet_ids  = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet"
  }
}

resource "aws_docdb_subnet_group" "main" {
  name        = "${var.project_name}-${var.environment}-docdb-subnet"
  description = "Subnet group for DocumentDB"
  subnet_ids  = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-docdb-subnet"
  }
}

resource "aws_elasticache_subnet_group" "main" {
  name        = "${var.project_name}-${var.environment}-redis-subnet"
  description = "Subnet group for ElastiCache Redis"
  subnet_ids  = var.private_subnet_ids
}

# =============================================================================
# 1. DocumentDB (MongoDB) — Catalog Service
# =============================================================================
# DocumentDB is AWS's MongoDB-compatible database.
# It's a cluster with 1+ instances (like MongoDB replica set).

resource "aws_docdb_cluster" "catalog" {
  cluster_identifier     = "${var.project_name}-${var.environment}-catalog"
  engine                 = "docdb"
  master_username        = var.mongodb_username
  master_password        = var.mongodb_password
  db_subnet_group_name   = aws_docdb_subnet_group.main.name
  vpc_security_group_ids = [var.databases_sg_id]

  # Skip final snapshot when destroying (useful for dev, disable for prod)
  skip_final_snapshot = var.environment != "prod"

  tags = {
    Name    = "${var.project_name}-${var.environment}-catalog-docdb"
    Service = "catalog"
  }
}

resource "aws_docdb_cluster_instance" "catalog" {
  count              = var.documentdb_instance_count
  identifier         = "${var.project_name}-${var.environment}-catalog-${count.index}"
  cluster_identifier = aws_docdb_cluster.catalog.id
  instance_class     = var.documentdb_instance_class

  tags = {
    Name    = "${var.project_name}-${var.environment}-catalog-instance-${count.index}"
    Service = "catalog"
  }
}

# =============================================================================
# 2. ElastiCache Redis — Basket Service
# =============================================================================
# ElastiCache runs Redis for you. Used for shopping basket/cart storage.
# Replication group = Redis with automatic failover.

resource "aws_elasticache_replication_group" "basket" {
  replication_group_id = "${var.project_name}-${var.environment}-basket"
  description          = "Redis for basket service"
  node_type            = var.redis_node_type
  num_cache_clusters   = var.redis_num_cache_clusters
  engine_version       = "7.0"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [var.databases_sg_id]

  # Enable encryption
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  # Auto failover requires 2+ nodes
  automatic_failover_enabled = var.redis_num_cache_clusters > 1

  tags = {
    Name    = "${var.project_name}-${var.environment}-basket-redis"
    Service = "basket"
  }
}

# =============================================================================
# 3. RDS PostgreSQL — Discount Service
# =============================================================================
resource "aws_db_instance" "discount" {
  identifier     = "${var.project_name}-${var.environment}-discount"
  engine         = "postgres"
  engine_version = "14"
  instance_class = var.rds_instance_class

  db_name  = var.postgres_db_name
  username = var.postgres_username
  password = var.postgres_password

  allocated_storage     = 20
  max_allocated_storage = 100 # Enables storage autoscaling up to 100GB

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.databases_sg_id]

  multi_az            = var.environment == "prod" # High availability for prod
  skip_final_snapshot = var.environment != "prod"
  storage_encrypted   = true

  # Enable automated backups (7-day retention)
  backup_retention_period = 7
  deletion_protection     = var.environment == "prod"

  tags = {
    Name    = "${var.project_name}-${var.environment}-discount-postgres"
    Service = "discount"
  }
}

# =============================================================================
# 4. RDS SQL Server — Ordering Service
# =============================================================================
resource "aws_db_instance" "ordering" {
  identifier     = "${var.project_name}-${var.environment}-ordering"
  engine         = "sqlserver-ex" # Express edition (free tier eligible)
  engine_version = "15.00"
  instance_class = var.rds_instance_class

  username = "sa"
  password = var.mssql_password

  allocated_storage     = 20
  max_allocated_storage = 100

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.databases_sg_id]

  multi_az            = false # SQL Server Express doesn't support Multi-AZ
  skip_final_snapshot = var.environment != "prod"
  storage_encrypted   = true

  backup_retention_period = 7
  deletion_protection     = var.environment == "prod"

  # SQL Server license is included in the price
  license_model = "license-included"

  tags = {
    Name    = "${var.project_name}-${var.environment}-ordering-mssql"
    Service = "ordering"
  }
}
