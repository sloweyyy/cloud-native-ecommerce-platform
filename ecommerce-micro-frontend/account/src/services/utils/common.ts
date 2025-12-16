import { ApiErrorResponse, ApiResponse, ApiResult } from '../types';

/**
 * Type guard to check if API response is an error response
 *
 * Checks if the response object contains an error property, indicating
 * the API returned an error instead of successful data.
 *
 * @param response - API result to check
 * @returns True if response is an error, false if successful data
 *
 * @example
 * ```typescript
 * const response = await apiCall();
 *
 * if (isApiErrorResponse(response)) {
 *   console.error('API Error:', response.error.message);
 *   throw new Error(response.error.message);
 * }
 *
 * // TypeScript now knows response is successful data
 * const data = response.data;
 * ```
 */
export function isApiErrorResponse<T>(
  response: ApiResult<T>
): response is ApiErrorResponse {
  if (typeof response !== 'object' || response === null) return false;
  return (
    'error' in response && (response as ApiErrorResponse).error !== undefined
  );
}

/**
 * Type guard to check if response is a success response
 */
export function isApiResponse<T>(
  response: ApiResult<T>
): response is ApiResponse<T> {
  return !!response && 'data' in response;
}

