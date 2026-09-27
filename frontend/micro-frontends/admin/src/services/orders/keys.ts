import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';
import { OrdersParamsInput } from './input';

const createOrderKeys = createCacheKeyWithScope('_order');

export const ordersKeys = {
  // Aligned with useGetOrders hook
  all: createCacheSection((input?: OrdersParamsInput) =>
    createOrderKeys(['orders', input])
  ),
  // Aligned with useGetOrderById hook
  detail: createCacheSection((id?: number) =>
    createOrderKeys(['order', id])
  ),
};
