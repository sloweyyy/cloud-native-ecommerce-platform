/**
 * K6 Test Configuration
 * Centralized service definitions, endpoints, and test configurations
 */

// Service configuration - maps to Kubernetes services
export const SERVICES = {
  catalog: {
    name: 'catalog',
    k8sService: 'eshopping-catalog',
    port: 8081,
    k8sPort: 80,
    namespace: __ENV.NAMESPACE || 'dev',
    endpoints: {
      // Direct service endpoints (with /api/v1) for port-forward
      // Gateway endpoints (without /api/v1) handled in getEndpoint()
      getAllProducts: '/api/v1/Catalog/GetAllProducts',
      getProduct: (id) => `/api/v1/Catalog/${id}`,
    },
    gatewayEndpoints: {
      // Gateway routes from ocelot.k8s.json (UpstreamPathTemplate)
      getAllProducts: '/Catalog/GetAllProducts',
      getProduct: (id) => `/Catalog/${id}`,
    }
  },
  basket: {
    name: 'basket',
    k8sService: 'eshopping-basket',
    port: 8082,
    k8sPort: 80,
    namespace: __ENV.NAMESPACE || 'dev',
    endpoints: {
      getBasket: (userName) => `/api/v1/Basket/GetBasket/${userName}`,
      checkout: '/api/v1/Basket/Checkout',
    },
    gatewayEndpoints: {
      getBasket: (userName) => `/Basket/GetBasket/${userName}`,
      checkout: '/Basket/Checkout',
    }
  },
  ordering: {
    name: 'ordering',
    k8sService: 'eshopping-ordering',
    port: 8083,
    k8sPort: 80,
    namespace: __ENV.NAMESPACE || 'dev',
    endpoints: {
      getOrders: (userName) => `/api/v1/Order/${userName}`,
      getActivity: '/api/v1/Activity',
    },
    gatewayEndpoints: {
      getOrders: (userName) => `/Order/${userName}`,
      getActivity: '/Activity',
    }
  },
  discount: {
    name: 'discount',
    k8sService: 'eshopping-discount-discount-grpc',
    port: 8084,
    k8sPort: 8080,
    namespace: __ENV.NAMESPACE || 'dev',
    endpoints: {
      // gRPC service - not tested via HTTP
    }
  }
};

/**
 * Build service URL for testing
 * @param {string} serviceName - Service key from SERVICES (e.g., 'catalog')
 * @returns {string} - Full base URL (gateway or localhost)
 */
export function getServiceUrl(serviceName) {
  const service = SERVICES[serviceName];
  if (!service) {
    throw new Error(`Unknown service: ${serviceName}`);
  }

  // Use AWS Gateway if configured (bypasses port-forward, handles any load)
  if (ENV.useGateway) {
    return ENV.gatewayUrl;
  }

  // Otherwise use localhost with port-forward (limited to ~300 concurrent users)
  return `http://localhost:${service.port}`;
}

/**
 * Build full endpoint URL with parameters
 * @param {string} serviceName - Service key from SERVICES (e.g., 'catalog')
 * @param {string} endpointName - Endpoint key (e.g., 'getAllProducts')
 * @param {...any} args - Arguments for endpoint function if applicable
 * @returns {string} - Full endpoint URL
 * Gateway mode: 'http://gateway/Catalog/GetAllProducts' (no /api/v1)
 * Port-forward mode: 'http://localhost:8081/api/v1/Catalog/GetAllProducts' (with /api/v1)
 */
export function getEndpoint(serviceName, endpointName, ...args) {
  const service = SERVICES[serviceName];
  if (!service) {
    throw new Error(`Unknown service: ${serviceName}`);
  }

  const url = getServiceUrl(serviceName);

  // Use gatewayEndpoints when in gateway mode, otherwise use direct endpoints
  const endpointMap = ENV.useGateway && service.gatewayEndpoints
    ? service.gatewayEndpoints
    : service.endpoints;

  const endpoint = endpointMap[endpointName];

  if (!endpoint) {
    throw new Error(`Unknown endpoint: ${endpointName} for service: ${serviceName}`);
  }

  const path = typeof endpoint === 'function' ? endpoint(...args) : endpoint;
  return url + path;
}

/**
 * Environment configuration
 */
export const ENV = {
  isAWS: __ENV.DEPLOYMENT_ENV === 'aws',
  // Default to AWS Gateway for better load test reliability
  // Set USE_GATEWAY=false to use localhost port-forwards (limited to ~300 concurrent users)
  useGateway: __ENV.USE_GATEWAY !== 'false',  // Changed: defaults to true unless explicitly disabled
  namespace: __ENV.NAMESPACE || 'dev',
  prometheusUrl: __ENV.PROMETHEUS_URL || 'http://localhost:9090',
  pushgatewayUrl: __ENV.PUSHGATEWAY_URL || 'http://localhost:9091',
  gatewayUrl: __ENV.GATEWAY_URL || __ENV.AWS_GATEWAY_URL || 'http://localhost:8010',
};

/**
 * Test type configurations - stages for different load test patterns
 */
export const TEST_TYPES = {
  smoke: {
    stages: [
      { duration: '1m', target: 1 },
    ],
    thresholds: {
      'http_req_duration': ['p(95)<500'],
      'http_req_failed': ['rate<0.01'],
    }
  },
  load: {
    stages: [
      { duration: '30s', target: 10 },
      { duration: '1m', target: 10 },
      { duration: '30s', target: 0 },
    ],
    thresholds: {
      'http_req_duration': ['p(95)<800'],
      'http_req_failed': ['rate<0.05'],
    }
  },
  stress: {
    stages: ENV.useGateway ? [
      // Gateway mode: Graduated load test (3 replicas per service)
      { duration: '1m', target: 100 },
      { duration: '1m', target: 300 },
      { duration: '1m', target: 500 },
      { duration: '2m', target: 500 },
      { duration: '2m', target: 500 },
      { duration: '1m', target: 0 },
    ] : [
      // Port-forward mode: Limited to 300 users
      { duration: '1m', target: 100 },
      { duration: '1m', target: 200 },
      { duration: '1m', target: 300 },
      { duration: '1m', target: 300 },
      { duration: '1m', target: 0 },
    ],
    thresholds: {
      'http_req_duration': ['p(95)<2000'],
      'http_req_failed': ['rate<0.10'],
    }
  },
  spike: {
    stages: [
      { duration: '1m', target: 2 },
      { duration: '30s', target: 100 },
      { duration: '2m', target: 100 },
      { duration: '30s', target: 2 },
      { duration: '1m', target: 2 },
    ],
    thresholds: {
      'http_req_duration': ['p(95)<2000', 'p(99)<5000'],
      'http_req_failed': ['rate<0.10'],
    }
  },
  soak: {
    stages: [
      { duration: '2m', target: 20 },
      { duration: '8m', target: 20 },
      { duration: '1m', target: 0 },
    ],
    thresholds: {
      'http_req_duration': ['p(95)<800', 'p(99)<1200'],
      'http_req_failed': ['rate<0.01'],
    }
  },
};

/**
 * Get all testable services (exclude discount gRPC service)
 * @returns {string[]} - Array of service names
 */
export function getTestableServices() {
  return ['catalog', 'basket', 'ordering'];
}

/**
 * Create service-specific tags for metrics
 * @param {string} serviceName - Service name
 * @param {string} testType - Test type (optional)
 * @returns {object} - Tags object for k6
 */
export function createTags(serviceName, testType = null) {
  const tags = {
    service: serviceName,
    namespace: ENV.namespace,
  };

  if (testType) {
    tags.test_type = testType;
  }

  return tags;
}
