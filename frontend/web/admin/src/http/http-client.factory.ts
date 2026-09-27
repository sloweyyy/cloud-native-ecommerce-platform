/**
 * Admin Module - HTTP Client Factory
 *
 * Creates Axios instances with authentication interceptors.
 * Uses the auth token provider to get tokens from the current auth context.
 */

import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getStoredToken, getStoredUser } from '@ecommerce-platform/auth-provider';
import { env } from '../config';
import { ApiErrorHandler } from './api-error.handler';
import { authTokenProvider } from './auth-token-provider';
import type { ApiRequestConfig } from './http-client.types';

export interface HttpClientOptions {
  baseURL?: string;
  timeout?: number;
  useMock?: boolean;
  /** Use legacy auth storage instead of token provider */
  useLegacyAuth?: boolean;
}

export class HttpClientFactory {
  static create(options: HttpClientOptions = {}): AxiosInstance {
    const instance = axios.create({
      baseURL: options.baseURL || env.apiBaseUrl,
      timeout: options.timeout || env.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const customConfig = config as ApiRequestConfig;
        if (customConfig.skipAuth) {
          return config;
        }

        // Handle FormData uploads - remove Content-Type header so axios can set it automatically
        // with the proper boundary (multipart/form-data; boundary=...)
        if (config.data instanceof FormData && config.headers) {
          // Delete Content-Type to let axios set it automatically with boundary
          delete config.headers['Content-Type'];
        }

        // Try to get token from auth token provider first
        let token: string | null = null;
        let username: string | null = null;

        if (!options.useLegacyAuth && authTokenProvider.hasProvider()) {
          // Use token provider (from auth context)
          token = authTokenProvider.getTokenSync();
          const userInfo = authTokenProvider.getUserInfo();
          username = userInfo?.username || userInfo?.email || null;

          // If no sync token available, try async (for important requests)
          if (!token && customConfig.requiresAuth) {
            token = await authTokenProvider.getTokenAsync();
          }
        }

        // Fallback to stored token if no provider or token
        if (!token) {
          token = getStoredToken();
        }
        if (!username) {
          const storedUser = getStoredUser();
          username = storedUser?.username || storedUser?.email || null;
        }

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (username && config.headers) {
          config.headers['X-User-Name'] = username;
        }

        if (env.enableApiLogging) {
          console.log('[admin] 🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            hasToken: !!token,
            authSource: authTokenProvider.hasProvider() ? 'provider' : 'storage',
          });
        }

        return config;
      },
      (error) => {
        console.error('[admin] ❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (env.enableApiLogging) {
          console.log('[admin] ✅ API Response:', {
            url: response.config.url,
            status: response.status,
          });
        }
        return response;
      },
      async (error) => {
        // Handle 401 Unauthorized - try to refresh token
        if (error.response?.status === 401 && authTokenProvider.hasProvider()) {
          const config = error.config as ApiRequestConfig;
          
          // Only retry once
          if (!config._retried) {
            config._retried = true;
            
            try {
              // Try to get fresh token
              const newToken = await authTokenProvider.getTokenAsync();
              if (newToken && config.headers) {
                config.headers.Authorization = `Bearer ${newToken}`;
                return axios(config);
              }
            } catch (refreshError) {
              console.error('[admin] Token refresh failed:', refreshError);
            }
          }
        }

        if (env.enableApiLogging) {
          console.error('[admin] ❌ API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
          });
        }
        return Promise.reject(ApiErrorHandler.handle(error));
      }
    );

    return instance;
  }

  /**
   * Create HTTP client with mock support
   */
  static createWithMock(
    options: HttpClientOptions = {},
    mockHandler?: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>
  ): AxiosInstance {
    const instance = this.create(options);

    if (env.useMockData && mockHandler) {
      instance.interceptors.request.use(
        async (config) => {
          console.warn('[admin] 🚧 Using mock data for:', config.url);
          const mockResponse = await mockHandler(config);
          throw {
            config,
            response: mockResponse,
            isAxiosError: false,
            toJSON: () => ({}),
          };
        }
      );

      instance.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response && !error.isAxiosError) {
            return Promise.resolve(error.response);
          }
          return Promise.reject(error);
        }
      );
    }

    return instance;
  }

  /**
   * Create HTTP client with legacy auth (direct storage access)
   */
  static createLegacy(options: HttpClientOptions = {}): AxiosInstance {
    return this.create({ ...options, useLegacyAuth: true });
  }
}

export const httpClient = HttpClientFactory.create();

export function createApiClient(
  baseURL?: string,
  options?: Omit<HttpClientOptions, 'baseURL'>
): AxiosInstance {
  return HttpClientFactory.create({ ...options, baseURL });
}
