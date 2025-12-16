import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';
import type { GetOrdersRequest, GetOrderByIdRequest } from './types';

const createOrderKeys = createCacheKeyWithScope('_order');

export const orderKeys = {
  get: createCacheSection((input?: GetOrdersRequest) =>
    createOrderKeys(['get', input?.userName])
  ),

  getById: createCacheSection((input?: GetOrderByIdRequest) =>
    createOrderKeys(['getById', input?.orderId])
  ),

  all: createOrderKeys(['all']),
  detail: (userName?: string) => createOrderKeys(['get', userName]),
  byId: (orderId?: string) => createOrderKeys(['getById', orderId]),
};

