import { AxiosRequestConfig } from 'axios';

import { Request } from '../types';

export const mergeHeaderLocale = <R extends Request<any, any>>(
  request?: R,
  payload?: AxiosRequestConfig
) => {
  if (!request) return {};

  const { options } = request;

  const locale = options?.locale || 'en';

  if (!payload?.headers) {
    return {
      'Content-Language': locale,
    };
  }

  return {
    ...payload.headers,
    'Content-Language': locale,
  };
};
