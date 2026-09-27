output "product_images_bucket_name" {
  description = "S3 bucket name for product images"
  value       = aws_s3_bucket.product_images.id
}

output "product_images_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.product_images.arn
}

output "catalog_s3_policy_arn" {
  description = "IAM policy ARN for Catalog service S3 access"
  value       = aws_iam_policy.catalog_s3_access.arn
}
