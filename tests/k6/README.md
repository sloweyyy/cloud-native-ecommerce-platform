# K6 Load Testing with Prometheus & Grafana Integration

This directory contains k6 load testing scripts for all microservices in the e-commerce platform, with automated metrics pushing to Prometheus via PushGateway.

## Overview

The k6 testing setup allows you to:

- Perform load testing on all microservices (Catalog, Basket, Ordering, Discount)
- Automatically push test metrics to Prometheus via PushGateway
- Visualize performance metrics in Grafana dashboards
- Track response times, throughput, error rates, and resource usage

## Prerequisites

1. **k6 CLI installed**

   ```bash
   brew install k6
   ```

2. **jq installed** (for JSON parsing)

   ```bash
   brew install jq
   ```

3. **Kubernetes cluster running** with services deployed

4. **Monitoring stack deployed**:
   - Prometheus
   - Grafana
   - PushGateway

## Project Structure

```
tests/k6/
├── README.md              # This file
├── push-metrics.sh        # Main test runner script
├── catalog-test.js        # Catalog service load test
├── basket-test.js         # Basket service load test
├── ordering-test.js       # Ordering service load test
└── discount-test.js       # Discount service load test
```

## Quick Start

### 1. Set Up Port Forwarding

First, port-forward the services you want to test:

```bash
# Port-forward all services (run in separate terminals or use & for background)
kubectl port-forward -n dev svc/eshopping-catalog 8081:80 &
kubectl port-forward -n dev svc/eshopping-basket 8082:80 &
kubectl port-forward -n dev svc/eshopping-ordering 8083:80 &
kubectl port-forward -n dev svc/eshopping-discount-discount-grpc 8084:8080 &

# Port-forward monitoring services
kubectl port-forward -n monitoring svc/prometheus-pushgateway 9091:9091 &
kubectl port-forward -n monitoring svc/prometheus-server 9090:80 &
kubectl port-forward -n monitoring svc/grafana 3000:80 &
```

### 2. Run All Tests with Automated Metrics Push

```bash
# Make the script executable (first time only)
chmod +x tests/k6/push-metrics.sh

# Run all tests
cd /path/to/project
./tests/k6/push-metrics.sh
```

The script will:

1. Run k6 tests for all services
2. Extract metrics from test results
3. Push metrics to Prometheus via PushGateway
4. Display test summary

### 3. Run Individual Tests

If you want to run tests individually:

```bash
# Run individual test
./k6 run tests/k6/catalog-test.js

# Run with custom options
./k6 run --vus 20 --duration 60s tests/k6/catalog-test.js

# Run and export summary
./k6 run --summary-export=/tmp/k6-summary.json tests/k6/catalog-test.js
```

## Test Configuration

Each test file has default configuration that can be customized:

```javascript
export let options = {
  vus: 10,              // Virtual users (concurrent connections)
  duration: '30s',      // Test duration
};
```

### Customizing Tests

You can modify the test parameters by editing the test files:

1. **Increase load**:

   ```javascript
   export let options = {
     vus: 50,
     duration: '5m',
   };
   ```

2. **Ramp up load**:

   ```javascript
   export let options = {
     stages: [
       { duration: '30s', target: 10 },  // Ramp up to 10 users
       { duration: '1m', target: 50 },   // Ramp up to 50 users
       { duration: '30s', target: 0 },   // Ramp down to 0
     ],
   };
   ```

3. **Add custom checks**:

   ```javascript
   check(response, {
     'status is 200': (r) => r.status === 200,
     'response time < 200ms': (r) => r.timings.duration < 200,
     'has products': (r) => JSON.parse(r.body).length > 0,
   });
   ```

## Viewing Metrics

### Option 1: Prometheus

1. Access Prometheus: <http://localhost:9090>
2. Query metrics:
   - `k6_http_req_duration_avg` - Average response time
   - `k6_http_req_duration_p95` - 95th percentile response time
   - `k6_http_reqs_total` - Total requests
   - `k6_http_req_failed_total` - Failed requests
   - `rate(k6_http_reqs_total[1m])` - Request rate per minute

### Option 2: Grafana Dashboard

1. Access Grafana: <http://localhost:3000>
   - Default credentials: `admin` / `prom-operator`

2. Import the K6 dashboard:
   - Go to **Dashboards** → **Import**
   - Upload: `Deployments/monitoring/grafana-dashboard-k6.json`
   - Select Prometheus datasource
   - Click **Import**

3. View real-time metrics:
   - HTTP Request Duration (Average & P95)
   - Total & Failed Requests
   - Virtual Users
   - Request Rate
   - Error Rate
   - Data Transferred

### Option 3: PushGateway

Check raw metrics in PushGateway:

```bash
curl http://localhost:9091/metrics | grep k6_
```

## Metrics Explained

| Metric | Description | Unit |
|--------|-------------|------|
| `k6_http_req_duration_avg` | Average HTTP request duration | milliseconds |
| `k6_http_req_duration_p95` | 95th percentile request duration | milliseconds |
| `k6_http_req_duration_max` | Maximum request duration | milliseconds |
| `k6_http_reqs_total` | Total number of HTTP requests | count |
| `k6_http_req_failed_total` | Number of failed requests | count |
| `k6_vus` | Number of virtual users | count |
| `k6_iterations_total` | Total test iterations | count |
| `k6_data_received_bytes` | Total data received | bytes |
| `k6_data_sent_bytes` | Total data sent | bytes |

## Advanced Usage

### Environment Variables

Configure the test runner using environment variables:

```bash
# Set custom PushGateway URL
export PUSHGATEWAY_URL="http://localhost:9091"

# Set custom job name
export JOB_NAME="my-load-test"

# Set namespace
export NAMESPACE="dev"

# Run tests
./tests/k6/push-metrics.sh
```

### Testing Different Environments

To test against different environments, update the URLs in test files:

```javascript
// Local
let response = http.get('http://localhost:8081/api/v1/Catalog/GetAllProducts');

// AWS via API Gateway
let response = http.get('https://your-gateway.amazonaws.com/Catalog/GetAllProducts');

// Kubernetes service directly
let response = http.get('http://eshopping-catalog.dev.svc.cluster.local/api/v1/Catalog/GetAllProducts');
```

### CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Run K6 Load Tests
  run: |
    # Port-forward services (in background)
    kubectl port-forward -n dev svc/eshopping-catalog 8081:80 &
    kubectl port-forward -n monitoring svc/prometheus-pushgateway 9091:9091 &

    # Wait for port-forwards
    sleep 5

    # Run tests
    ./tests/k6/push-metrics.sh

    # Check exit code
    if [ $? -ne 0 ]; then
      echo "Load tests failed!"
      exit 1
    fi
```

## Troubleshooting

### Port-forward Issues

If you get "port already in use" errors:

```bash
# Find and kill existing port-forwards
lsof -ti:8081 | xargs kill -9
lsof -ti:9091 | xargs kill -9

# Or kill all kubectl port-forward processes
pkill -f "kubectl port-forward"
```

### PushGateway Connection Issues

Check if PushGateway is accessible:

```bash
curl http://localhost:9091
# Should return: "Prometheus Pushgateway"
```

If not accessible:

```bash
# Check PushGateway pod status
kubectl get pods -n monitoring | grep pushgateway

# Check port-forward
kubectl port-forward -n monitoring svc/prometheus-pushgateway 9091:9091
```

### Service Not Responding

Check service status:

```bash
# Check pods
kubectl get pods -n dev

# Check services
kubectl get svc -n dev

# Check logs
kubectl logs -n dev deployment/eshopping-catalog
```

### Test Failures

If tests fail with connection errors:

1. Verify port-forwards are running: `lsof -i :8081`
2. Test service directly: `curl http://localhost:8081/api/v1/Catalog/GetAllProducts`
3. Check k6 output for specific error messages
4. Verify API endpoints are correct in test files

### Metrics Not Showing in Prometheus

1. Check PushGateway has metrics:

   ```bash
   curl http://localhost:9091/metrics | grep k6_
   ```

2. Check Prometheus is scraping PushGateway:
   - Go to <http://localhost:9090/targets>
   - Look for pushgateway target

3. Update Prometheus configuration if needed:

   ```yaml
   # Add to prometheus-values.yaml
   scrape_configs:
     - job_name: 'pushgateway'
       honor_labels: true
       static_configs:
         - targets: ['prometheus-pushgateway:9091']
   ```

## Performance Benchmarks

Expected performance (baseline):

| Service | Avg Response Time | P95 Response Time | Throughput (req/s) |
|---------|-------------------|-------------------|-------------------|
| Catalog | < 100ms | < 200ms | > 100 |
| Basket | < 150ms | < 300ms | > 80 |
| Ordering | < 200ms | < 400ms | > 50 |
| Discount | < 50ms | < 100ms | > 200 |

If your metrics are significantly worse, investigate:

- Database connection pooling
- Redis caching efficiency
- Network latency
- Resource constraints (CPU/Memory)

## Best Practices

1. **Start with low load**: Begin with 10 VUs for 30s, then gradually increase
2. **Monitor resources**: Watch CPU, memory, and network usage during tests
3. **Run baseline tests**: Establish baseline metrics before making changes
4. **Test in isolation**: Test one service at a time to identify bottlenecks
5. **Use realistic scenarios**: Test with representative data and access patterns
6. **Schedule regular tests**: Run automated load tests before deployments
7. **Set SLOs**: Define Service Level Objectives (e.g., P95 < 500ms)
8. **Alert on degradation**: Configure alerts in Grafana for performance regressions

## Additional Resources

- [K6 Documentation](https://k6.io/docs/)
- [K6 Examples](https://k6.io/docs/examples/)
- [Prometheus PushGateway](https://prometheus.io/docs/practices/pushing/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review k6 logs and error messages
3. Check Prometheus/Grafana for metric visibility
4. Verify all services are running and accessible
