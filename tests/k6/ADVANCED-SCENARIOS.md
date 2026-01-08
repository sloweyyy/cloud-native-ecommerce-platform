# Advanced K6 Load Testing Scenarios

This document describes the advanced load testing scenarios available for the e-commerce platform.

## Overview

Beyond basic load testing, we provide specialized test scenarios to evaluate different aspects of system performance and stability:

| Scenario | Purpose | Duration | Load Pattern |
|----------|---------|----------|--------------|
| **Stress Test** | Find breaking point | 12 min | Gradual increase (10 → 100 VUs) |
| **Spike Test** | Handle sudden surges | 5 min | Sudden spike (2 → 100 → 2 VUs) |
| **Workflow Test** | E2E user journeys | 3 min | Realistic shopping flows |
| **Soak Test** | Long-term stability | 10+ min | Steady load (20 VUs) |

## Test Scenarios

### 1. Stress Test (`stress-test.js`)

**Purpose:** Determine the maximum load the system can handle before performance degrades or errors occur.

**Load Pattern:**
```
VUs
100 |           ████████████
    |       ████            ████
 50 |   ████
    |███                        ████
 10 |                                ████
  0 |____________________________________|███
    0   2   4   6   8  10  12  14  16  18  20 (minutes)
```

**Stages:**
1. Ramp up to 10 VUs (1 min)
2. Hold at 10 VUs (2 min)
3. Ramp to 50 VUs (2 min)
4. Hold at 50 VUs (2 min)
5. Ramp to 100 VUs (2 min)
6. Hold at 100 VUs (2 min)
7. Ramp down to 0 (1 min)

**Thresholds:**
- P95 response time < 1000ms
- Error rate < 5%

**What to Monitor:**
- At what VU count do response times start degrading?
- When do errors start appearing?
- Does the system recover after load decreases?
- Are there memory leaks or resource exhaustion?

**Run:**
```bash
./k6 run --summary-export=/tmp/k6-stress.json tests/k6/stress-test.js
```

**Expected Results:**
| Load Level | Expected P95 | Expected Errors |
|------------|--------------|-----------------|
| 10 VUs     | < 300ms      | 0%              |
| 50 VUs     | < 600ms      | < 1%            |
| 100 VUs    | < 1000ms     | < 5%            |

---

### 2. Spike Test (`spike-test.js`)

**Purpose:** Verify system behavior during sudden traffic spikes (flash sales, viral events, DDoS).

**Load Pattern:**
```
VUs
100 |    ████████████████
    |   █                █
    |  █                  █
    | █                    █
  2 |█                      █████
  0 |__________________________|
    0  1  2  3  4  5  6  7  8 (minutes)
```

**Stages:**
1. Baseline: 2 VUs (1 min)
2. Spike: Ramp to 100 VUs (30 sec)
3. Maintain: 100 VUs (2 min)
4. Drop: Back to 2 VUs (30 sec)
5. Recovery: 2 VUs (1 min)

**Thresholds:**
- P95 response time < 2000ms
- P99 response time < 5000ms
- Error rate < 10%

**What to Monitor:**
- How quickly does the system scale up?
- Does auto-scaling trigger appropriately?
- Are there cascading failures?
- How long is the recovery period?

**Run:**
```bash
./k6 run tests/k6/spike-test.js
```

**Key Metrics to Watch:**
- Time to first error after spike
- Error recovery time
- Maximum response time during spike
- CPU/memory usage patterns

---

### 3. E-Commerce Workflow Test (`workflow-shopping.js`)

**Purpose:** Simulate realistic user shopping journeys to test end-to-end performance.

**User Journey:**
1. **Browse Catalog** → View all products
2. **View Product Details** → Click on specific product
3. **Add to Basket** → Add item to shopping cart
4. **View Basket** → Review cart contents
5. **Check Order History** → View past orders

**Load Pattern:**
```
VUs
 10 |        ███████████████
    |      ██               ██
  5 |    ██                   ██
    |  ██                       ██
  0 |██                           ██
    |__________________________|
    0    1    2    3    4    5 (minutes)
```

**Custom Metrics:**
- `workflow_duration`: Total time to complete entire journey
- `workflow_success`: Number of successful workflows
- `workflow_failed`: Number of failed workflows

**Thresholds:**
- Complete workflow in < 10 seconds (P95)
- Individual requests < 500ms (P95)
- Error rate < 1%

**Run:**
```bash
./k6 run tests/k6/workflow-shopping.js
```

**What to Monitor:**
- Which step takes the longest?
- Are there data consistency issues between services?
- Do sessions maintain state correctly?
- Are there any broken integration points?

**Expected Performance:**
| Step | Expected Duration | Critical? |
|------|-------------------|-----------|
| Browse Catalog | < 200ms | Yes |
| View Product | < 150ms | Yes |
| Add to Basket | < 300ms | Yes |
| View Basket | < 200ms | Medium |
| Order History | < 250ms | Low |
| **Total Workflow** | **< 5s** | **Yes** |

---

### 4. Soak Test (`soak-test.js`)

**Purpose:** Run sustained load for extended periods to detect memory leaks, resource exhaustion, and performance degradation.

**Load Pattern:**
```
VUs
 20 |  ████████████████████████████████
    | █                                █
    |█                                  █
  0 |____________________________________|
    0      5      10     15     20  (minutes)

    (Can be extended to hours for thorough testing)
```

**Stages:**
1. Ramp up to 20 VUs (2 min)
2. Soak: Hold at 20 VUs (8 min)
3. Ramp down to 0 (1 min)

**Thresholds:**
- P95 response time < 800ms
- P99 response time < 1200ms
- Error rate < 1%

**What to Monitor:**
- Is performance stable over time?
- Are there memory leaks?
- Do database connections leak?
- Does cache efficiency remain constant?
- Are there disk space issues?

**Run:**
```bash
# Short soak (10 minutes)
./k6 run tests/k6/soak-test.js

# Extended soak (1 hour) - edit duration in file first
./k6 run tests/k6/soak-test.js
```

**Performance Degradation Analysis:**
The test automatically tracks performance snapshots and calculates degradation:
- < 10% degradation: ✓ Excellent stability
- 10-20% degradation: ⚠️ Monitor closely
- > 20% degradation: ❌ Investigate immediately

**Typical Issues Found:**
- Memory leaks in application code
- Database connection pool exhaustion
- Cache memory growth
- Log file size growth
- Orphaned resources

---

## Running Tests with Metrics Integration

All advanced scenarios can push metrics to Prometheus via PushGateway:

### Method 1: Manual Run + Push
```bash
# 1. Run test with JSON export
./k6 run --summary-export=/tmp/k6-results.json tests/k6/stress-test.js

# 2. Push metrics using our script
# (Edit push-metrics.sh to support single file input)
```

### Method 2: Automated Script (Coming Soon)
```bash
# Run all scenarios with automatic metrics push
./tests/k6/run-all-scenarios.sh
```

---

## Interpreting Results

### Response Time Analysis

**Good:**
- P50 < 200ms
- P95 < 500ms
- P99 < 1000ms

**Acceptable:**
- P50 < 500ms
- P95 < 1000ms
- P99 < 2000ms

**Poor:**
- P95 > 1000ms
- P99 > 3000ms
- High variance (P99 >> P95)

### Error Rate Analysis

**Excellent:** < 0.1%
**Good:** < 1%
**Acceptable:** < 5%
**Poor:** > 5%

**By Error Type:**
- 4xx errors: Usually client/test issues
- 500 errors: Application crashes
- 502/503 errors: Overload or deployment issues
- 504 errors: Timeouts (database, external APIs)

### Throughput Analysis

Calculate requests per second:
```
Throughput = Total Requests / Test Duration (seconds)
```

**Target Throughput** (per service):
- Catalog: > 100 req/s
- Basket: > 80 req/s
- Ordering: > 50 req/s
- Discount: > 200 req/s

---

## Scenario Selection Guide

### When to Use Each Test

| Scenario | When to Use |
|----------|-------------|
| **Stress** | • Before major releases<br>• After infrastructure changes<br>• To establish capacity limits<br>• Planning for growth |
| **Spike** | • Before flash sales/events<br>• Testing auto-scaling<br>• DDoS preparation<br>• Chaos engineering |
| **Workflow** | • Before production deployment<br>• After major feature changes<br>• Regression testing<br>• User experience validation |
| **Soak** | • Before long weekends/holidays<br>• After memory-related fixes<br>• Stability certification<br>• Capacity planning |

### Test Frequency Recommendations

**CI/CD Pipeline:**
- Basic load test: Every deployment
- Workflow test: Every deployment
- Spike test: Weekly
- Stress test: Bi-weekly
- Soak test: Before major releases

**Manual Testing:**
- After performance optimization
- Before scaling infrastructure
- When investigating production issues
- During capacity planning

---

## Troubleshooting

### Test Failures

**High Error Rates:**
1. Check service logs: `kubectl logs -n dev deployment/eshopping-<service>`
2. Verify database connections
3. Check resource limits (CPU/memory)
4. Review network policies

**Slow Response Times:**
1. Check database query performance
2. Review cache hit rates
3. Analyze slow log entries
4. Profile application code

**Test Won't Start:**
1. Verify port-forwards are running
2. Check service accessibility: `curl http://localhost:8081/api/v1/Catalog/GetAllProducts`
3. Ensure k6 binary exists and is executable

### Common Issues

**"Connection refused":**
```bash
# Restart port-forwards
pkill -f "kubectl port-forward"
./tests/k6/setup-and-run.sh
```

**"Too many open files":**
```bash
# Increase file descriptor limit (macOS)
ulimit -n 10000
```

**"Out of memory" (k6):**
- Reduce VUs
- Shorten test duration
- Use smaller response bodies

---

## Best Practices

### Before Testing

1. ✓ Deploy latest code to test environment
2. ✓ Warm up services (run a small test first)
3. ✓ Clear caches and logs
4. ✓ Take baseline metrics
5. ✓ Document current resource usage

### During Testing

1. ✓ Monitor real-time metrics (Grafana)
2. ✓ Watch pod resource usage
3. ✓ Check for errors in logs
4. ✓ Observe auto-scaling behavior
5. ✓ Note any alerts triggered

### After Testing

1. ✓ Review test summary
2. ✓ Compare with baseline
3. ✓ Document findings
4. ✓ Create performance tickets for issues
5. ✓ Clean up test data

### Performance Tuning Checklist

If tests reveal performance issues:

**Application Level:**
- [ ] Add database indexes
- [ ] Optimize N+1 queries
- [ ] Implement caching
- [ ] Use async processing
- [ ] Enable compression

**Infrastructure Level:**
- [ ] Increase pod replicas
- [ ] Adjust resource limits
- [ ] Enable horizontal pod autoscaling
- [ ] Optimize database connection pools
- [ ] Configure CDN

**Database Level:**
- [ ] Add indexes for slow queries
- [ ] Optimize query plans
- [ ] Enable query caching
- [ ] Increase connection pool
- [ ] Consider read replicas

---

## Advanced Configuration

### Custom VU Profiles

Edit test files to create custom load patterns:

```javascript
export let options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 0 },
  ],
};
```

### Environment-Specific URLs

Use environment variables:

```bash
export CATALOG_URL="http://production-catalog.example.com"
export BASKET_URL="http://production-basket.example.com"

./k6 run tests/k6/workflow-shopping.js
```

### Custom Thresholds

```javascript
export let options = {
  thresholds: {
    'http_req_duration{service:catalog}': ['p(95)<300'],
    'http_req_duration{service:basket}': ['p(95)<500'],
    'http_req_failed{service:ordering}': ['rate<0.001'],
  },
};
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Load Testing

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup k6
        run: |
          curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz
          sudo cp k6-v0.47.0-linux-amd64/k6 /usr/local/bin/

      - name: Run Workflow Test
        run: |
          kubectl port-forward -n dev svc/eshopping-catalog 8081:80 &
          kubectl port-forward -n dev svc/eshopping-basket 8082:80 &
          kubectl port-forward -n dev svc/eshopping-ordering 8083:80 &
          sleep 5
          k6 run --summary-export=results.json tests/k6/workflow-shopping.js

      - name: Check Thresholds
        run: |
          ERROR_RATE=$(jq -r '.metrics.http_req_failed.values.rate' results.json)
          if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
            echo "Error rate too high: $ERROR_RATE"
            exit 1
          fi
```

---

## Additional Resources

- [K6 Documentation](https://k6.io/docs/)
- [Load Testing Best Practices](https://k6.io/docs/testing-guides/)
- [Prometheus Metrics](https://prometheus.io/docs/concepts/metric_types/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review test logs and k6 output
3. Verify service health in Kubernetes
4. Check application logs for errors
