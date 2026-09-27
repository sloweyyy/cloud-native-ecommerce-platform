import MockAdapter from 'axios-mock-adapter';
import { createEndpoint, createResponse } from '../utils';
import { mockOrdersResponse } from './data';

const ENDPOINT = '/api/v1/mock/order';

export default function register(mockAdapter: MockAdapter) {
  // GET /api/v1/mock/order/orders
  mockAdapter.onGet(createEndpoint(`${ENDPOINT}/orders`)).reply(() => {
    return [200, createResponse(mockOrdersResponse)];
  });

  // GET /api/v1/mock/order/orders/:orderId
  mockAdapter
    .onGet(new RegExp(`^${ENDPOINT}/orders/(\\d+)/?$`))
    .reply((config) => {
      const orderId = parseInt(
        config.url?.match(/\/(\d+)\/?$/)?.[1] || '0',
        10
      );
      const order = mockOrdersResponse.find((o) => o.id === orderId);
      if (order) {
        return [200, createResponse(order)];
      }
      return [404, { message: 'Order not found' }];
    });
}

