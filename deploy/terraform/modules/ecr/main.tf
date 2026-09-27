# =============================================================================
# ECR Module — Container Image Registries
# =============================================================================
# Amazon ECR is a Docker registry. Each microservice gets its own repository
# to store Docker images (like Docker Hub, but private and inside your AWS).
#
# Your CI/CD pipeline will: build image -> push to ECR -> deploy to EKS.

resource "aws_ecr_repository" "services" {
  for_each = toset(var.repository_names)

  name                 = "${var.project_name}/${each.value}"
  image_tag_mutability = "MUTABLE" # Allows overwriting tags (e.g., "latest")

  # Scan images for vulnerabilities on push
  image_scanning_configuration {
    scan_on_push = true
  }

  # Encrypt images at rest
  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name    = each.value
    Service = each.value
  }
}

# -----------------------------------------------------------------------------
# Lifecycle Policy — Auto-cleanup old images to save storage costs
# -----------------------------------------------------------------------------
resource "aws_ecr_lifecycle_policy" "services" {
  for_each = aws_ecr_repository.services

  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Remove untagged images after 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
