output "rabbitmq_endpoint" {
  description = "RabbitMQ AMQP endpoint (amqps:// for TLS)"
  value       = aws_mq_broker.rabbitmq.instances[0].endpoints[0]
}

output "rabbitmq_console_url" {
  description = "RabbitMQ management console URL"
  value       = aws_mq_broker.rabbitmq.instances[0].console_url
}

output "broker_id" {
  description = "Amazon MQ broker ID"
  value       = aws_mq_broker.rabbitmq.id
}
