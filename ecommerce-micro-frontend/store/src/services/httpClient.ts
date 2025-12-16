/**
 * HTTP Client for Store Micro-Frontend
 * Configured with authentication, error handling, and logging
 */

import { HttpClientFactory } from '../http';
import { env } from '../config';

/**
 * Default HTTP client for Store app
 * - Uses shared configuration from .env files
 * - Includes authentication interceptors
 * - Centralized error handling
 * - API logging in development mode
 */
console.log('[httpClient] Creating axios client with baseURL:', env.apiBaseUrl);
console.log('[httpClient] useMockData:', env.useMockData);

export const httpClient = HttpClientFactory.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
});

console.log('[httpClient] Axios client created, defaults.baseURL:', httpClient.defaults.baseURL);

/**
 * Legacy export for backward compatibility
 */
export const axiosClient = httpClient;
export default httpClient;
