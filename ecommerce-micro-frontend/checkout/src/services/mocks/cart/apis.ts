import MockAdapter from 'axios-mock-adapter';
import { createEndpoint, createResponse } from '../utils';
import { mockCartResponse, mockEmptyCartResponse } from '../../cart/mocks';

const ENDPOINT = '/api/v1/mock/cart';

export default function register(mockAdapter: MockAdapter) {
  // GET /api/v1/mock/cart
  mockAdapter.onGet(createEndpoint(ENDPOINT)).reply(() => {
    return [200, createResponse(mockCartResponse)];
  });

  // POST /api/v1/mock/cart/items
  mockAdapter.onPost(createEndpoint(`${ENDPOINT}/items`)).reply(() => {
    return [200, createResponse(mockCartResponse)];
  });

  // PUT /api/v1/mock/cart/items/:itemId
  mockAdapter.onPut(createEndpoint(`${ENDPOINT}/items/:itemId`)).reply(() => {
    return [200, createResponse(mockCartResponse)];
  });

  // DELETE /api/v1/mock/cart/items/:itemId
  mockAdapter.onDelete(createEndpoint(`${ENDPOINT}/items/:itemId`)).reply(() => {
    return [200, createResponse(mockCartResponse)];
  });

  // DELETE /api/v1/mock/cart
  mockAdapter.onDelete(createEndpoint(ENDPOINT)).reply(() => {
    return [200, createResponse(mockEmptyCartResponse)];
  });

  // POST /api/v1/mock/cart/shipping
  mockAdapter.onPost(createEndpoint(`${ENDPOINT}/shipping`)).reply(() => {
    return [200, createResponse(mockCartResponse)];
  });
}

