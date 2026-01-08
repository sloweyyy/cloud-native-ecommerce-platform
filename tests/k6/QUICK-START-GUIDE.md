# K6 Load Testing - Quick Start Guide

**⏱️ Time to first test: 2 minutes**

---

## 🚀 Fastest Way to Start

```bash
# Terminal 1: Start port-forwards (keeps running)
./tests/k6/setup-and-run.sh

# Terminal 2: Run your first test
./k6 run tests/k6/catalog-test.js
```

That's it! You're load testing! 🎉

---

## 📊 See Your Results

### Option 1: Terminal Output (Instant)
Results appear immediately after the test completes:
```
http_req_duration..............: avg=320ms min=278ms med=286ms max=838ms
http_req_failed................: 0.00% (0 out of 48)
http_reqs......................: 48 requests
```

### Option 2: Push to Prometheus (for trending)
```bash
# Run integration test
./tests/k6/test-pushgateway-integration.sh

# View in Prometheus
open http://localhost:9090
# Query: k6_http_req_duration_avg
```

### Option 3: Grafana Dashboard (best visualization)
```bash
# Import dashboard
open http://localhost:3000  # Login: admin / prom-operator
# Go to: Dashboards → Import → Upload
# File: Deployments/monitoring/grafana-dashboard-k6.json
```

---

## 🎯 Common Test Scenarios

### 1. Basic Service Test
```bash
# Test one service
./k6 run tests/k6/catalog-test.js
./k6 run tests/k6/basket-test.js
./k6 run tests/k6/ordering-test.js
```

### 2. Find Breaking Point
```bash
# Gradually increase load to 100 VUs
./k6 run tests/k6/stress-test.js
```

### 3. Test Sudden Traffic Spike
```bash
# Simulate flash sale (2 → 100 VUs instantly)
./k6 run tests/k6/spike-test.js
```

### 4. Test User Journey
```bash
# Browse → Add to cart → Checkout
./k6 run tests/k6/workflow-shopping.js
```

### 5. Long-term Stability
```bash
# Run for 10 minutes to find memory leaks
./k6 run tests/k6/soak-test.js
```

---

## 🔧 Customize Tests

### Change Load
```bash
# More users, longer duration
./k6 run --vus=50 --duration=60s tests/k6/catalog-test.js
```

### Export Results
```bash
# Save to JSON for analysis
./k6 run --summary-export=results.json tests/k6/catalog-test.js

# View specific metrics
cat results.json | jq '.metrics.http_req_duration'
```

### Test Different Environment
```bash
# Edit test file to change URL
# Or use environment variables (future enhancement)
```

---

## 🆘 Troubleshooting

### Test fails with "connection refused"
```bash
# Restart port-forwards
pkill -f "kubectl port-forward"
./tests/k6/setup-and-run.sh
```

### Verify everything is working
```bash
./tests/k6/verify-setup.sh
```

### Metrics not in Prometheus
```bash
# Check PushGateway has metrics
curl http://localhost:9091/metrics | grep k6_

# Run integration test
./tests/k6/test-pushgateway-integration.sh
```

---

## 📚 Learn More

- **Basic Usage:** See `tests/k6/README.md`
- **Advanced Scenarios:** See `tests/k6/ADVANCED-SCENARIOS.md`
- **Full Implementation:** See `tests/k6/COMPLETE-IMPLEMENTATION-SUMMARY.md`

---

## ✅ Success!

You're now ready to:
- ✅ Run load tests
- ✅ Find performance bottlenecks
- ✅ Verify system stability
- ✅ Monitor with Prometheus/Grafana

**Happy load testing!** 🚀
