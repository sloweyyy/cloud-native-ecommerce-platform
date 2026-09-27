import http from 'k6/http';
import { check } from 'k6';
import { SERVICES, getEndpoint, createTags } from './config.js';

export let options = {
  vus: 10,  // 10 virtual users
  duration: '30s',  // Test duration
  insecureSkipTLSVerify: true,
  tags: createTags(SERVICES.basket.name),
};

export default function () {
  const url = getEndpoint('basket', 'getBasket', 'testuser');
  const response = http.get(url, {
    tags: createTags(SERVICES.basket.name),
  });

  check(response, {
    'status is 200 or 204': (r) => r.status === 200 || r.status === 204, // 204 = empty basket (no content)
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}