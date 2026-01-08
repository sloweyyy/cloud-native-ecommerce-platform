import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,  // 10 virtual users
  duration: '30s',  // Test duration
};

export default function () {
  let response = http.get('http://localhost:8082/api/v1/Basket/GetBasket/testuser');
  check(response, {
    'status is 200 or 204': (r) => r.status === 200 || r.status === 204, // 204 = empty basket (no content)
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}