/**
 * Store Module - API Error Handler
 */

import type { AxiosError } from 'axios';
import type { ApiError } from './http-client.types';

export class ApiErrorHandler {
  static handle(error: unknown): never {
    if (this.isAxiosError(error)) {
      throw this.transformAxiosError(error);
    }

    if (error instanceof Error) {
      throw this.transformError(error);
    }

    throw this.transformUnknownError(error);
  }

  private static isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError === true;
  }

  private static transformAxiosError(error: AxiosError): ApiError {
    const statusCode = error.response?.status;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseData = error.response?.data as any;

    let message = 'An unexpected error occurred';
    let errors: Record<string, string> | undefined;

    if (responseData) {
      message =
        responseData.message ||
        responseData.title ||
        responseData.error ||
        error.message;

      if (responseData.errors && typeof responseData.errors === 'object') {
        errors = responseData.errors;
      }
    } else {
      message = error.message;
    }

    if (statusCode === 401) {
      message = 'Authentication required. Please log in.';
    } else if (statusCode === 403) {
      message = 'You do not have permission to perform this action.';
    } else if (statusCode === 404) {
      message = 'The requested resource was not found.';
    } else if (statusCode === 500) {
      message = 'Server error. Please try again later.';
    } else if (statusCode && statusCode >= 500) {
      message = 'Server error. Please try again later.';
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timeout. Please check your connection.';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Network error. Please check your connection.';
    }

    return {
      message,
      statusCode,
      errors,
      originalError: error,
    };
  }

  private static transformError(error: Error): ApiError {
    return {
      message: error.message,
      originalError: error,
    };
  }

  private static transformUnknownError(error: unknown): ApiError {
    return {
      message: 'An unexpected error occurred',
      originalError: error,
    };
  }

  static formatForDisplay(error: ApiError): string {
    let message = error.message;

    if (error.errors && Object.keys(error.errors).length > 0) {
      const errorMessages = Object.entries(error.errors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join('\n');
      message += '\n\nValidation errors:\n' + errorMessages;
    }

    return message;
  }

  static isStatus(error: ApiError, statusCode: number): boolean {
    return error.statusCode === statusCode;
  }

  static isAuthError(error: ApiError): boolean {
    return error.statusCode === 401 || error.statusCode === 403;
  }

  static isNetworkError(error: ApiError): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalError = error.originalError as any;
    return (
      originalError?.code === 'ERR_NETWORK' ||
      originalError?.code === 'ECONNABORTED' ||
      !error.statusCode
    );
  }
}

