import { isApiErrorResponse, isApiResponse } from '../utils/common';
import { Method } from 'axios';
import { ZodType } from 'zod';

import { emitter, EVENT_NAMES } from '../../libs/TinyEmitter';
import { buildPath } from '../helpers/buildPath';
import { filterUsedKeys } from '../helpers/filterUsedKeys';
import { parseParams, parseResponse } from '../helpers/validations';

import { mergeHeaderLocale } from '../helpers/mergeHeaderLocale';
import { axiosClient } from '../httpClient';
import {
  ApiResponse,
  ApiResult,
  Nullable,
  Request,
  RequestParams,
  RequestPayload,
} from '../types';
import { createApiResponseSchemaFactory } from './createApiResponseSchemaFactory';

export type ApiFactoryOptions<TResponse, TTransformed = TResponse> = {
  transformer?: (data: TResponse) => Nullable<TTransformed>;
  useMock?: boolean;
  paramsSchema?: ZodType<unknown>;
  payloadSchema?: ZodType<unknown>;
  responseSchema?: ZodType<unknown>;
  [key: PropertyKey]: unknown;
};

type CreateApiFactoryOptions = {
  version?: string;
};

export function createApiFactory(
  rootEndpoint: string,
  options: CreateApiFactoryOptions = { version: 'v1' },
) {
  const { version = 'v1' } = options;
  return async function <
    TResponse,
    TTransformed = TResponse,
    Options extends ApiFactoryOptions<
      TResponse,
      TTransformed
    > = ApiFactoryOptions<TResponse, TTransformed>,
    TParams extends RequestParams = RequestParams,
    TPayload extends RequestPayload = RequestPayload,
  >(
    method: Method | string,
    path: `/${string}` | null,
    request?: Request<TParams, TPayload>,
    options?: Options,
  ): Promise<Nullable<ApiResponse<TTransformed>>> {
    const { params = {}, payload = {} } = request ?? {};

    // Process rootEndpoint for placeholders
    const { finalPath: processedRootEndpoint, usedKeys: rootPathUsedKeys } =
      buildPath(
        rootEndpoint, // rootEndpoint from createApiFactory closure
        params,
        payload,
      );

    // Process pathSegment (original 'path' argument) for placeholders
    const pathSegment = path ?? '';
    const { finalPath: processedPathSegment, usedKeys: segmentPathUsedKeys } =
      buildPath(pathSegment, params, payload);

    // Combine the processed parts to form the final path for the URL
    const finalUrlPath = processedRootEndpoint + processedPathSegment;

    // Combine all keys used in path construction (root + segment)
    const allKeysUsedInPath = new Set<string>([
      ...rootPathUsedKeys,
      ...segmentPathUsedKeys,
    ]);

    const { baseURL: defaultBaseURL } = axiosClient.defaults;
    const baseURL = options?.useMock ? `/api` : `${defaultBaseURL}`;

    // Remove leading slash from finalUrlPath to prevent double slashes
    // Also remove trailing slash to match Ocelot routes
    let cleanPath = finalUrlPath.startsWith('/')
      ? finalUrlPath.slice(1)
      : finalUrlPath;
    // Remove trailing slash if present (except for root path)
    if (cleanPath.endsWith('/') && cleanPath.length > 1) {
      cleanPath = cleanPath.slice(0, -1);
    }

    // Construct URL - API Gateway expects /Catalog/... format (no version prefix)
    // The API Gateway will add /api/v1/ prefix when forwarding to backend
    const url = options?.useMock
      ? `${version}/mock/${cleanPath}`
      : cleanPath; // No version prefix for non-mock - API Gateway handles routing

    const headers = mergeHeaderLocale(request);

    let validParams;
    let validPayload;

    if (options?.paramsSchema) {
      validParams = parseParams(params, options.paramsSchema);
    } else {
      validParams = params;
    }

    if (options?.payloadSchema) {
      validPayload = parseParams(payload, options.payloadSchema);
    } else {
      validPayload = payload;
    }

    const filteredParams = filterUsedKeys(
      validParams as Record<PropertyKey, unknown>,
      allKeysUsedInPath, // Use combined keys
    );
    const filteredPayload = filterUsedKeys(
      validPayload as Record<PropertyKey, unknown>,
      allKeysUsedInPath, // Use combined keys
    );

    // For DELETE requests, don't send body if payload is empty
    const shouldSendBody = method.toUpperCase() !== 'DELETE' || Object.keys(filteredPayload).length > 0;

    const response = await axiosClient<ApiResult<TResponse>>({
      baseURL,
      method,
      url,
      headers,
      params: {
        ...filteredParams,
      },
      ...(shouldSendBody ? { data: filteredPayload } : {}),
      ...request?.options,
    }).then((res) => res.data); // destructure the data from the axios

    let validResponse: Nullable<ApiResult<TResponse>>;

    if (isApiErrorResponse(response)) {
      emitter.emit(EVENT_NAMES.API_ERROR, response.error.message);
      const error = new Error('Something went wrong') as Error & { cause?: unknown };
      error.cause = response;
      throw error;
    }

    if (options?.responseSchema) {
      // Check if response looks like it already matches a pagination/structured schema
      // (e.g., pagination response with pageIndex, pageSize, count, data properties)
      // This indicates the backend returns structured objects directly, not wrapped
      // IMPORTANT: Check for pagination structure FIRST, before checking isApiResponse
      // because pagination responses also have a 'data' property
      const responseHasPaginationStructure = 
        response && 
        typeof response === 'object' && 
        !Array.isArray(response) &&
        'pageIndex' in response &&
        'pageSize' in response &&
        'count' in response &&
        'data' in response;
      
      if (responseHasPaginationStructure) {
        // Response has pagination format (like paginationSchema: { pageIndex, pageSize, count, data: [...] })
        // Backend returns this format directly, validate as-is without double-wrapping
        // The response structure matches the schema exactly: { pageIndex, pageSize, count, data: array }
        validResponse = parseResponse(response, options.responseSchema) as Nullable<
          ApiResult<TResponse>
        >;
        // The validated response already has the structure with 'data' property
        // Cast it to ApiResult format (it already matches)
        validResponse = validResponse as ApiResult<TResponse>;
      } else if (isApiResponse(response) && !('pageIndex' in response || 'pageSize' in response || 'count' in response)) {
        // Response is already wrapped in { data: T } format (standard API response)
        // BUT NOT a pagination response (which also has 'data' but shouldn't be wrapped)
        // Response is already wrapped in { data: T } format (standard API response)
        const apiResponseSchema = createApiResponseSchemaFactory(
          options.responseSchema,
        );
        validResponse = parseResponse(response, apiResponseSchema) as Nullable<
          ApiResult<TResponse>
        >;
      } else {
        // Response is direct (array or object), wrap it for validation
        // Backend returns arrays/objects directly, not wrapped in { data: ... }
        const wrappedResponse = { data: response };
        const apiResponseSchema = createApiResponseSchemaFactory(
          options.responseSchema,
        );
        validResponse = parseResponse(wrappedResponse, apiResponseSchema) as Nullable<
          ApiResult<TResponse>
        >;
      }
    } else if (response && typeof response === 'object' && 'data' in response) {
      validResponse = response as ApiResult<TResponse>;
    } else if (Array.isArray(response) || (response && typeof response === 'object')) {
      // Direct response format, wrap it
      validResponse = { data: response as TResponse } as ApiResult<TResponse>;
    }

    if (validResponse === null && method !== 'DELETE') {
      console.error('Parsed response is null or invalid format');
      throw new Error('Parsed response is null or invalid format');
    }

    let transformedData = validResponse as unknown as Nullable<
      ApiResponse<TTransformed>
    >;

    // Check if this is a pagination response (has pageIndex, pageSize, count, data)
    const isPaginationResponse = 
      validResponse &&
      typeof validResponse === 'object' &&
      !Array.isArray(validResponse) &&
      'pageIndex' in validResponse &&
      'pageSize' in validResponse &&
      'count' in validResponse &&
      'data' in validResponse;

    if (
      typeof options?.transformer === 'function' &&
      validResponse
    ) {
      let transformed: Nullable<TTransformed>;
      
      if (isPaginationResponse) {
        // For pagination responses, pass the entire response to transformer
        // The transformer expects the full pagination structure: { pageIndex, pageSize, count, data: [...] }
        transformed = options.transformer(validResponse as unknown as TResponse);
      } else if (isApiResponse(validResponse)) {
        // For standard API responses wrapped in { data: T }, extract data first
        transformed = options.transformer((validResponse as ApiResponse<TResponse>).data);
      } else {
        // For direct responses (arrays/objects), pass as-is
        transformed = options.transformer(validResponse as unknown as TResponse);
      }
      
      if (transformed === null || transformed === undefined) {
        throw new Error('Transformed data cannot be null or undefined');
      }

      // At this point, transformed is guaranteed to be TTransformed (not null/undefined)
      // Wrap transformed data in { data: ... } format for consistent API response
      transformedData = {
        data: transformed as TTransformed,
        meta: isApiResponse(validResponse) ? (validResponse as ApiResponse<TResponse>).meta : undefined,
      };
    }

    return transformedData;
  };
}

