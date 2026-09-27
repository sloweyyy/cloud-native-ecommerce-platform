import { isApiErrorResponse } from '../utils/common';
import { AxiosInstance, Method } from 'axios';
import { ZodType } from 'zod';

import { emitter, EVENT_NAMES } from '../../libs/TinyEmitter';
import { buildPath } from '../helpers/buildPath';
import { filterUsedKeys } from '../helpers/filterUsedKeys';
import { parseParams, parseResponse } from '../helpers/validations';

import { AuthStrategyType, createAuthStrategy } from '../auth/strategies';
import { mergeHeaderLocale } from '../helpers/mergeHeaderLocale';
import { axiosClient, createAxiosClientWithAuth } from '../httpClient';
import {
  ApiResponse,
  ApiResult,
  Nullable,
  Request,
  RequestParams,
  RequestPayload,
} from '../types';

export type ApiFactoryOptions<TResponse, TTransformed = TResponse> = {
  transformer?: (data: TResponse) => Nullable<TTransformed>;
  useMock?: boolean;
  paramsSchema?: ZodType<unknown>;
  responseSchema?: ZodType<unknown>;
  [key: PropertyKey]: unknown;
};

/**
 * version: string
 *   - 'v1'   => /v1/endpoint
 *   - 'v0'   => /v0/endpoint
 *   - ''     => /endpoint (no version prefix, no double slash)
 */
type CreateApiFactoryOptions = {
  version?: string; // See above for usage
  authStrategy?: AuthStrategyType;
  client?: AxiosInstance;
  baseURL?: string;
};

export function createApiFactory(
  rootEndpoint: string,
  options: CreateApiFactoryOptions = { version: 'v1' }
) {
  const {
    version = 'v1',
    authStrategy = 'bearer',
    client: providedClient,
    baseURL: providedBaseURL,
  } = options;

  // Determine which client to use
  let selectedClient: AxiosInstance;

  if (providedClient) {
    selectedClient = providedClient;
  } else {
    selectedClient = axiosClient;
  }

  // Create custom client if baseURL is provided
  if (providedBaseURL && !providedClient) {
    const strategy = createAuthStrategy(authStrategy);
    selectedClient = createAxiosClientWithAuth(providedBaseURL, strategy);
  }
  return async function <
    TResponse,
    TTransformed = TResponse,
    Options extends ApiFactoryOptions<
      TResponse,
      TTransformed
    > = ApiFactoryOptions<TResponse, TTransformed>,
    TParams extends RequestParams = RequestParams,
    TPayload extends RequestPayload = RequestPayload
  >(
    method: Method | string,
    path: `/${string}` | null,
    request?: Request<TParams, TPayload>,
    options?: Options
  ): Promise<Nullable<ApiResponse<TTransformed>>> {
    const { params = {}, payload = {} } = request ?? {};

    // Process rootEndpoint for placeholders
    const { finalPath: processedRootEndpoint, usedKeys: rootPathUsedKeys } =
      buildPath(
        rootEndpoint, // rootEndpoint from createApiFactory closure
        params,
        payload
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

    const { baseURL: defaultBaseURL } = selectedClient.defaults;
    const baseURL = options?.useMock ? `/api` : `${defaultBaseURL}`;

    // Remove leading slash from finalUrlPath to prevent double slashes
    const cleanPath = finalUrlPath.startsWith('/')
      ? finalUrlPath.slice(1)
      : finalUrlPath;

    // Build the URL, avoiding double slashes if version is empty
    const url = (() => {
      if (options?.useMock) {
        return version ? `/${version}/mock/${cleanPath}` : `/mock/${cleanPath}`;
      }
      return version ? `/${version}/${cleanPath}` : `/${cleanPath}`;
    })();

    const headers = mergeHeaderLocale(request);

    let validParams;

    if (options?.paramsSchema) {
      validParams = parseParams(params, options.paramsSchema);
    } else {
      validParams = params;
    }

    const filteredParams = filterUsedKeys(
      validParams as Record<PropertyKey, unknown>,
      allKeysUsedInPath // Use combined keys
    );
    const filteredPayload = filterUsedKeys(
      payload as Record<PropertyKey, unknown>,
      allKeysUsedInPath // Use combined keys
    );

    const response = await selectedClient<ApiResult<TResponse>>({
      baseURL,
      method,
      url,
      headers,
      params: {
        ...filteredParams,
      },
      data: filteredPayload,
      ...request?.options,
    }).then((res) => res.data); // destructure the data from the axios

    let validResponse: Nullable<ApiResult<TResponse>>;

    if (isApiErrorResponse(response)) {
      // Ensure the message is always a string to prevent React error #31
      const errorMessage =
        typeof response.message === 'string'
          ? response.message
          : typeof response.error === 'string'
            ? response.error
            : JSON.stringify(response) || 'An unknown error occurred';

      emitter.emit(EVENT_NAMES.API_ERROR, errorMessage);
      const error = new Error('Something went wrong') as Error & {
        cause?: unknown;
      };
      error.cause = response;
      throw error;
    }

    if (options?.responseSchema) {
      validResponse = parseResponse(
        response,
        options.responseSchema
      ) as Nullable<ApiResult<TResponse>>;
    } else {
      validResponse = response;
    }

    if (validResponse === null && method !== 'DELETE') {
      console.error('Parsed response is null or invalid format');
      throw new Error('Parsed response is null or invalid format');
    }

    let transformedData = validResponse as unknown as Nullable<
      ApiResponse<TTransformed>
    >;

    if (typeof options?.transformer === 'function' && validResponse) {
      const transformed = options.transformer(validResponse as TResponse);
      if (transformed === null || transformed === undefined) {
        throw new Error('Transformed data cannot be null or undefined');
      }

      transformedData = transformed;
    }

    return transformedData;
  };
}
