import http from 'k6/http';
import { check, sleep } from 'k6';
import { getEndpoint, createTags, getTestableServices } from './config.js';

/**
 * Verify Failures Test - Quick test to generate some failures for dashboard verification
 * Ramps up to 400 VUs to create some load that will generate timeouts
 */

export let options = {
  stages: [
    { duration: '30s', target: 200 },
    { duration: '1m', target: 400 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000'],
    'http_req_failed': ['rate<0.50'], // Allow up to 50% failures for testing
  },
  insecureSkipTLSVerify: true,
  batch: 10,
  batchPerHost: 10,
};

export default function () {
  const services = getTestableServices();
  const serviceName = services[Math.floor(Math.random() * services.length)];

  let url;
  if (serviceName === 'catalog') {
    url = getEndpoint('catalog', 'getAllProducts');
  } else if (serviceName === 'basket') {
    url = getEndpoint('basket', 'getBasket', 'failtest');
  } else if (serviceName === 'ordering') {
    url = getEndpoint('ordering', 'getOrders', 'failtest');
  }

  const response = http.get(url, {
    tags: createTags(serviceName, 'verify'),
  });

  check(response, {
    'status is 2xx or 404': (r) => (r.status >= 200 && r.status < 300) || r.status === 404,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });

  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('Verify Failures Test Results');
  console.log('========================================\n');

  const metrics = data.metrics;

  if (metrics.http_reqs) {
    console.log(`Total Requests: ${metrics.http_reqs.values.count}`);
    console.log(`Request Rate: ${metrics.http_reqs.values.rate.toFixed(2)} req/s`);
  }

  if (metrics.http_req_duration) {
    const duration = metrics.http_req_duration.values;
    if (duration.avg) console.log(`Avg Duration: ${duration.avg.toFixed(2)}ms`);
    if (duration['p(95)']) console.log(`P95 Duration: ${duration['p(95)'].toFixed(2)}ms`);
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
