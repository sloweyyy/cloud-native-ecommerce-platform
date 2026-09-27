/**
 * Store Module - Environment Configuration
 * Self-contained configuration for store micro-frontend
 */

interface EnvironmentConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  useMockData: boolean;
  enableAuthentication: boolean;
  enableDiscountService: boolean;
  enableOrderTracking: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableApiLogging: boolean;
}

export const env: EnvironmentConfig = {
  apiBaseUrl: process.env.NX_API_BASE_URL || 'http://localhost:8010',
  apiTimeout: parseInt(process.env.NX_API_TIMEOUT || '30000', 10),
  useMockData: process.env.NX_USE_MOCK_DATA === 'true',
  enableAuthentication: process.env.NX_ENABLE_AUTHENTICATION !== 'false',
  enableDiscountService: process.env.NX_ENABLE_DISCOUNT_SERVICE !== 'false',
  enableOrderTracking: process.env.NX_ENABLE_ORDER_TRACKING !== 'false',
  logLevel: (process.env.NX_LOG_LEVEL || 'info') as EnvironmentConfig['logLevel'],
  enableApiLogging: process.env.NX_ENABLE_API_LOGGING === 'true',
};

// Validate configuration
if (!env.apiBaseUrl) {
  throw new Error('[store] API Base URL is required');
}

if (env.useMockData) {
  console.warn('[store] 🚧 Running in MOCK DATA mode');
}

