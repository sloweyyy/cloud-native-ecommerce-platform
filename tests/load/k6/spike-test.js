import http from 'k6/http';
import { check } from 'k6';
import { TEST_TYPES, getEndpoint, createTags, getTestableServices } from './config.js';

/**
 * Spike Test - Sudden traffic surge
 *
 * This test simulates a sudden spike in traffic (e.g., flash sale, viral event)
 * to verify:
 * - How the system handles sudden load increases
 * - Recovery time after the spike
 * - Whether the system remains stable during and after the spike
 *
 * Stages:
 * 1. Start with 2 users for 1 minute (baseline)
 * 2. Spike to 100 users in 30 seconds
 * 3. Stay at 100 users for 2 minutes
 * 4. Drop back to 2 users in 30 seconds
 * 5. Stay at 2 users for 1 minute (recovery)
 */

export let options = {
  stages: TEST_TYPES.spike.stages,
  thresholds: TEST_TYPES.spike.thresholds,
  insecureSkipTLSVerify: true,
  // HTTP configuration for high concurrency
  http: {
    timeout: '90s',
  },
  batch: 10,
  batchPerHost: 10,
};

export default function () {
  // During spike, hit all services
  const services = getTestableServices();
  const serviceName = services[Math.floor(Math.random() * services.length)];

  let url;
  // Build appropriate URL based on service
  if (serviceName === 'catalog') {
    url = getEndpoint('catalog', 'getAllProducts');
  } else if (serviceName === 'basket') {
    url = getEndpoint('basket', 'getBasket', 'spiketest');
  } else if (serviceName === 'ordering') {
    url = getEndpoint('ordering', 'getOrders', 'testuser');
  }

  // Tag each request with the ACTUAL service name being tested
  const response = http.get(url, {
    tags: createTags(serviceName, 'spike'),
  });

  check(response, {
    'status is 2xx or 404': (r) => (r.status >= 200 && r.status < 300) || r.status === 404,
    'response time < 5s': (r) => r.timings.duration < 5000,
    'no server error': (r) => r.status !== 500 && r.status !== 502 && r.status !== 503,
  });
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('Spike Test Results');
  console.log('========================================\n');

  const metrics = data.metrics;

  if (metrics.http_reqs) {
    console.log(`Total Requests: ${metrics.http_reqs.values.count}`);
    console.log(`Peak Rate: ${metrics.http_reqs.values.rate.toFixed(2)} req/s`);
  }

  if (metrics.http_req_duration) {
    console.log(`\nResponse Times:`);
    const duration = metrics.http_req_duration.values;
    if (duration.avg) console.log(`  Average: ${duration.avg.toFixed(2)}ms`);
    if (duration.med) console.log(`  P50: ${duration.med.toFixed(2)}ms`);
    if (duration['p(95)']) console.log(`  P95: ${duration['p(95)'].toFixed(2)}ms`);
    if (duration['p(99)']) console.log(`  P99: ${duration['p(99)'].toFixed(2)}ms`);
    if (duration.max) console.log(`  Max: ${duration.max.toFixed(2)}ms`);
  }

  if (metrics.http_req_failed) {
    const total = metrics.http_reqs.values.count;
    const failed = metrics.http_req_failed.values.passes;
    console.log(`\nErrors:`);
    console.log(`  Total Failed: ${failed} (${(failed/total*100).toFixed(2)}%)`);
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

  console.log(`\n${thresholdsPassed ? '✓ Spike test PASSED' : '✗ Spike test FAILED'}`);
  console.log('========================================\n');

  return {
    'stdout': '', // We already logged everything
  };
}
