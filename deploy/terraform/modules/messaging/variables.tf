variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for broker placement"
  type        = list(string)
}

variable "rabbitmq_sg_id" {
  description = "Security group ID for RabbitMQ"
  type        = string
}

variable "rabbitmq_username" {
  description = "RabbitMQ admin username"
  type        = string
  default     = "admin"
}

variable "rabbitmq_password" {
  description = "RabbitMQ admin password"
  type        = string
  sensitive   = true
}

variable "broker_instance_type" {
  description = "Instance type for the MQ broker"
  type        = string
  default     = "mq.t3.micro"
}
