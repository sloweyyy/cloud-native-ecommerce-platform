/**
 * Account Module - Environment Configuration
 */

interface EnvironmentConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  useMockData: boolean;
  enableAuthentication: boolean;
  enableOrderTracking: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableApiLogging: boolean;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const envValue = (process as any).env?.[key];

  if (envValue === undefined) {
    if (defaultValue === undefined) {
      console.warn(`[account/env] Variable ${key} is not set, using empty string`);
      return '';
    }
    return defaultValue;
  }

  return envValue;
};

const getBooleanEnv = (key: string, defaultValue = false): boolean => {
  const value = getEnvVar(key, String(defaultValue));
  return value === 'true' || value === '1';
};

const getNumberEnv = (key: string, defaultValue: number): number => {
  const value = getEnvVar(key, String(defaultValue));
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const env: EnvironmentConfig = {
  apiBaseUrl: getEnvVar('NX_API_BASE_URL', 'http://localhost:8010'),
  apiTimeout: getNumberEnv('NX_API_TIMEOUT', 30000),
  useMockData: getBooleanEnv('NX_USE_MOCK_DATA', false),
  enableAuthentication: getBooleanEnv('NX_ENABLE_AUTHENTICATION', true),
  enableOrderTracking: getBooleanEnv('NX_ENABLE_ORDER_TRACKING', true),
  logLevel: getEnvVar('NX_LOG_LEVEL', 'info') as EnvironmentConfig['logLevel'],
  enableApiLogging: getBooleanEnv('NX_ENABLE_API_LOGGING', false),
};

// Validate configuration
if (!env.apiBaseUrl) {
  throw new Error('[account] API Base URL is required');
}

if (env.useMockData) {
  console.warn('[account] 🚧 Running in MOCK DATA mode');
}

