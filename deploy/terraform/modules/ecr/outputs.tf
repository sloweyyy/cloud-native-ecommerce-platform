output "repository_urls" {
  description = "Map of service name -> ECR repository URL"
  value = {
    for name, repo in aws_ecr_repository.services : name => repo.repository_url
  }
}

output "registry_id" {
  description = "The AWS account ID that owns the registries"
  value       = values(aws_ecr_repository.services)[0].registry_id
}
