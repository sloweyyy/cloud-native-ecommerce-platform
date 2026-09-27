# Scripts

Utility scripts organized by purpose. All scripts should be run from the **project root directory**.

## Directory Structure

| Directory | Purpose | Key Scripts |
|-----------|---------|-------------|
| `deploy/` | Deployment automation | `deploy.sh` (K8s), `deploy-aws.sh` (AWS EKS), `docker-deploy.sh` (Docker Compose) |
| `cleanup/` | Resource teardown | `cleanup.sh` (K8s), `cleanup-aws.sh` (AWS) |
| `access/` | Service access portals | `access-services.sh`, `access-services-aws-smart.sh` |
| `debug/` | Debugging utilities | `check-logs.sh`, `database-access.sh` |
| `monitoring/` | Observability setup | Grafana, Prometheus health checks and setup |
| `smoke/` | End-to-end smoke tests | `e2e.sh` (catalog → basket → checkout → order through the gateway) |

## Quick Reference

```bash
# Deploy locally with Kubernetes (minikube)
./scripts/deploy/deploy.sh

# Deploy to AWS EKS
./scripts/deploy/deploy-aws.sh dev us-east-1

# Deploy with Docker Compose
./scripts/deploy/docker-deploy.sh

# Smoke-test a running compose stack through the gateway
./scripts/smoke/e2e.sh

# Build Docker images
./scripts/deploy/build-images.sh

# Access services portal
./scripts/access/access-services.sh

# View logs
./scripts/debug/check-logs.sh

# Cleanup
./scripts/cleanup/cleanup.sh
./scripts/cleanup/cleanup-aws.sh dev
```
