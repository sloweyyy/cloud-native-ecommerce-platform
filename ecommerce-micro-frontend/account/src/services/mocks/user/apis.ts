import MockAdapter from 'axios-mock-adapter';
import { createEndpoint, createResponse } from '../utils';
import { mockUserResponse } from './mocks';

const ENDPOINT = '/api/v1/mock/user';

export default function register(mockAdapter: MockAdapter) {
  // GET /api/v1/mock/user/profile
  mockAdapter.onGet(createEndpoint(`${ENDPOINT}/profile`)).reply(() => {
    return [200, createResponse(mockUserResponse)];
  });

  // PUT /api/v1/mock/user/profile
  mockAdapter.onPut(createEndpoint(`${ENDPOINT}/profile`)).reply((config) => {
    // Return updated user with request data merged
    const requestData = JSON.parse(config.data || '{}');
    const updatedUser = {
      ...mockUserResponse,
      ...requestData,
    };
    return [200, createResponse(updatedUser)];
  });
}

