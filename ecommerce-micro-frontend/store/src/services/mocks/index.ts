import MockAdapter from 'axios-mock-adapter';
import { axiosClient } from '../httpClient';
import registerProductsMocks from './products/apis';

let mockAdapter: MockAdapter | null = null;

/**
 * Setup mock adapter for Axios client
 */
export function setupMocks() {
  if (mockAdapter) {
    console.warn('[Mocks] Mock adapter already initialized');
    return;
  }

  mockAdapter = new MockAdapter(axiosClient, {
    delayResponse: 500,
  });

  registerProductsMocks(mockAdapter);

  console.log('[Mocks] Store mock adapter initialized with products endpoints');
}

/**
 * Reset mock adapter
 */
export function resetMocks() {
  if (mockAdapter) {
    mockAdapter.reset();
    console.log('[Mocks] Mock adapter reset');
  }
}

/**
 * Restore Axios to its original state
 */
export function restoreMocks() {
  if (mockAdapter) {
    mockAdapter.restore();
    mockAdapter = null;
    console.log('[Mocks] Mock adapter restored');
  }
}
