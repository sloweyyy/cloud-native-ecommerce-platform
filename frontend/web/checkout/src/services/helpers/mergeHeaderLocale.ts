import { Request, RequestParams, RequestPayload } from '../types';

/**
 * Merge locale header with request options
 */
export function mergeHeaderLocale<
  TParams extends RequestParams,
  TPayload extends RequestPayload
>(request?: Request<TParams, TPayload>): Record<string, string> {
  const headers: Record<string, string> = {};

  if (request?.options?.locale) {
    headers['Accept-Language'] = request.options.locale;
  }

  if (request?.options?.headers) {
    Object.assign(headers, request.options.headers);
  }

  return headers;
}

