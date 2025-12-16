import { Method } from 'axios';
import { ZodType } from 'zod';

import { emitter, EVENT_NAMES } from '../../libs/TinyEmitter';
import { buildPath } from '../helpers/buildPath';
import { filterUsedKeys } from '../helpers/filterUsedKeys';
import { mergeHeaderLocale } from '../helpers/mergeHeaderLocale';
import { parseParams, parseResponse } from '../helpers/validations';
import { axiosClient } from '../httpClient';
import {
  ApiResponse,
  ApiResult,
  Nullable,
  Request,
  RequestParams,
  RequestPayload,
} from '../types';
import { isApiErrorResponse } from '../utils/common';

export type ApiFactoryOptions<TResponse, TTransformed = TResponse> = {
  transformer?: (data: TResponse) => Nullable<TTransformed>;
  useMock?: boolean;
  paramsSchema?: ZodType<unknown>;
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
    const cleanPath = finalUrlPath.startsWith('/')
      ? finalUrlPath.slice(1)
      : finalUrlPath;

    const url = options?.useMock
      ? `${version}/mock/${cleanPath}`
      : `${version}/${cleanPath}`;

    const headers = mergeHeaderLocale(request);

    let validParams;

    if (options?.paramsSchema) {
      validParams = parseParams(params, options.paramsSchema);
    } else {
      validParams = params;
    }

    const filteredParams = filterUsedKeys(
      validParams as Record<PropertyKey, unknown>,
      allKeysUsedInPath, // Use combined keys
    );
    const filteredPayload = filterUsedKeys(
      payload as Record<PropertyKey, unknown>,
      allKeysUsedInPath, // Use combined keys
    );

    const response = await axiosClient<ApiResult<TResponse>>({
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

    if (isApiErrorResponse(response)) {
      emitter.emit(EVENT_NAMES.API_ERROR, response.error.message);
      const error = new Error('Something went wrong') as Error & { cause?: unknown };
      error.cause = response;
      throw error;
    }

    let validResponse: Nullable<TResponse> = response as TResponse;

    if (options?.responseSchema) {
      validResponse = parseResponse(response, options.responseSchema) as Nullable<TResponse>;
    }

    if (validResponse === null && method !== 'DELETE') {
      console.error('Parsed response is null or invalid format');
      throw new Error('Parsed response is null or invalid format');
    }

    let transformedData: Nullable<TTransformed> = validResponse as unknown as Nullable<TTransformed>;

    if (typeof options?.transformer === 'function' && validResponse) {
      const transformed = options.transformer(validResponse);
      if (transformed === null || transformed === undefined) {
        throw new Error('Transformed data cannot be null or undefined');
      }
      transformedData = transformed;
    }

    return transformedData;
  };
}
