import http from 'k6/http';
import { check } from 'k6';
import { SERVICES, getEndpoint, createTags } from './config.js';

export let options = {
  vus: 10,  // 10 virtual users
  duration: '30s',  // Test duration
  insecureSkipTLSVerify: true,
  tags: createTags(SERVICES.catalog.name),
};

export default function () {
  const url = getEndpoint('catalog', 'getAllProducts');
  const response = http.get(url, {
    tags: createTags(SERVICES.catalog.name),
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}