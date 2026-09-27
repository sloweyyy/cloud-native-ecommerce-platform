import { AxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';

/**
 * Create endpoint path for mock adapter
 */
export function createEndpoint(endpoint: string): RegExp {
  // Convert endpoint with :param syntax to regex
  const pattern = endpoint.replace(/:([^/]+)/g, '[^/]+');
  return new RegExp(`^${pattern}$`);
}

/**
 * Wrap data in ApiResponse format
 */
export function createResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
  };
}

/**
 * Find item by URI pattern
 */
export function findItemByUri<T extends Record<string, any>>(options: {
  pattern: string;
  config: AxiosRequestConfig;
  data: T[];
  property: keyof T;
  index: number;
}): [number, ApiResponse<T> | { error: string }] {
  const { pattern, config, data, property, index } = options;

  // Extract the parameter from URL
  const urlParts = config.url?.split('/') || [];
  const paramValue = urlParts[index];

  if (!paramValue) {
    return [404, { error: 'Invalid URL' }];
  }

  const item = data.find((item) => String(item[property]) === paramValue);

  if (!item) {
    return [404, { error: 'Not found' }];
  }

  return [200, createResponse(item)];
}

