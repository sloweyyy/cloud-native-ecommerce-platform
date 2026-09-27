/**
 * Admin Module - HTTP Client Types
 */

import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string>;
  originalError?: unknown;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  useMock?: boolean;
  skipAuth?: boolean;
  /** Mark request as requiring authentication (will wait for async token) */
  requiresAuth?: boolean;
  /** Internal flag to prevent infinite retry loops */
  _retried?: boolean;
}

export interface HttpClient {
  get<T>(url: string, config?: ApiRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T>;
  delete<T>(url: string, config?: ApiRequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T>;
}

export type ApiResponse<T> = AxiosResponse<T>;
export type ApiAxiosError = AxiosError<ApiError>;

