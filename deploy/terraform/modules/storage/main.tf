# =============================================================================
# Storage Module — S3 for Product Images
# =============================================================================
# Your Catalog service stores product images in S3.
# Locally you use LocalStack to simulate S3; in AWS it's the real thing.

resource "aws_s3_bucket" "product_images" {
  bucket = "${var.project_name}-${var.environment}-product-images"

  tags = {
    Name    = "${var.project_name}-${var.environment}-product-images"
    Service = "catalog"
  }
}

# Enable versioning — never lose an image, even if overwritten
resource "aws_s3_bucket_versioning" "product_images" {
  bucket = aws_s3_bucket.product_images.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Encrypt images at rest
resource "aws_s3_bucket_server_side_encryption_configuration" "product_images" {
  bucket = aws_s3_bucket.product_images.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block all public access — images served through CloudFront or pre-signed URLs
resource "aws_s3_bucket_public_access_block" "product_images" {
  bucket = aws_s3_bucket.product_images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle rule: move old image versions to cheaper storage after 30 days
resource "aws_s3_bucket_lifecycle_configuration" "product_images" {
  bucket = aws_s3_bucket.product_images.id

  rule {
    id     = "archive-old-versions"
    status = "Enabled"

    filter {} # Apply to all objects in the bucket

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA" # Infrequent Access — cheaper
    }

    noncurrent_version_expiration {
      noncurrent_days = 90 # Delete old versions after 90 days
    }
  }
}

# -----------------------------------------------------------------------------
# IAM Policy for Catalog Service Pod (IRSA)
# -----------------------------------------------------------------------------
# This policy document defines what S3 actions the Catalog pod can perform.
# You'll attach this to a Kubernetes service account via IRSA.

resource "aws_iam_policy" "catalog_s3_access" {
  name        = "${var.project_name}-${var.environment}-catalog-s3-access"
  description = "Allows Catalog service to read/write product images in S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
        ]
        Resource = [
          aws_s3_bucket.product_images.arn,
          "${aws_s3_bucket.product_images.arn}/*",
        ]
      }
    ]
  })
}
