import { ApiErrorResponse, ApiResponse, ApiResult } from "../types";

/**
 * Type guard to check if response is an error response
 */
export function isApiErrorResponse<T>(
  response: ApiResult<T>
): response is ApiErrorResponse {
  return (
    response !== null &&
    typeof response === "object" &&
    "error" in response &&
    response.error !== undefined
  );
}

/**
 * Type guard to check if response is a success response
 */
export function isApiResponse<T>(
  response: ApiResult<T>
): response is ApiResponse<T> {
  return (
    response !== null &&
    typeof response === "object" &&
    "data" in response &&
    response.data !== undefined
  );
}
