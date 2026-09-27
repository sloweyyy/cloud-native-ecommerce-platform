import MockAdapter from 'axios-mock-adapter';
import { axiosClient } from '../httpClient';
import { env } from '../../config';
import registerOrdersMocks from './orders/apis';

let mockAdapter: MockAdapter | null = null;

/**
 * Setup mock adapter for Axios client
 * Only sets up mocks in development mode when useMockData is enabled
 * Real API calls will pass through to the backend
 */
export function setupMocks() {
  // Skip mock setup in production or when useMockData is disabled
  if (!env.useMockData) {
    console.log('[Mocks] Mock adapter skipped (production mode or useMockData=false)');
    return;
  }

  if (mockAdapter) {
    console.warn('[Mocks] Mock adapter already initialized');
    return;
  }

  mockAdapter = new MockAdapter(axiosClient, {
    delayResponse: 300,
    onNoMatch: 'passthrough', // Allow real API calls to pass through
  });

  registerOrdersMocks(mockAdapter);

  console.log(
    '[Mocks] Account mock adapter initialized with orders endpoints'
  );
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

