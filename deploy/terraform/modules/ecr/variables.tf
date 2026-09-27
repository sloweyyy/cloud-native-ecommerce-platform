variable "project_name" {
  description = "Project name used as prefix for repository names"
  type        = string
}

variable "repository_names" {
  description = "List of ECR repository names (one per microservice)"
  type        = list(string)
  default = [
    "catalog-api",
    "basket-api",
    "discount-api",
    "ordering-api",
    "ocelot-apigateway",
  ]
}
