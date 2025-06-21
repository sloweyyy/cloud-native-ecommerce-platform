# Troubleshooting Guide

This page provides solutions for common issues you might encounter when working with the Cloud-Native E-commerce Platform.

## Deployment Issues

### Minikube Won't Start

**Symptoms**:

- `minikube start` command fails
- Error about insufficient resources

**Solutions**:

```bash
# Reset minikube
minikube delete
minikube start --driver=docker --memory=7168 --cpus=4

# If using VirtualBox driver
minikube start --driver=virtualbox --memory=7168 --cpus=4

# Check system resources
minikube start --alsologtostderr -v=7
```

### Pods Stuck in Pending State

**Symptoms**:

- Pods remain in `Pending` state
- `kubectl get pods` shows pods not starting

**Solutions**:

```bash
# Check pod status
kubectl describe pod <pod-name> -n default

# Check node resources
kubectl describe nodes

# If resource issue, reduce resource requests in Helm values
# Edit Deployments/helm/<service>/values.yaml

# If PVC issue, check storage class
kubectl get storageclasses
```

### Pods in CrashLoopBackOff

**Symptoms**:

- Pods repeatedly restart
- `kubectl get pods` shows `CrashLoopBackOff` status

**Solutions**:

```bash
# Check logs
kubectl logs <pod-name> -n default

# Check previous container logs if restarted
kubectl logs <pod-name> -n default --previous

# Check configuration
kubectl describe configmap <configmap-name> -n default

# Check secrets
kubectl describe secret <secret-name> -n default
```

### Image Pull Errors

**Symptoms**:

- Pods stuck in `ImagePullBackOff` state
- Error messages about image not found

**Solutions**:

```bash
# Ensure Docker environment is set
eval $(minikube docker-env)

# Rebuild and retag images
docker build -t <image-name>:latest -f <dockerfile-path> .

# Check image exists
docker images | grep <image-name>

# If using private registry, check credentials
kubectl describe secret <registry-secret> -n default
```

### Port Forward Issues

**Symptoms**:

- Cannot access services at localhost ports
- Port forward commands fail or hang

**Solutions**:

```bash
# Kill existing port forwards
pkill -f "kubectl port-forward"

# Check if port is already in use
lsof -i :<port>

# Restart specific port forward
kubectl port-forward svc/<service-name> <local-port>:<service-port> -n <namespace>

# Use different local port
kubectl port-forward svc/<service-name> <different-port>:<service-port> -n <namespace>
```

## Service-Specific Issues

### Catalog Service Issues

**Symptoms**:

- Cannot retrieve products
- MongoDB connection errors

**Solutions**:

```bash
# Check MongoDB connection
kubectl exec -it <catalog-pod-name> -n default -- mongosh mongodb://<mongodb-service>:27017/CatalogDb

# Check logs
kubectl logs <catalog-pod-name> -n default

# Verify MongoDB is running
kubectl get pods -n default | grep mongo

# Restart service
kubectl rollout restart deployment catalog-api -n default
```

### Basket Service Issues

**Symptoms**:

- Cannot add items to basket
- Redis connection errors

**Solutions**:

```bash
# Check Redis connection
kubectl exec -it <redis-pod-name> -n default -- redis-cli ping

# Check logs
kubectl logs <basket-pod-name> -n default

# Clear Redis data if corrupted
kubectl exec -it <redis-pod-name> -n default -- redis-cli flushall

# Restart service
kubectl rollout restart deployment basket-api -n default
```

### Discount Service Issues

**Symptoms**:

- Discounts not applying
- PostgreSQL connection errors

**Solutions**:

```bash
# Check PostgreSQL connection
kubectl exec -it <postgres-pod-name> -n default -- psql -U <username> -d discountdb

# Check logs
kubectl logs <discount-pod-name> -n default

# Verify database schema
kubectl exec -it <postgres-pod-name> -n default -- psql -U <username> -d discountdb -c "\dt"

# Restart service
kubectl rollout restart deployment discount-api -n default
```

### Ordering Service Issues

**Symptoms**:

- Orders not processing
- SQL Server connection errors
- RabbitMQ connection issues

**Solutions**:

```bash
# Check SQL Server connection
kubectl exec -it <sqlserver-pod-name> -n default -- /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P <password> -d OrderDb -Q "SELECT name FROM sys.tables"

# Check RabbitMQ connection
kubectl port-forward svc/rabbitmq 15672:15672 -n default
# Then visit http://localhost:15672 in browser (guest/guest)

# Check logs
kubectl logs <ordering-pod-name> -n default

# Restart service
kubectl rollout restart deployment ordering-api -n default
```

### API Gateway Issues

**Symptoms**:

- 404 errors on API calls
- Routing not working correctly

**Solutions**:

```bash
# Check Ocelot configuration
kubectl describe configmap ocelot-config -n default

# Check logs
kubectl logs <ocelot-pod-name> -n default

# Verify services are running
kubectl get svc -n default

# Restart gateway
kubectl rollout restart deployment ocelot-apigw -n default
```

## Frontend Issues

### Angular App Not Loading

**Symptoms**:

- Blank page
- Console errors in browser

**Solutions**:

```bash
# Check API Gateway is accessible
curl http://localhost:8010/api/v1/catalog/products

# Check for JavaScript errors
# Open browser developer tools (F12) and check Console tab

# Verify environment configuration
# Check client/src/environments/environment.ts

# Restart Angular development server
cd client
npm start
```

### Authentication Issues

**Symptoms**:

- Cannot log in
- 401 Unauthorized errors

**Solutions**:

```bash
# Check identity server is running
kubectl get pods -n default | grep identity

# Check identity server logs
kubectl logs <identity-pod-name> -n default

# Verify CORS settings
# Check API Gateway CORS configuration

# Clear browser cookies and cache
```

## Database Issues

### MongoDB Issues

**Symptoms**:

- Catalog service failing
- MongoDB connection errors

**Solutions**:

```bash
# Check MongoDB is running
kubectl get pods -n default | grep mongo

# Check MongoDB logs
kubectl logs <mongodb-pod-name> -n default

# Connect to MongoDB shell
kubectl exec -it <mongodb-pod-name> -n default -- mongosh

# Check database and collections
kubectl exec -it <mongodb-pod-name> -n default -- mongosh --eval "use CatalogDb; db.getCollectionNames();"
```

### Redis Issues

**Symptoms**:

- Basket service failing
- Redis connection errors

**Solutions**:

```bash
# Check Redis is running
kubectl get pods -n default | grep redis

# Check Redis logs
kubectl logs <redis-pod-name> -n default

# Connect to Redis CLI
kubectl exec -it <redis-pod-name> -n default -- redis-cli

# Check Redis memory usage
kubectl exec -it <redis-pod-name> -n default -- redis-cli info memory
```

### PostgreSQL Issues

**Symptoms**:

- Discount service failing
- PostgreSQL connection errors

**Solutions**:

```bash
# Check PostgreSQL is running
kubectl get pods -n default | grep postgres

# Check PostgreSQL logs
kubectl logs <postgres-pod-name> -n default

# Connect to PostgreSQL
kubectl exec -it <postgres-pod-name> -n default -- psql -U <username> -d discountdb

# Check database tables
kubectl exec -it <postgres-pod-name> -n default -- psql -U <username> -d discountdb -c "\dt"
```

### SQL Server Issues

**Symptoms**:

- Ordering service failing
- SQL Server connection errors

**Solutions**:

```bash
# Check SQL Server is running
kubectl get pods -n default | grep sqlserver

# Check SQL Server logs
kubectl logs <sqlserver-pod-name> -n default

# Connect to SQL Server
kubectl exec -it <sqlserver-pod-name> -n default -- /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P <password>

# Check database tables
kubectl exec -it <sqlserver-pod-name> -n default -- /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P <password> -d OrderDb -Q "SELECT name FROM sys.tables"
```

## Monitoring Issues

### Prometheus Not Collecting Metrics

**Symptoms**:

- No metrics in Prometheus UI
- "No data points" errors

**Solutions**:

```bash
# Check Prometheus is running
kubectl get pods -n monitoring | grep prometheus

# Check Prometheus logs
kubectl logs <prometheus-pod-name> -n monitoring

# Check Prometheus targets
# Open http://localhost:9090/targets in browser

# Check service annotations for scraping
kubectl describe service <service-name> -n default
```

### Elasticsearch Not Receiving Logs

**Symptoms**:

- No logs in Kibana
- Logging errors in service logs

**Solutions**:

```bash
# Check Elasticsearch is running
kubectl get pods -n default | grep elasticsearch

# Check Elasticsearch logs
kubectl logs <elasticsearch-pod-name> -n default

# Check Elasticsearch health
kubectl port-forward svc/elasticsearch 9200:9200 -n default
curl http://localhost:9200/_cluster/health

# Check service logging configuration
# Verify SERILOG_ELASTICSEARCH_HOST environment variable
```

## Network Issues

### Service-to-Service Communication Failures

**Symptoms**:

- Services cannot communicate
- Connection timeout errors

**Solutions**:

```bash
# Check network policies
kubectl get networkpolicies -n default

# Check DNS resolution
kubectl exec -it <pod-name> -n default -- nslookup <service-name>

# Check service endpoints
kubectl get endpoints -n default

# Test connectivity
kubectl exec -it <pod-name> -n default -- curl <service-name>:<port>
```

### Ingress Issues

**Symptoms**:

- Cannot access services from outside cluster
- Ingress routing not working

**Solutions**:

```bash
# Check ingress controller is running
kubectl get pods -n ingress-nginx

# Check ingress resources
kubectl get ingress -n default

# Check ingress logs
kubectl logs <ingress-controller-pod-name> -n ingress-nginx

# Check ingress configuration
kubectl describe ingress <ingress-name> -n default
```

## Verification Commands

```bash
# Check all pods status
kubectl get pods --all-namespaces

# Check services
kubectl get svc --all-namespaces

# Check Helm releases
helm list --all-namespaces

# Check persistent volumes
kubectl get pv,pvc --all-namespaces

# Check logs for a specific pod
kubectl logs <pod-name> -n <namespace>

# Check events
kubectl get events --sort-by='.metadata.creationTimestamp' -n default
```
