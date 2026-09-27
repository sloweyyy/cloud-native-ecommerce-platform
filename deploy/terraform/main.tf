# =============================================================================
# Root Module — Wires all modules together
# =============================================================================
# This is the entry point. Terraform reads this file first.
# Each "module" block calls a child module and passes in variables.
#
# Dependency order (Terraform figures this out automatically):
#   networking -> security -> eks, databases, messaging, observability, storage
#   ecr has no dependencies (it's just a registry)

# -----------------------------------------------------------------------------
# 1. Networking — VPC, subnets, gateways
# -----------------------------------------------------------------------------
module "networking" {
  source = "./modules/networking"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
}

# -----------------------------------------------------------------------------
# 2. Security — Security groups and IAM
# -----------------------------------------------------------------------------
module "security" {
  source = "./modules/security"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.networking.vpc_id
}

# -----------------------------------------------------------------------------
# 3. EKS — Kubernetes cluster
# -----------------------------------------------------------------------------
module "eks" {
  source = "./modules/eks"

  project_name        = var.project_name
  environment         = var.environment
  private_subnet_ids  = module.networking.private_subnet_ids
  cluster_sg_id       = module.security.eks_cluster_sg_id
  kubernetes_version  = var.kubernetes_version
  node_instance_types = var.node_instance_types
  node_desired_size   = var.node_desired_size
  node_min_size       = var.node_min_size
  node_max_size       = var.node_max_size
}

# -----------------------------------------------------------------------------
# 4. ECR — Container image registries
# -----------------------------------------------------------------------------
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
}

# -----------------------------------------------------------------------------
# 5. Databases — DocumentDB, ElastiCache, RDS PostgreSQL, RDS SQL Server
# -----------------------------------------------------------------------------
module "databases" {
  source = "./modules/databases"

  project_name       = var.project_name
  environment        = var.environment
  private_subnet_ids = module.networking.private_subnet_ids
  databases_sg_id    = module.security.databases_sg_id

  mongodb_password  = var.mongodb_password
  postgres_password = var.postgres_password
  mssql_password    = var.mssql_password
}

# -----------------------------------------------------------------------------
# 6. Messaging — Amazon MQ (RabbitMQ)
# -----------------------------------------------------------------------------
module "messaging" {
  source = "./modules/messaging"

  project_name       = var.project_name
  environment        = var.environment
  private_subnet_ids = module.networking.private_subnet_ids
  rabbitmq_sg_id     = module.security.rabbitmq_sg_id
  rabbitmq_password  = var.rabbitmq_password
}

# -----------------------------------------------------------------------------
# 7. Storage — S3 for product images
# -----------------------------------------------------------------------------
module "storage" {
  source = "./modules/storage"

  project_name = var.project_name
  environment  = var.environment
}

# -----------------------------------------------------------------------------
# 8. Observability — OpenSearch (Elasticsearch + Kibana)
# -----------------------------------------------------------------------------
module "observability" {
  source = "./modules/observability"

  project_name       = var.project_name
  environment        = var.environment
  private_subnet_ids = module.networking.private_subnet_ids
  opensearch_sg_id   = module.security.opensearch_sg_id
}
