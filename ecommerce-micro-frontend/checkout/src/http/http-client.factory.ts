/**
 * Checkout Module - HTTP Client Factory
 */

import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '../config';
import { AuthStorage } from '../auth';
import { ApiErrorHandler } from './api-error.handler';
import type { ApiRequestConfig } from './http-client.types';

export interface HttpClientOptions {
  baseURL?: string;
  timeout?: number;
  useMock?: boolean;
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
      (config: InternalAxiosRequestConfig) => {
        const customConfig = config as ApiRequestConfig;
        if (customConfig.skipAuth) {
          return config;
        }

        const token = AuthStorage.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        const username = AuthStorage.getCurrentUsername();
        if (username && config.headers) {
          config.headers['X-User-Name'] = username;
        }

        if (env.enableApiLogging) {
          console.log('[checkout] 🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
          });
        }

        return config;
      },
      (error) => {
        console.error('[checkout] ❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (env.enableApiLogging) {
          console.log('[checkout] ✅ API Response:', {
            url: response.config.url,
            status: response.status,
          });
        }
        return response;
      },
      (error) => {
        if (env.enableApiLogging) {
          console.error('[checkout] ❌ API Error:', {
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

  static createWithMock(
    options: HttpClientOptions = {},
    mockHandler?: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>
  ): AxiosInstance {
    const instance = this.create(options);

    if (env.useMockData && mockHandler) {
      instance.interceptors.request.use(
        async (config) => {
          console.warn('[checkout] 🚧 Using mock data for:', config.url);
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
}

export const httpClient = HttpClientFactory.create();

export function createApiClient(
  baseURL?: string,
  options?: Omit<HttpClientOptions, 'baseURL'>
): AxiosInstance {
  return HttpClientFactory.create({ ...options, baseURL });
}

