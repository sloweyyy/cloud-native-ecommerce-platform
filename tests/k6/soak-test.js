import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Soak Test - Long-running stability test
 *
 * This test runs at a moderate load for an extended period to detect:
 * - Memory leaks
 * - Resource exhaustion
 * - Performance degradation over time
 * - Database connection pool issues
 * - Cache efficiency
 *
 * Duration: 10 minutes (can be extended for real soak testing)
 * Load: Steady 20 VUs
 *
 * For production soak testing, consider running for:
 * - 1 hour (quick soak)
 * - 4 hours (standard)
 * - 24+ hours (extensive)
 */

export let options = {
  stages: [
    { duration: '2m', target: 20 },   // Ramp up
    { duration: '8m', target: 20 },   // Soak period
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': [
      'p(95)<800',  // 95% of requests should stay under 800ms
      'p(99)<1200', // 99% should stay under 1.2s
    ],
    'http_req_failed': ['rate<0.01'], // Less than 1% errors
  },
};

const SERVICES = [
  { name: 'catalog', url: 'http://localhost:8081/api/v1/Catalog/GetAllProducts' },
  { name: 'basket', url: 'http://localhost:8082/api/v1/Basket/GetBasket/soaktest' },
  { name: 'ordering', url: 'http://localhost:8083/api/v1/Order/testuser' },
];

// Track performance over time
let requestCount = 0;
let errorCount = 0;
const performanceSnapshots = [];

export default function () {
  requestCount++;

  // Distribute load across services
  const service = SERVICES[requestCount % SERVICES.length];

  const startTime = Date.now();
  const response = http.get(service.url);
  const duration = Date.now() - startTime;

  const success = check(response, {
    'status is 200 or 204 or 404': (r) => r.status === 200 || r.status === 204 || r.status === 404,
    'response time acceptable': (r) => r.timings.duration < 2000,
  });

  if (!success) {
    errorCount++;
  }

  // Take performance snapshot every 100 requests
  if (requestCount % 100 === 0) {
    performanceSnapshots.push({
      request: requestCount,
      duration: duration,
      errors: errorCount,
      timestamp: Date.now(),
    });
  }

  // Realistic user think time
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('Soak Test Results');
  console.log('========================================\n');

  const metrics = data.metrics;

  console.log('Test Configuration:');
  console.log(`  Duration: ${(data.state.testRunDurationMs / 1000 / 60).toFixed(1)} minutes`);
  console.log(`  VUs: 20 (steady)`);

  if (metrics.http_reqs) {
    console.log(`\nLoad Statistics:`);
    console.log(`  Total Requests: ${metrics.http_reqs.values.count}`);
    console.log(`  Request Rate: ${metrics.http_reqs.values.rate.toFixed(2)} req/s`);
  }

  if (metrics.http_req_duration) {
    console.log(`\nResponse Time Statistics:`);
    const duration = metrics.http_req_duration.values;
    if (duration.avg) console.log(`  Average: ${duration.avg.toFixed(2)}ms`);
    if (duration.min) console.log(`  Minimum: ${duration.min.toFixed(2)}ms`);
    if (duration.med) console.log(`  P50 (Median): ${duration.med.toFixed(2)}ms`);
    if (duration['p(90)']) console.log(`  P90: ${duration['p(90)'].toFixed(2)}ms`);
    if (duration['p(95)']) console.log(`  P95: ${duration['p(95)'].toFixed(2)}ms`);
    if (duration['p(99)']) console.log(`  P99: ${duration['p(99)'].toFixed(2)}ms`);
    if (duration.max) console.log(`  Maximum: ${duration.max.toFixed(2)}ms`);
  }

  if (metrics.http_req_failed) {
    const failureRate = (metrics.http_req_failed.values.rate * 100).toFixed(4);
    console.log(`\nReliability:`);
    console.log(`  Failed Requests: ${metrics.http_req_failed.values.passes}`);
    console.log(`  Failure Rate: ${failureRate}%`);
  }

  // Analyze performance degradation
  if (performanceSnapshots.length > 2) {
    const firstSnapshot = performanceSnapshots[0];
    const lastSnapshot = performanceSnapshots[performanceSnapshots.length - 1];
    const degradation = ((lastSnapshot.duration - firstSnapshot.duration) / firstSnapshot.duration * 100).toFixed(2);

    console.log(`\nPerformance Stability:`);
    console.log(`  Initial Response Time: ${firstSnapshot.duration.toFixed(2)}ms`);
    console.log(`  Final Response Time: ${lastSnapshot.duration.toFixed(2)}ms`);
    console.log(`  Degradation: ${degradation}%`);

    if (Math.abs(degradation) > 20) {
      console.log(`  ⚠️  WARNING: Significant performance degradation detected!`);
    } else if (Math.abs(degradation) < 10) {
      console.log(`  ✓ Performance remained stable`);
    }
  }

  // Check if thresholds passed
  let thresholdsPassed = true;
  if (data.thresholds) {
    console.log(`\nThresholds:`);
    for (const [name, threshold] of Object.entries(data.thresholds)) {
      const passed = threshold.ok ? '✓' : '✗';
      console.log(`  ${passed} ${name}`);
      if (!threshold.ok) thresholdsPassed = false;
    }
  }

  // Recommendations
  console.log(`\nRecommendations:`);
  if (metrics.http_req_duration && metrics.http_req_duration.values['p(95)'] > 500) {
    console.log(`  • Consider optimizing slow endpoints (P95 > 500ms)`);
  }
  if (metrics.http_req_failed && metrics.http_req_failed.values.rate > 0.001) {
    console.log(`  • Investigate error sources (${(metrics.http_req_failed.values.rate * 100).toFixed(2)}% failure rate)`);
  }
  if (Math.abs(parseFloat(degradation)) > 15) {
    console.log(`  • Monitor for memory leaks or resource exhaustion`);
    console.log(`  • Check database connection pool settings`);
    console.log(`  • Review cache hit rates`);
  }
  if (thresholdsPassed) {
    console.log(`  ✓ System passed soak test - suitable for production load`);
  }

  console.log(`\n${thresholdsPassed ? '✓ Soak test PASSED' : '✗ Soak test FAILED'}`);
  console.log('========================================\n');

  return {
    'stdout': '',
  };
}
