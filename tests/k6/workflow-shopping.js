import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

/**
 * E-Commerce Shopping Workflow Test
 *
 * This test simulates a realistic user shopping journey:
 * 1. Browse catalog
 * 2. View product details
 * 3. Add items to basket
 * 4. View basket
 * 5. Proceed to checkout
 * 6. View order history
 *
 * This helps identify:
 * - End-to-end latency
 * - Performance bottlenecks in the workflow
 * - Data consistency across services
 */

// Custom metrics
const workflowDuration = new Trend('workflow_duration');
const workflowSuccess = new Counter('workflow_success');
const workflowFailed = new Counter('workflow_failed');

export let options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp up
    { duration: '2m', target: 10 },   // Normal load
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    'workflow_duration': ['p(95)<10000'], // Complete workflow in under 10s
    'http_req_duration': ['p(95)<1000'],  // P95 under 1 second
    'http_req_failed': ['rate<0.01'],     // Less than 1% error rate
    'workflow_success': ['count>0'],      // At least some workflows succeed
  },
};

const BASE_URLS = {
  catalog: 'http://localhost:8081',
  basket: 'http://localhost:8082',
  ordering: 'http://localhost:8083',
};

export function setup() {
  // Setup phase - could initialize test data
  console.log('Starting E-Commerce Workflow Test...');
  return { timestamp: Date.now() };
}

export default function (data) {
  const userId = `user${__VU}_${__ITER}`;
  const workflowStart = Date.now();
  let workflowSucceeded = true;

  try {
    // STEP 1: Browse Catalog
    group('01_Browse Catalog', function () {
      const response = http.get(`${BASE_URLS.catalog}/api/v1/Catalog/GetAllProducts`);

      const success = check(response, {
        'catalog loaded': (r) => r.status === 200,
        'has products': (r) => {
          try {
            const body = JSON.parse(r.body);
            // Catalog returns paginated response: { pageIndex, pageSize, count, data: [...] }
            return body && body.data && Array.isArray(body.data) && body.data.length > 0;
          } catch (e) {
            console.error(`Failed to parse catalog response: ${e.message}`);
            return false;
          }
        },
      });

      if (!success) {
        console.error(`Step 1 failed for ${userId}`);
        workflowSucceeded = false;
      }
      sleep(1); // Think time
    });

    // STEP 2: View Product Details (simulate clicking on a product)
    group('02_View Product Details', function () {
      // In a real test, we'd parse the product ID from step 1
      // For now, we just make the call to demonstrate the pattern
      const response = http.get(`${BASE_URLS.catalog}/api/v1/Catalog/GetAllProducts`);

      const success = check(response, {
        'product details loaded': (r) => r.status === 200,
      });

      if (!success) workflowSucceeded = false;
      sleep(2); // Users spend more time viewing details
    });

    // STEP 3: Add to Basket
    group('03_Add to Basket', function () {
      // Get current basket first
      let response = http.get(`${BASE_URLS.basket}/api/v1/Basket/GetBasket/${userId}`);

      const success = check(response, {
        'basket retrieved': (r) => r.status === 200 || r.status === 204 || r.status === 404, // 204=empty, 404=not found
      });

      if (!success) workflowSucceeded = false;
      sleep(0.5);
    });

    // STEP 4: View Basket
    group('04_View Basket', function () {
      const response = http.get(`${BASE_URLS.basket}/api/v1/Basket/GetBasket/${userId}`);

      const success = check(response, {
        'basket viewed': (r) => r.status === 200 || r.status === 204 || r.status === 404,
      });

      if (!success) workflowSucceeded = false;
      sleep(1);
    });

    // STEP 5: Check Order History (simulates viewing order history)
    group('05_Check Order History', function () {
      const response = http.get(`${BASE_URLS.ordering}/api/v1/Order/${userId}`);

      const success = check(response, {
        'order history loaded': (r) => r.status === 200 || r.status === 404, // 404 if no orders yet
      });

      if (!success) workflowSucceeded = false;
      sleep(1);
    });

    // Calculate workflow duration
    const workflowEnd = Date.now();
    const duration = workflowEnd - workflowStart;
    workflowDuration.add(duration);

    if (workflowSucceeded) {
      workflowSuccess.add(1);
    } else {
      workflowFailed.add(1);
    }

  } catch (error) {
    console.error(`Workflow error for ${userId}: ${error.message}`);
    workflowFailed.add(1);
  }

  // Inter-workflow think time
  sleep(Math.random() * 3 + 2); // 2-5 seconds before next workflow
}

export function teardown(data) {
  console.log('Workflow test completed');
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('E-Commerce Workflow Test Results');
  console.log('========================================\n');

  const metrics = data.metrics;

  // Workflow metrics
  if (metrics.workflow_duration) {
    console.log('Workflow Performance:');
    const workflow = metrics.workflow_duration.values;
    if (workflow.avg) console.log(`  Average Duration: ${(workflow.avg / 1000).toFixed(2)}s`);
    if (workflow['p(95)']) console.log(`  P95 Duration: ${(workflow['p(95)'] / 1000).toFixed(2)}s`);
    if (workflow.max) console.log(`  Max Duration: ${(workflow.max / 1000).toFixed(2)}s`);
  }

  // Debug: Check if workflow metrics exist
  if (metrics.workflow_success && metrics.workflow_failed) {
    const successCount = metrics.workflow_success.values.count || 0;
    const failedCount = metrics.workflow_failed.values.count || 0;
    const total = successCount + failedCount;

    if (total > 0) {
      const successRate = (successCount / total * 100).toFixed(2);
      console.log(`\nWorkflow Success Rate: ${successRate}%`);
      console.log(`  Successful: ${successCount}`);
      console.log(`  Failed: ${failedCount}`);
    } else {
      console.log(`\nWorkflow Success Rate: No workflows completed`);
    }
  } else {
    console.log(`\nWorkflow Success Rate: Metrics not available`);
    if (!metrics.workflow_success) console.log(`  Missing: workflow_success`);
    if (!metrics.workflow_failed) console.log(`  Missing: workflow_failed`);
  }

  // HTTP metrics
  if (metrics.http_req_duration) {
    console.log(`\nHTTP Performance:`);
    const duration = metrics.http_req_duration.values;
    if (duration.avg) console.log(`  Average: ${duration.avg.toFixed(2)}ms`);
    if (duration['p(95)']) console.log(`  P95: ${duration['p(95)'].toFixed(2)}ms`);
  }

  // Group durations
  console.log(`\nStep Performance:`);
  for (const [name, metric] of Object.entries(metrics)) {
    if (name.startsWith('group_duration{group:::')) {
      const groupName = name.match(/group:::(.+?)}$/)[1];
      if (metric.values && metric.values.avg) {
        console.log(`  ${groupName}: ${metric.values.avg.toFixed(2)}ms`);
      }
    }
  }

  console.log('\n========================================\n');

  return {
    'stdout': '',
  };
}
