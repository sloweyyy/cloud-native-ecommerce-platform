/**
 * HTTP Client for Host Micro-Frontend
 * Configured with authentication, error handling, and logging
 */

import { HttpClientFactory } from '../http';
import { env } from '../config';

/**
 * Default HTTP client for Host app
 * - Uses shared configuration from .env files
 * - Includes authentication interceptors
 * - Centralized error handling
 * - API logging in development mode
 */
export const httpClient = HttpClientFactory.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
});

/**
 * Legacy export for backward compatibility
 */
export const axiosClient = httpClient;
export default httpClient;

