import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';
import { getServiceUrl, getEndpoint, createTags } from './config.js';

/**
 * Enhanced E-Commerce Website Workflow Test
 *
 * This test simulates realistic user behavior through the website interface
 * based on real browser traffic analysis.
 */

// Custom metrics
const websiteLoadTime = new Trend('website_load_time');
const workflowDuration = new Trend('workflow_duration');
const workflowSuccess = new Counter('workflow_success');
const workflowFailed = new Counter('workflow_failed');
const cartAdditions = new Counter('cart_additions');
const searchQueries = new Counter('search_queries');

export let options = {
  scenarios: {
    website_flow: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '1m', target: 5 },    // Ramp up
        { duration: '3m', target: 15 },  // Normal load
        { duration: '2m', target: 25 },  // Higher load
        { duration: '1m', target: 15 },  // Ramp down
      ],
      gracefulStop: '30s',
      env: {
        USE_GATEWAY: __ENV.USE_GATEWAY || 'false',
        NX_API_BASE_URL: __ENV.NX_API_BASE_URL || 'http://localhost:8010'
      }
    },
  },
  thresholds: {
    'website_load_time': ['p(95)<3000'],    // Website loads in under 3s
    'workflow_duration': ['p(95)<15000'],   // Complete workflow in under 15s
    'http_req_duration': ['p(95)<2000'],     // P95 under 2 seconds
    'http_req_failed': ['rate<0.02'],        // Less than 2% error rate
    'workflow_success': ['count>0'],         // At least some workflows succeed
    'vus': ['value>0'],                      // Ensure virtual users are active
  },
  insecureSkipTLSVerify: true,
};

// Helper function to generate realistic browser headers
function getWebsiteHeaders(data) {
  return {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Origin': data.websiteOrigin,
    'Referer': data.websiteOrigin + '/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'User-Agent': data.userAgent,
    'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
  };
}

// Helper function to create request options with TLS disabled
function getRequestOptions(headers, timeout = '5s') {
  return {
    headers: headers,
    timeout: timeout,
    tls: { 
      rejectUnauthorized: false 
    }
  };
}

export function setup() {
  console.log('Starting Enhanced E-Commerce Website Workflow Test...');
  console.log('Testing realistic user behavior through the AWS API Gateway');

  // Initialize counters to ensure they always exist in metrics
  workflowSuccess.add(0);
  workflowFailed.add(0);
  cartAdditions.add(0);
  searchQueries.add(0);

  return { 
    timestamp: Date.now(),
    gatewayUrl: __ENV.AWS_GATEWAY_URL || 'http://localhost:8010',
    websiteOrigin: 'https://main.d239j34e2bshzo.amplifyapp.com',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'
  };
}

export default function (data) {
  const userId = `website_user${__VU}_${__ITER}`;
  const workflowStart = Date.now();
  let workflowSucceeded = true;
  
  try {
    // STEP 1: Landing Page Load (Website)
    group('01_Landing_Page_Load', function () {
      const startTime = Date.now();
      
      // Simulate landing page load through gateway
      const catalogUrl = `${data.gatewayUrl}/Catalog/GetAllProducts`;
      const response = http.get(catalogUrl, getRequestOptions(getWebsiteHeaders(data), '5s'), {
        tags: createTags('catalog', 'landing')
      });

      const loadTime = Date.now() - startTime;
      websiteLoadTime.add(loadTime);

      const success = check(response, {
        'landing page loaded': (r) => r.status === 200,
        'page has content': (r) => r.body && r.body.length > 100,
        'load time acceptable': (r) => loadTime < 5000,
      });

      if (!success) {
        console.error(`Landing page load failed for ${userId}`);
        workflowSucceeded = false;
      }
      
      sleep(Math.random() * 2 + 1); // 1-3 seconds browsing landing page
    });

    // STEP 2: Browse Catalog Through Website
    group('02_Browse_Catalog_Website', function () {
      const catalogUrl = `${data.gatewayUrl}/Catalog/GetAllProducts`;
      const response = http.get(catalogUrl, getRequestOptions(getWebsiteHeaders(data)), {
        tags: createTags('catalog', 'website'),
        params: {
          page: 1,
          limit: 10
        }
      });

      const success = check(response, {
        'catalog loaded via website': (r) => r.status === 200,
        'has products': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body && body.data && Array.isArray(body.data) && body.data.length > 0;
          } catch (e) {
            console.error(`Failed to parse catalog response: ${e.message}`);
            return false;
          }
        },
      });

      if (!success) {
        console.error(`Catalog browse failed for ${userId}`);
        workflowSucceeded = false;
      }
      
      sleep(Math.random() * 3 + 2); // 2-5 seconds browsing products
    });

    // STEP 3: Search and Filter Products
    group('03_Search_Filter_Products', function () {
      searchQueries.add(1);
      
      // Simulate search with different filters like the real website
      const searchParams = {
        page: Math.floor(Math.random() * 3) + 1, // Pages 1-3
        limit: 10,
        brand: Math.random() > 0.7 ? 'Asus' : undefined,
        type: Math.random() > 0.7 ? 'Laptop' : undefined,
      };
      
      const searchUrl = `${data.gatewayUrl}/Catalog/GetAllProducts`;
      const response = http.get(searchUrl, getRequestOptions(getWebsiteHeaders(data)), {
        tags: createTags('catalog', 'search'),
        params: searchParams,
      });

      const success = check(response, {
        'search results loaded': (r) => r.status === 200,
        'search returned results': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body && body.data && Array.isArray(body.data);
          } catch (e) {
            return false;
          }
        },
      });

      if (!success) {
        console.error(`Search failed for ${userId}`);
        workflowSucceeded = false;
      } else {
        console.log(`✅ Search completed for ${userId} with params:`, searchParams);
      }
      
      sleep(Math.random() * 2 + 1); // 1-3 seconds reviewing search results
    });

    // STEP 4: View Product Details
    group('04_View_Product_Details', function () {
      // Get a product ID from catalog first
      const catalogUrl = `${data.gatewayUrl}/Catalog/GetAllProducts`;
      const catalogResponse = http.get(catalogUrl, getRequestOptions(getWebsiteHeaders(data)), {
        tags: createTags('catalog', 'details'),
        params: { pageIndex: 1, pageSize: 1 },
      });

      let productId = '1'; // Default fallback
      try {
        const catalogBody = JSON.parse(catalogResponse.body);
        if (catalogBody.data && catalogBody.data.length > 0) {
          productId = catalogBody.data[0].id.toString();
        }
      } catch (e) {
        console.warn(`Could not parse catalog for product ID, using default: ${e.message}`);
      }

      const productUrl = `${data.gatewayUrl}/Catalog/GetProductById/${productId}`;
      const response = http.get(productUrl, getRequestOptions(getWebsiteHeaders(data)), {
        tags: createTags('catalog', 'product-detail'),
      });

      const success = check(response, {
        'product details loaded': (r) => r.status === 200,
        'product has details': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body && body.name && body.price;
          } catch (e) {
            return false;
          }
        },
      });

      if (!success) {
        console.error(`Product details view failed for ${userId}`);
        workflowSucceeded = false;
      }
      
      // Longer think time for product details (users read reviews, compare)
      sleep(Math.random() * 4 + 3); // 3-7 seconds
    });

    // STEP 5: Add to Cart Through Website
    group('05_Add_to_Cart_Website', function () {
      // First get a product from catalog to add to cart
      const catalogUrl = `${data.gatewayUrl}/Catalog/GetAllProducts`;
      const catalogResponse = http.get(catalogUrl, getRequestOptions(getWebsiteHeaders(data)), {
        tags: createTags('catalog', 'cart-selection'),
        params: { pageIndex: 1, pageSize: 5 },
      });

      let product = null;
      try {
        const catalogBody = JSON.parse(catalogResponse.body);
        if (catalogBody.data && catalogBody.data.length > 0) {
          product = catalogBody.data[Math.floor(Math.random() * catalogBody.data.length)];
        }
      } catch (e) {
        console.warn(`Could not get product for cart: ${e.message}`);
      }

      if (!product) {
        console.error(`No product available for cart for ${userId}`);
        workflowSucceeded = false;
        return;
      }

      // Create basket with real product data
      const cartUrl = `${data.gatewayUrl}/Basket/CreateBasket`;
      const cartPayload = {
        userName: userId,
        items: [{
          quantity: 1,
          price: product.price || 4249,
          originalPrice: product.originalPrice || product.price || 4249,
          discountAmount: product.discountAmount || 0,
          productId: product.id,
          imageFile: product.imageUrl || "https://ecommerce-product-images-589634480766.s3.us-east-1.amazonaws.com/products/asus_rog_zephyrus_g14_1.png",
          productName: product.name || "ASUS ROG Zephyrus G14 Gaming Laptop"
        }]
      };

      const response = http.post(cartUrl, JSON.stringify(cartPayload), getRequestOptions({
        'Content-Type': 'application/json',
        ...getWebsiteHeaders(data)
      }, '10s'), {
        tags: createTags('basket', 'add-to-cart')
      });

      const success = check(response, {
        'item added to cart': (r) => r.status === 200,
        'cart updated': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body && body.userName === userId;
          } catch (e) {
            return false;
          }
        },
      });

      if (success) {
        cartAdditions.add(1);
        console.log(`✅ Added ${product.name} to cart for ${userId}`);
      } else {
        console.error(`Add to cart failed for ${userId}`);
        workflowSucceeded = false;
      }
      
      sleep(Math.random() * 1 + 0.5); // 0-1.5 seconds
    });

    // STEP 6: View Shopping Cart
    group('06_View_Shopping_Cart', function () {
      const cartUrl = `${data.gatewayUrl}/Basket/GetBasket/${userId}`;
      const response = http.get(cartUrl, getRequestOptions(getWebsiteHeaders(data)), {
        tags: createTags('basket', 'view-cart'),
      });

      const success = check(response, {
        'cart viewed': (r) => r.status === 200 || r.status === 204,
        'cart accessible': (r) => {
          if (r.status === 204) return true; // Empty cart is OK
          try {
            const body = JSON.parse(r.body);
            return body && body.userName === userId;
          } catch (e) {
            return false;
          }
        },
      });

      if (!success) {
        console.error(`Cart view failed for ${userId}`);
        workflowSucceeded = false;
      }
      
      sleep(Math.random() * 2 + 1); // 1-3 seconds reviewing cart
    });

// STEP 7: Checkout Process Simulation with Retry Logic
    group('07_Checkout_Process', function () {
      // First get basket to calculate total price
      const cartUrl = `${data.gatewayUrl}/Basket/GetBasket/${userId}`;
      const cartResponse = http.get(cartUrl, {
        tags: createTags('basket', 'checkout-prep'),
        headers: getWebsiteHeaders(data),
        tls: {
          rejectUnauthorized: false
        }
      });

      let totalPrice = 0;
      try {
        const cartBody = JSON.parse(cartResponse.body);
        if (cartBody && cartBody.items) {
          totalPrice = cartBody.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
      } catch (e) {
        console.warn(`Could not get cart total: ${e.message}`);
        totalPrice = 3549; // Default fallback
      }

      // Use the real CheckoutV2 endpoint with retry logic for rate limiting
      const checkoutUrl = `${data.gatewayUrl}/Basket/CheckoutV2`;
      const checkoutPayload = {
        userName: userId,
        totalPrice: totalPrice
      };

      let response;
      let attempts = 0;
      const maxAttempts = 5;
      let success = false;

      // Retry loop for rate limiting
      while (attempts < maxAttempts && !success) {
        attempts++;
        response = http.post(checkoutUrl, JSON.stringify(checkoutPayload), {
          tags: createTags('basket', 'checkout'),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...getWebsiteHeaders(data)
          },
          timeout: '10s',
          tls: { rejectUnauthorized: false }
        });

        success = check(response, {
          'checkout initiated': (r) => r.status === 200 || r.status === 202,
          'order processed': (r) => {
            // Status 202 with empty body is acceptable for async checkout
            if (r.status === 202 && r.body === '') return true;
            try {
              const body = JSON.parse(r.body);
              return body && body.orderId;
            } catch (e) {
              return false;
            }
          },
        });

        if (!success) {
          if (response.status === 429) {
            const retryDelay = Math.min(1000 * Math.pow(2, attempts), 10000); // Exponential backoff
            console.warn(`Rate limited for ${userId}, attempt ${attempts}/${maxAttempts}, retrying in ${retryDelay}ms...`);
            sleep(retryDelay / 1000);
          } else {
            console.error(`Checkout failed for ${userId} - Status: ${response.status}, Body: ${response.body}`);
            break;
          }
        }
      }

      if (success) {
        if (response.status === 202) {
          console.log(`✅ Checkout initiated for ${userId} with total $${totalPrice} (async processing, attempt ${attempts})`);
        } else {
          console.log(`✅ Checkout completed for ${userId} with total $${totalPrice} (attempt ${attempts})`);
        }
      } else {
        console.error(`❌ Checkout permanently failed for ${userId} after ${attempts} attempts`);
        workflowSucceeded = false;
      }
      
      sleep(Math.random() * 3 + 2); // 2-5 seconds on checkout page
    });

    // STEP 8: Order Confirmation
    group('08_Order_Confirmation', function () {
      // Get order details to confirm
      const ordersUrl = `${data.gatewayUrl}/Order/${userId}`;
      const response = http.get(ordersUrl, getRequestOptions(getWebsiteHeaders(data)), {
        tags: createTags('ordering', 'confirmation'),
      });

      const success = check(response, {
        'orders loaded': (r) => r.status === 200,
        'order history available': (r) => {
          try {
            const body = JSON.parse(r.body);
            return Array.isArray(body);
          } catch (e) {
            return false;
          }
        },
      });

      if (!success) {
        console.error(`Order confirmation failed for ${userId}`);
        workflowSucceeded = false;
      }
      
      sleep(Math.random() * 2 + 1); // 1-3 seconds reviewing confirmation
    });

    // Calculate workflow duration
    const workflowEnd = Date.now();
    const duration = workflowEnd - workflowStart;
    workflowDuration.add(duration);

    if (workflowSucceeded) {
      workflowSuccess.add(1);
      console.log(`✅ Workflow completed successfully for ${userId} (${duration}ms)`);
    } else {
      workflowFailed.add(1);
      console.log(`❌ Workflow failed for ${userId}`);
    }

  } catch (error) {
    console.error(`Workflow error for ${userId}: ${error.message}`);
    workflowFailed.add(1);
  }

  // Inter-workflow think time (simulates user taking a break)
  sleep(Math.random() * 5 + 3); // 3-8 seconds before next workflow
}

export function teardown(data) {
  console.log('\n========================================');
  console.log('Enhanced E-Commerce Website Workflow Test Results');
  console.log('========================================\n');

  const metrics = data && data.metrics ? data.metrics : {};

  // Website performance metrics
  if (metrics.website_load_time) {
    console.log('🌐 Website Performance:');
    const loadTime = metrics.website_load_time.values;
    if (loadTime.avg) console.log(`  Average Load Time: ${(loadTime.avg / 1000).toFixed(2)}s`);
    if (loadTime['p(95)']) console.log(`  P95 Load Time: ${(loadTime['p(95)'] / 1000).toFixed(2)}s`);
    if (loadTime.max) console.log(`  Max Load Time: ${(loadTime.max / 1000).toFixed(2)}s`);
  }

  // Workflow metrics
  if (metrics.workflow_duration) {
    console.log('\n🛒 Workflow Performance:');
    const workflow = metrics.workflow_duration.values;
    if (workflow.avg) console.log(`  Average Duration: ${(workflow.avg / 1000).toFixed(2)}s`);
    if (workflow['p(95)']) console.log(`  P95 Duration: ${(workflow['p(95)'] / 1000).toFixed(2)}s`);
    if (workflow.max) console.log(`  Max Duration: ${(workflow.max / 1000).toFixed(2)}s`);
  }

  // Success rate
  if (metrics.workflow_success && metrics.workflow_failed) {
    const successCount = metrics.workflow_success.values.count || 0;
    const failedCount = metrics.workflow_failed.values.count || 0;
    const total = successCount + failedCount;

    if (total > 0) {
      const successRate = (successCount / total * 100).toFixed(2);
      console.log(`\n📊 Workflow Success Rate: ${successRate}%`);
      console.log(`  Successful: ${successCount}`);
      console.log(`  Failed: ${failedCount}`);
    }
  }

  // User interaction metrics
  if (metrics.cart_additions) {
    console.log(`\n🛍️ User Interactions:`);
    console.log(`  Cart Additions: ${metrics.cart_additions.values.count || 0}`);
  }

  if (metrics.search_queries) {
    console.log(`  Search Queries: ${metrics.search_queries.values.count || 0}`);
  }

  // HTTP performance
  if (metrics.http_req_duration) {
    console.log(`\n⚡ HTTP Performance:`);
    const duration = metrics.http_req_duration.values;
    if (duration.avg) console.log(`  Average: ${duration.avg.toFixed(2)}ms`);
    if (duration['p(95)']) console.log(`  P95: ${duration['p(95)'].toFixed(2)}ms`);
  }

  // Step performance breakdown
  console.log(`\n📈 Step Performance Breakdown:`);
  for (const [name, metric] of Object.entries(metrics)) {
    if (name.startsWith('group_duration{group:::')) {
      const groupName = name.match(/group:::(.+?)}$/)[1];
      if (metric.values && metric.values.avg) {
        console.log(`  ${groupName}: ${metric.values.avg.toFixed(2)}ms`);
      }
    }
  }

  console.log('\n========================================');
  console.log('✅ Enhanced website workflow test completed');
  console.log('========================================\n');
}

export function handleSummary(data) {
  // Return metrics to stdout instead of empty
  return {
    'stdout': JSON.stringify(data, null, 2),
  };
}