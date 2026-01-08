import http from 'k6/http';
import { check } from 'k6';

/**
 * Ordering Service Load Test
 * Tests the GetOrdersByUserName endpoint which retrieves orders for a specific user
 */

export let options = {
  vus: 10,  // 10 virtual users
  duration: '30s',  // Test duration
};

export default function () {
  // Test with a common test username
  const userName = 'testuser';
  const response = http.get(`http://localhost:8083/api/v1/Order/${userName}`);

  check(response, {
    'status is 200 or 404': (r) => r.status === 200 || r.status === 404, // 404 if user has no orders
    'response time < 500ms': (r) => r.timings.duration < 500,
    'no server error': (r) => r.status !== 500 && r.status !== 502 && r.status !== 503,
  });
}