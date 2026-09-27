import http from 'k6/http';
import { check, sleep } from 'k6';
import { getEndpoint, createTags, getTestableServices } from './config.js';

/**
 * Gateway Smoke Test - Verify AWS Gateway integration works
 *
 * Simple test with 10 VUs for 30 seconds to verify:
 * - Gateway is accessible
 * - Endpoints are correctly mapped
 * - Metrics flow to Prometheus/Grafana
 */

export let options = {
  vus: 10,
  duration: '30s',
  insecureSkipTLSVerify: true,
  thresholds: {
    'http_req_duration': ['p(95)<2000'],
    'http_req_failed': ['rate<0.05'],
  },
};

export default function () {
  // Test all services
  const services = getTestableServices();
  const serviceName = services[Math.floor(Math.random() * services.length)];

  let url;
  if (serviceName === 'catalog') {
    url = getEndpoint('catalog', 'getAllProducts');
  } else if (serviceName === 'basket') {
    url = getEndpoint('basket', 'getBasket', 'smoketest');
  } else if (serviceName === 'ordering') {
    url = getEndpoint('ordering', 'getOrders', 'smokeuser');
  }

  const response = http.get(url, {
    tags: createTags(serviceName, 'smoke'),
  });

  check(response, {
    'status is 2xx or 404': (r) => (r.status >= 200 && r.status < 300) || r.status === 404,
    'response time < 2s': (r) => r.timings.duration < 2000,
    'no server error': (r) => r.status !== 500 && r.status !== 502 && r.status !== 503,
  });

  sleep(1);
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('Gateway Smoke Test Results');
  console.log('========================================\n');

  const metrics = data.metrics;

  if (metrics.http_reqs) {
    console.log(`Total Requests: ${metrics.http_reqs.values.count}`);
    console.log(`Request Rate: ${metrics.http_reqs.values.rate.toFixed(2)} req/s`);
  }

  if (metrics.http_req_duration) {
    console.log(`\nResponse Times:`);
    const duration = metrics.http_req_duration.values;
    if (duration.avg) console.log(`  Average: ${duration.avg.toFixed(2)}ms`);
    if (duration.med) console.log(`  P50: ${duration.med.toFixed(2)}ms`);
    if (duration['p(95)']) console.log(`  P95: ${duration['p(95)'].toFixed(2)}ms`);
  }

  if (metrics.http_req_failed) {
    const total = metrics.http_reqs.values.count;
    const failed = metrics.http_req_failed.values.passes;
    console.log(`\nErrors:`);
    console.log(`  Total Failed: ${failed} (${(failed/total*100).toFixed(2)}%)`);
  }

  console.log('\n========================================\n');

  return {
    'stdout': '',
  };
}
