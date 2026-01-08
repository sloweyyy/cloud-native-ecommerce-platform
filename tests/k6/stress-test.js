import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Stress Test - Gradually increase load to find breaking point
 *
 * This test gradually increases the load to determine:
 * - Maximum throughput the system can handle
 * - At what point response times degrade
 * - When errors start appearing
 *
 * Stages:
 * 1. Ramp up to 10 users over 1 minute
 * 2. Stay at 10 users for 2 minutes
 * 3. Ramp up to 50 users over 2 minutes
 * 4. Stay at 50 users for 2 minutes
 * 5. Ramp up to 100 users over 2 minutes
 * 6. Stay at 100 users for 2 minutes
 * 7. Ramp down to 0 over 1 minute
 */

export let options = {
  stages: [
    { duration: '1m', target: 10 },   // Warm up
    { duration: '2m', target: 10 },   // Stay at 10
    { duration: '2m', target: 50 },   // Ramp to 50
    { duration: '2m', target: 50 },   // Stay at 50
    { duration: '2m', target: 100 },  // Ramp to 100
    { duration: '2m', target: 100 },  // Stay at 100
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // 95% of requests should be below 1s
    'http_req_failed': ['rate<0.05'],     // Error rate should be below 5%
  },
};

export default function () {
  // Test multiple endpoints to stress different parts of the system
  const endpoints = [
    'http://localhost:8081/api/v1/Catalog/GetAllProducts',
    'http://localhost:8082/api/v1/Basket/GetBasket/stresstest',
    'http://localhost:8083/api/v1/Order/testuser',
  ];

  // Randomly pick an endpoint
  const url = endpoints[Math.floor(Math.random() * endpoints.length)];

  const response = http.get(url);

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
