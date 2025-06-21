# E-Commerce Platform Deployment Guide

This guide explains how to deploy the cloud-native e-commerce platform using two different methods:

1. Helm charts (recommended method)
2. Raw Kubernetes manifests

## Prerequisites

- Kubernetes cluster (minikube, Docker Desktop, or a cloud provider)
- kubectl command-line tool
- Helm (for Helm-based deployment)

## Deployment with Helm Charts

The recommended way to deploy the application is using Helm charts.

### Quick Deployment

To quickly deploy all services with one command:

```bash
./deploy.sh
```

This script will install all required services, including:

- Catalog service (with MongoDB)
- Basket service (with Redis)
- Discount service (with PostgreSQL)
- Ordering service (with SQL Server)
- RabbitMQ for messaging
- Elasticsearch and Kibana for logging
- Prometheus and Grafana for monitoring
- API Gateway with Ocelot

### Cleanup

To remove all Helm deployments:

```bash
./cleanup.sh
```

## Deployment with Raw Kubernetes Manifests

As an alternative to Helm charts, you can deploy using raw Kubernetes manifests.

### Quick Deployment

To deploy using raw Kubernetes manifests:

```bash
./deploy-raw-k8s.sh
```

This script will:

1. Create required namespaces
2. Deploy infrastructure components (databases, RabbitMQ, Elasticsearch, etc.)
3. Deploy microservices
4. Set up API Gateway and ingress

### Cleanup

To remove all resources deployed with raw manifests:

```bash
./uninstall-raw-k8s.sh
```

## Accessing the Services

After deployment, you can access the services as follows:

- API Gateway: <http://eshop.local> (requires hosts file configuration)
- Prometheus: <http://monitoring.eshop.local/prometheus>
- Grafana: <http://monitoring.eshop.local/grafana>
  - Username: admin
  - Password: admin
- Kibana: <http://eshop.local/kibana>

## Local Development Setup

For local development without Kubernetes, you can use Docker Compose:

```bash
docker-compose up -d
```

## Environment Configuration

The application uses the following environment variables that can be configured:

- Database passwords in ConfigMaps (default: admin1234)
- Connection strings in ConfigMaps
- RabbitMQ credentials (default: guest/guest)

## Known Issues

- If pods don't start, check the logs using `kubectl logs <pod-name>`
- For ingress issues, ensure your ingress controller is properly configured
- For database connection issues, verify the connection strings in the ConfigMaps

## Additional Resources

- [Official Documentation](https://github.com/sloweyyy/cloud-native-ecommerce-platform)
- [Architecture Diagram](./images/system-architecture.png)
- [Dependency Structure](./images/dependencies-structure.png)
