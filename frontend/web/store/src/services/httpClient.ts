import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosRequestTransformer,
  AxiosResponse,
  AxiosResponseTransformer,
} from 'axios';

import { env } from '../config';
import { AuthStrategy, BearerAuthStrategy } from './auth/strategies';
import { emitter, EVENT_NAMES } from '@libs/TinyEmitter';
import { HttpError } from './types';

export interface ApiRequestConfig extends AxiosRequestConfig {
  useMock?: boolean;
  skipAuth?: boolean;
}

function createAxiosClientWithAuth(
  baseURL: string,
  authStrategy: AuthStrategy,
  timeout = 60 * 1000
): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout,
  });

  client.interceptors.request.use(
    function (config) {
      const customConfig = config as ApiRequestConfig;
      if (customConfig.skipAuth) {
        return config;
      }

      const newConfig = {
        ...config,
        headers: { ...config.headers } as AxiosRequestHeaders,
      };

      const authHeaders = authStrategy.getAuthHeader();
      Object.assign(newConfig.headers, authHeaders);

      return newConfig;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  return client;
}

const axiosClient = createAxiosClientWithAuth(
  env.apiBaseUrl,
  new BearerAuthStrategy(),
  env.apiTimeout
);

function addResponseInterceptors(client: AxiosInstance) {
  client.interceptors.response.use(
    function (response: AxiosResponse) {
      return response;
    },
    function (error: AxiosError) {
      const { status, statusText, data } = error.response || {};
      if (status && [401, 403].includes(status)) {
        const httpError = new HttpError(
          status,
          statusText || '',
          error?.message || 'Something went wrong',
          data
        );

        emitter.emit(EVENT_NAMES.API_ERROR_WITH_STATUS, httpError);

        return Promise.reject(httpError);
      }

      if (!axios.isCancel(error)) {
        const errorMessage =
          (error as AxiosError)?.message || 'Network error occurred';
        emitter.emit(EVENT_NAMES.API_ERROR, errorMessage);
      }

      return Promise.reject(error);
    }
  );
}

addResponseInterceptors(axiosClient);

const transformRequestDefaults = axiosClient.defaults
  .transformRequest as AxiosRequestTransformer[];
const transformResponseDefaults = axiosClient.defaults
  .transformResponse as AxiosResponseTransformer[];

export {
  axiosClient,
  createAxiosClientWithAuth,
  transformRequestDefaults,
  transformResponseDefaults,
};
