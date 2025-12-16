import { AxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';

/**
 * Create endpoint path regex for mock adapter
 *
 * Converts endpoint patterns with :param syntax to regular expressions.
 * Used for matching URLs in axios-mock-adapter.
 *
 * @param endpoint - Endpoint pattern (e.g., '/api/v1/products/:id')
 * @returns RegExp for matching the endpoint
 *
 * @example
 * ```typescript
 * const regex = createEndpoint('/api/v1/products/:id');
 * // Matches: /api/v1/products/123, /api/v1/products/abc
 * ```
 */
export function createEndpoint(endpoint: string): RegExp {
  // Convert endpoint with :param syntax to regex
  const pattern = endpoint.replace(/:([^/]+)/g, '[^/]+');
  return new RegExp(`^${pattern}$`);
}

/**
 * Wrap data in ApiResponse format
 *
 * Currently a pass-through function that returns data as-is.
 * Allows future response envelope wrapping without changing call sites.
 *
 * @param data - Response data to wrap
 * @returns Data in ApiResponse format
 *
 * @example
 * ```typescript
 * // Current behavior
 * const response = createResponse({ id: 1, name: 'Product' });
 * // Returns: { id: 1, name: 'Product' }
 *
 * // Future behavior (if envelope wrapping is added)
 * // Returns: { data: { id: 1, name: 'Product' }, meta: { timestamp: ... } }
 * ```
 */
export function createResponse<T>(data: T): ApiResponse<T> {
  return data;
}

/**
 * Find item by URI pattern
 *
 * Helper function to extract URL parameters and find matching items in mock data.
 * Returns appropriate HTTP status codes with data or error messages.
 *
 * @param options - Configuration object
 * @param options.pattern - URL pattern (currently unused, for future regex matching)
 * @param options.config - Axios request config containing the URL
 * @param options.data - Array of items to search
 * @param options.property - Property name to match against (e.g., 'id')
 * @param options.index - Index in URL path where parameter is located
 * @returns Tuple of [status code, response data or error]
 *
 * @example
 * ```typescript
 * // URL: /api/v1/products/123
 * // urlParts: ['', 'api', 'v1', 'products', '123']
 * // index: 4
 *
 * const [status, response] = findItemByUri({
 *   pattern: '/api/v1/products/:id',
 *   config: { url: '/api/v1/products/123' },
 *   data: products,
 *   property: 'id',
 *   index: 4
 * });
 * // Returns: [200, { id: '123', name: '...' }]
 * ```
 */
export function findItemByUri<T extends Record<string, any>>(options: {
  pattern: string;
  config: AxiosRequestConfig;
  data: T[];
  property: keyof T;
  index: number;
}): [number, ApiResponse<T> | { error: string }] {
  const { config, data, property, index } = options;

  // Extract the parameter from URL
  const urlParts = config.url?.split('/') || [];
  const paramValue = urlParts[index];

  if (!paramValue) {
    return [404, { error: 'Invalid URL: missing parameter' }];
  }

  const item = data.find((item) => String(item[property]) === paramValue);

  if (!item) {
    return [404, { error: `Not found: ${String(property)} = ${paramValue}` }];
  }

  return [200, createResponse(item)];
}
