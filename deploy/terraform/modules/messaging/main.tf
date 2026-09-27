# =============================================================================
# Messaging Module — Amazon MQ for RabbitMQ
# =============================================================================
# Amazon MQ is a managed message broker. Your services use RabbitMQ for
# async communication (e.g., Basket -> Ordering when a checkout happens).
#
# Amazon MQ runs RabbitMQ for you — no patching, no scaling headaches.

resource "aws_mq_broker" "rabbitmq" {
  broker_name = "${var.project_name}-${var.environment}-rabbitmq"

  engine_type        = "RabbitMQ"
  engine_version     = "3.13"
  host_instance_type = var.broker_instance_type
  deployment_mode    = var.environment == "prod" ? "CLUSTER_MULTI_AZ" : "SINGLE_INSTANCE"

  # Authentication
  user {
    username = var.rabbitmq_username
    password = var.rabbitmq_password
  }

  # Network — place broker in private subnets
  subnet_ids          = var.environment == "prod" ? var.private_subnet_ids : [var.private_subnet_ids[0]]
  security_groups     = [var.rabbitmq_sg_id]
  publicly_accessible = false

  # Logging
  logs {
    general = true
  }

  # Maintenance window (UTC)
  maintenance_window_start_time {
    day_of_week = "SUNDAY"
    time_of_day = "03:00"
    time_zone   = "UTC"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-rabbitmq"
  }
}
