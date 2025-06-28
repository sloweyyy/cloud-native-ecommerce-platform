# 🔧 Deployment Configuration Guide

This document provides detailed information about the current deployment configurations, port mappings, and service access methods for the Cloud-Native E-Commerce Platform.

## 📊 Current Service Configuration

### **API Services (All use Port 80 internally)**

| Service | External Port | Internal Port | Helm Chart | Docker Compose |
|---------|---------------|---------------|------------|----------------|
| **API Gateway** | 8010 | 80 | ✅ | ✅ |
| **Catalog API** | 8000 | 80 | ✅ | ✅ |
| **Basket API** | 8001 | 80 | ✅ | ✅ |
| **Discount API** | 8002 | 80 | ✅ | ✅ |
| **Ordering API** | 8003 | 80 | ✅ | ✅ |

### **Database Services**

| Service | External Port | Internal Port | Helm Chart | Docker Compose |
|---------|---------------|---------------|------------|----------------|
| **MongoDB (Catalog)** | 27017 | 27017 | ✅ | ✅ |
| **Redis (Basket)** | 6379 | 6379 | ✅ | ✅ |
| **PostgreSQL (Discount)** | 5432 | 5432 | ✅ | ✅ |
| **SQL Server (Orders)** | 1433 | 1433 | ✅ | ✅ |

### **Infrastructure Services**

| Service | External Port | Internal Port | Helm Chart | Docker Compose |
|---------|---------------|---------------|------------|----------------|
| **RabbitMQ Management** | 15672 | 15672 | ✅ | ✅ |
| **RabbitMQ AMQP** | 5672 | 5672 | ✅ | ✅ |

### **Monitoring Stack**

| Service | External Port | Internal Port | Namespace | Access Method |
|---------|---------------|---------------|-----------|---------------|
| **Prometheus** | 9090 | 80 | monitoring | Port Forward |
| **Grafana** | 3000 | 3000 | istio-system | Port Forward |
| **Jaeger** | 16686 | 80 | istio-system | Port Forward |
| **Kiali** | 20001 | 20001 | istio-system | Port Forward |
| **Elasticsearch** | 9200 | 9200 | default | Port Forward |
| **Kibana** | 5601 | 5601 | default | Port Forward |

### **Management Tools**

| Service | External Port | Internal Port | Helm Chart | Docker Compose |
|---------|---------------|---------------|------------|----------------|
| **Portainer UI** | 9000 | 9000 | ✅ | ✅ (Main UI) |
| **Portainer Edge** | 9080 | 8000 | ✅ | ✅ (Edge Agent Tunnel) |
| **pgAdmin** | 5050 | 80 | ✅ | ✅ |

#### **📋 Portainer Port Details**

Portainer exposes two different services on different ports:

- **Port 9000 (External: 9000)**: Main Portainer web UI and API
  - Used for: Container management, dashboard access, API calls
  - Access: `http://localhost:9000`
  - Required for: All standard Portainer operations

- **Port 8000 (External: 9080)**: Edge Agent tunnel server
  - Used for: Remote Edge agent connections and tunneling
  - Access: Not directly accessed via browser
  - Required for: Edge compute environments and remote agent management
  - Optional: Can be omitted if not using Edge agents

**⚠️ Port Conflict Resolution:**

- Portainer uses port 9000 (not 9090) to avoid conflict with Prometheus
- Prometheus has priority on port 9090 for monitoring services

### **Frontend Application**

| Service | External Port | Internal Port | Development |
|---------|---------------|---------------|-------------|
| **Angular Frontend** | 4200 | 4200 | npm start |

## 🔧 Port Forward Commands

### **Kubernetes Deployment**

```bash
# Core Services
kubectl port-forward svc/ocelotapigw 8010:80 -n default

# Monitoring Services  
kubectl port-forward svc/prometheus-server 9090:80 -n monitoring
kubectl port-forward svc/grafana 3000:3000 -n istio-system
kubectl port-forward svc/tracing 16686:80 -n istio-system
kubectl port-forward svc/kiali 20001:20001 -n istio-system

# Infrastructure
kubectl port-forward svc/rabbitmq 15672:15672 -n default
kubectl port-forward svc/elasticsearch 9200:9200 -n default
kubectl port-forward svc/kibana 5601:5601 -n default

# Management Tools
kubectl port-forward svc/portainer 9000:9000 -n default  # Main UI
kubectl port-forward svc/portainer 9080:8000 -n default  # Edge Agent Tunnel (if needed)
kubectl port-forward svc/pgadmin 5050:80 -n default
```

## 🔑 Default Credentials

| Service | Username | Password | Notes |
|---------|----------|----------|-------|
| **Grafana** | admin | prom-operator | Monitoring dashboards |
| **RabbitMQ** | guest | guest | Message broker management |
| **pgAdmin** | <admin@example.com> | admin1234 | PostgreSQL administration |
| **Portainer** | - | - | Set up on first access |

## 📁 Helm Chart Structure

```
Deployments/helm/
├── catalog/           # Catalog API service
├── catalogdb/         # MongoDB for catalog
├── basket/            # Basket API service  
├── basketdb/          # Redis for basket
├── discount/          # Discount API service
├── discountdb/        # PostgreSQL for discount
├── ordering/          # Ordering API service
├── orderdb/           # SQL Server for orders
├── ocelotapigw/       # API Gateway
├── rabbitmq/          # Message broker
├── elasticsearch/     # Search engine
├── kibana/            # Log visualization
├── portainer/         # Container management
└── pgadmin/           # PostgreSQL admin
```

## 🚀 Deployment Scripts

### **Main Deployment Scripts**

| Script | Purpose | Duration | Use Case |
|--------|---------|----------|----------|
| `./deploy.sh` | Full deployment with monitoring | 15-20 min | Production-like setup |
| `./quick-deploy.sh` | Essential services only | 5 min | Development |
| `./start.sh` | Start existing deployment | 30 sec | Resume work |
| `./cleanup.sh` | Remove all resources | 2 min | Clean slate |

### **Utility Scripts**

| Script | Purpose |
|--------|---------|
| `./access-services.sh` | Interactive service access menu |
| `./monitor-grafana-health.sh` | Monitor Grafana connectivity |
| `./validate-grafana-fix.sh` | Validate Grafana-Prometheus connection |
| `./database-access.sh` | Database connection helper |

## 🔄 Recent Configuration Changes

### **✅ Completed Updates**

1. **Port Standardization**: All API services now use port 80 internally
2. **Grafana-Prometheus Connection**: Permanent fix implemented
3. **NOTES.txt Files**: Updated with accurate port information and usage instructions
4. **Container Port Fix**: Ocelot API Gateway container port corrected from 8080 to 80
5. **Portainer Port Fix**: Corrected port mapping in access scripts (9090 instead of 9000)

### **📋 Configuration Files Updated**

- `Deployments/helm/ocelotapigw/templates/NOTES.txt` - Enhanced with proper port info
- `Deployments/helm/ocelotapigw/templates/deployment.yaml` - Fixed container port
- `Deployments/helm/portainer/templates/NOTES.txt` - Created with correct ports
- `Deployments/helm/pgadmin/templates/NOTES.txt` - Created with credentials
- `access-services.sh` - Fixed Portainer port references
- `Deployments/monitoring/grafana/` - Permanent Prometheus connection fix

## 🔍 Troubleshooting

### **Common Issues**

1. **Service Not Accessible**: Check if port-forward is running
2. **Grafana No Data**: Verify Prometheus connection using validation script
3. **Container Port Mismatch**: Ensure Helm values match deployment templates
4. **Portainer Wrong Port**: Use 9090 for local access, not 9000

### **Health Check Commands**

```bash
# Check all pods
kubectl get pods --all-namespaces

# Check specific service
kubectl get svc -n <namespace>

# View service logs
kubectl logs -l app.kubernetes.io/name=<service-name> -n <namespace>

# Test API endpoints
curl http://localhost:8010/Catalog
```

## 📚 Related Documentation

- [Main README](../README.md) - Project overview
- [Complete Deployment Guide](../DEPLOYMENT-GUIDE-COMPLETE.md) - Step-by-step instructions
- [Monitoring Guide](../wiki/Monitoring.md) - Observability setup
- [Troubleshooting Guide](../wiki/Troubleshooting.md) - Common issues and solutions
