import { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';

// https://x.com/mattpocockuk/status/1622730173446557697/photo/1
 
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export const SortOrder = {
  asc: 'asc',
  desc: 'desc',
} as const;

export type Nullable<T> = T | null | undefined;

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

export type Enumerable<T> = T | Array<T>;

export type FilterOptions<
  TAdditionalParams = Record<string, never>
> = {
  page?: number;
  limit?: number;
  orderBy?: Record<string, SortOrder>;
  useMock?: boolean;
} & TAdditionalParams;

export type RequestOptions = AxiosRequestConfig & {
  locale?: string;
};

export type RequestParams = FilterOptions<Record<PropertyKey, any>>;

export type RequestPayload = Record<PropertyKey, any>;

export type GetReturnType<Type> = Type extends (
  ...args: never[]
) => infer Return
  ? Return
  : never;

export type Request<
  Params extends RequestParams = RequestParams,
  Payload extends RequestPayload = RequestPayload,
> = {
  params?: Params;
  payload?: Payload;
  options?: RequestOptions;
};

export type RequestParamsRequired<
  Params extends RequestParams = RequestParams,
  Payload extends RequestPayload = RequestPayload,
> = Prettify<
  Omit<Request<Params, Payload>, 'params'> & { params: FilterOptions<Params> }
>;

export type RequestPayloadRequired<
  Payload extends RequestPayload = RequestPayload,
  Params extends RequestParams = RequestParams,
> = Prettify<Omit<Request<Params, Payload>, 'payload'> & { payload: Payload }>;

export type RequestRequired<
  Params extends RequestParams = RequestParams,
  Payload extends RequestPayload = RequestPayload,
> = Prettify<
  Omit<Request<Params, Payload>, 'payload' | 'params'> & {
    params: FilterOptions<Params>;
    payload: Payload;
  }
>;

export type ReactQueryOptions = Pick<
  UseQueryOptions,
  'enabled' | 'initialData'
>;

export type ReactMutationOptions = Pick<
  UseMutationOptions,
  'onSuccess' | 'onError'
>;

/**
 * Pagination metadata for list responses
 */
export type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

/**
 * Error detail object for API error responses
 */
export type ErrorDetail = Record<string, unknown>;

/**
 * Standard API error response structure
 *
 * Used when API returns an error instead of successful data
 */
export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details: ErrorDetail[];
    timestamp: string;
  };
};

/**
 * API response with data and optional pagination meta
 */
export type ApiResponseWithMeta<T> = {
  data: T;
  meta?: PaginationMeta;
};

/**
 * API response type - can be either wrapped or unwrapped
 */
export type ApiResponse<T> = T;

/**
 * Union type representing either successful data or error response
 *
 * Used as return type for API calls before validation
 */
export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

