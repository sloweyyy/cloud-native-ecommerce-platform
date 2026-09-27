import MockAdapter from 'axios-mock-adapter';
import { axiosClient } from '../httpClient';

let mockAdapter: MockAdapter | null = null;

/**
 * Setup mock adapter for Axios client
 * Mock endpoints will only respond when useMock=true is in request params/payload
 */
export function setupMocks() {
  if (mockAdapter) {
    console.warn('[Mocks] Mock adapter already initialized');
    return;
  }

  mockAdapter = new MockAdapter(axiosClient, {
    delayResponse: 300,
    onNoMatch: 'passthrough', // Allow real API calls to pass through
  });

  console.log('[Mocks] Checkout mock adapter initialized');
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
