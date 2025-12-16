/**
 * Environment Detection and Configuration
 * 
 * Utilities for detecting the current environment (dev/stg/prd)
 * and retrieving appropriate remote URLs for micro frontends.
 */

export type Environment = 'dev' | 'stg' | 'prd';

/**
 * Detect the current environment based on hostname
 * 
 * @returns The current environment
 * 
 * @example
 * // localhost:4200 -> 'dev'
 * // app-stg.ecommerce.com -> 'stg'
 * // app.ecommerce.com -> 'prd'
 */
export const getEnvironment = (): Environment => {
  const hostname = window.location.hostname;

  // Development environment
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('localhost')
  ) {
    return 'dev';
  }

  // Staging environment
  if (hostname.includes('stg') || hostname.includes('staging')) {
    return 'stg';
  }

  // Production environment (default)
  return 'prd';
};

/**
 * Get the appropriate remote URL based on current environment
 * 
 * @param urls - Object containing URLs for each environment
 * @returns The URL for the current environment
 * 
 * @example
 * const remoteUrl = getRemoteUrl({
 *   dev: 'http://localhost:4201',
 *   stg: 'https://store-stg.example.com',
 *   prd: 'https://store.example.com'
 * });
 */
export const getRemoteUrl = (urls: Record<Environment, string>): string => {
  const env = getEnvironment();
  return urls[env];
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return getEnvironment() === 'dev';
};

/**
 * Check if running in staging mode
 */
export const isStaging = (): boolean => {
  return getEnvironment() === 'stg';
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return getEnvironment() === 'prd';
};

/**
 * Get environment-specific API base URL
 * Can be used by host or passed to micro frontends
 */
export const getApiBaseUrl = (): string => {
  const env = getEnvironment();
  
  const apiUrls: Record<Environment, string> = {
    dev: 'http://localhost:8000/api',
    stg: 'https://api-stg.ecommerce.com',
    prd: 'https://api.ecommerce.com',
  };
  
  return apiUrls[env];
};

