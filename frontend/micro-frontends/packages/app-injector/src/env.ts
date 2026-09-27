import type { Environment, EnvironmentConfig } from './types';

/**
 * Default environment configuration
 * Can be overridden by consumers using createEnvironmentDetector
 */
const DEFAULT_CONFIG: EnvironmentConfig = {
  productionHostname: 'ecommerce.example.com',
  stagingHostname: 'ecommerce.staging.example.com',
  developmentHostnames: ['localhost', '127.0.0.1'],
  apiUrls: {
    production: 'https://api.ecommerce.example.com',
    staging: 'https://api.staging.ecommerce.example.com',
    development: 'http://localhost:3000/api',
  },
};

let currentConfig: EnvironmentConfig = DEFAULT_CONFIG;

/**
 * Configure environment detection settings
 *
 * @param config - Environment configuration
 *
 * @example
 * ```ts
 * configureEnvironment({
 *   productionHostname: 'myapp.com',
 *   stagingHostname: 'staging.myapp.com',
 *   developmentHostnames: ['localhost', 'dev.myapp.local'],
 *   apiUrls: {
 *     production: 'https://api.myapp.com',
 *     staging: 'https://api.staging.myapp.com',
 *     development: 'http://localhost:8080',
 *   },
 * });
 * ```
 */
export const configureEnvironment = (config: Partial<EnvironmentConfig>): void => {
  currentConfig = { ...currentConfig, ...config };
};

/**
 * Get current environment configuration
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  return { ...currentConfig };
};

/**
 * Reset environment configuration to defaults
 */
export const resetEnvironmentConfig = (): void => {
  currentConfig = DEFAULT_CONFIG;
};

/**
 * Check if running in production environment
 */
export const isProductionEnv = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location?.hostname === currentConfig.productionHostname;
};

/**
 * Check if running in staging environment
 */
export const isStagingEnv = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location?.hostname === currentConfig.stagingHostname;
};

/**
 * Check if running in development environment
 */
export const isDevelopmentEnv = (): boolean => {
  if (typeof window === 'undefined') return true; // Default to dev in SSR
  const hostname = window.location?.hostname ?? '';
  return currentConfig.developmentHostnames.some(
    (devHost) => hostname === devHost || hostname.includes(devHost)
  );
};

/**
 * Get current environment
 *
 * @returns The current environment: 'production', 'staging', or 'development'
 */
export const getEnvironment = (): Environment => {
  if (isProductionEnv()) return 'production';
  if (isStagingEnv()) return 'staging';
  return 'development';
};

/**
 * Get API base URL based on current environment
 *
 * @returns The API base URL for the current environment
 */
export const getApiBaseUrl = (): string => {
  const env = getEnvironment();
  return currentConfig.apiUrls[env];
};

/**
 * Create a custom environment detector with specific configuration
 *
 * @param config - Environment configuration
 * @returns Object with environment detection functions
 *
 * @example
 * ```ts
 * const env = createEnvironmentDetector({
 *   productionHostname: 'myapp.com',
 *   stagingHostname: 'staging.myapp.com',
 *   developmentHostnames: ['localhost'],
 *   apiUrls: {
 *     production: 'https://api.myapp.com',
 *     staging: 'https://api.staging.myapp.com',
 *     development: 'http://localhost:8080',
 *   },
 * });
 *
 * console.log(env.getEnvironment()); // 'development'
 * console.log(env.getApiBaseUrl()); // 'http://localhost:8080'
 * ```
 */
export const createEnvironmentDetector = (config: EnvironmentConfig) => {
  const isProduction = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.location?.hostname === config.productionHostname;
  };

  const isStaging = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.location?.hostname === config.stagingHostname;
  };

  const isDevelopment = (): boolean => {
    if (typeof window === 'undefined') return true;
    const hostname = window.location?.hostname ?? '';
    return config.developmentHostnames.some(
      (devHost) => hostname === devHost || hostname.includes(devHost)
    );
  };

  const getEnv = (): Environment => {
    if (isProduction()) return 'production';
    if (isStaging()) return 'staging';
    return 'development';
  };

  const getApiUrl = (): string => {
    const env = getEnv();
    return config.apiUrls[env];
  };

  return {
    isProduction,
    isStaging,
    isDevelopment,
    getEnvironment: getEnv,
    getApiBaseUrl: getApiUrl,
    config,
  };
};

