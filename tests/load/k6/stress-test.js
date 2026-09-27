import http from 'k6/http';
import { check, sleep } from 'k6';
import { TEST_TYPES, getEndpoint, createTags, getTestableServices } from './config.js';

/**
 * Stress Test - Gradually increase load to find breaking point
 *
 * This test gradually increases the load to determine:
 * - Maximum throughput the system can handle
 * - At what point response times degrade
 * - When errors start appearing
 *
 * Stages (5 minutes total, 5000 max VUs):
 * 1. Ramp up to 1000 users over 1 minute
 * 2. Ramp up to 3000 users over 1 minute
 * 3. Ramp up to 5000 users over 1 minute
 * 4. Stay at 5000 users for 1 minute
 * 5. Ramp down to 0 over 1 minute
 */

export let options = {
  stages: TEST_TYPES.stress.stages,
  thresholds: TEST_TYPES.stress.thresholds,
  insecureSkipTLSVerify: true,
  // Batch requests to reduce overhead
  batch: 10,
  batchPerHost: 10,
};

export default function () {
  // Test multiple services to stress different parts of the system
  const services = getTestableServices();
  const serviceName = services[Math.floor(Math.random() * services.length)];

  let url;
  // Build appropriate URL based on service
  if (serviceName === 'catalog') {
    url = getEndpoint('catalog', 'getAllProducts');
  } else if (serviceName === 'basket') {
    url = getEndpoint('basket', 'getBasket', 'stresstest');
  } else if (serviceName === 'ordering') {
    url = getEndpoint('ordering', 'getOrders', 'testuser');
  }

  // Tag each request with the ACTUAL service name being tested
  const response = http.get(url, {
    tags: createTags(serviceName, 'stress'),
  });

  check(response, {
    'status is 200 or 204 or 404': (r) => r.status === 200 || r.status === 204 || r.status === 404,
    'response time < 1s': (r) => r.timings.duration < 1000,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  // Think time - simulate real user behavior
  sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let summary = '\n' + indent + 'Stress Test Summary\n';
  summary += indent + '===================\n\n';

  const metrics = data.metrics;

  // HTTP metrics
  if (metrics.http_reqs) {
    summary += indent + `Total Requests: ${metrics.http_reqs.values.count}\n`;
    summary += indent + `Request Rate: ${metrics.http_reqs.values.rate.toFixed(2)} req/s\n`;
  }

  if (metrics.http_req_duration) {
    const duration = metrics.http_req_duration.values;
    if (duration.avg) summary += indent + `Avg Duration: ${duration.avg.toFixed(2)}ms\n`;
    if (duration['p(95)']) summary += indent + `P95 Duration: ${duration['p(95)'].toFixed(2)}ms\n`;
    if (duration.max) summary += indent + `Max Duration: ${duration.max.toFixed(2)}ms\n`;
  }

  if (metrics.http_req_failed) {
    const failureRate = (metrics.http_req_failed.values.rate * 100).toFixed(2);
    summary += indent + `Failure Rate: ${failureRate}%\n`;
  }

  // VUs
  if (metrics.vus_max) {
    summary += indent + `Max VUs: ${metrics.vus_max.values.max}\n`;
  }

  return summary;
}
