import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,  // 10 virtual users
  duration: '30s',  // Test duration
};

export default function () {
  let response = http.get('http://localhost:8081/api/v1/Catalog/GetAllProducts');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}