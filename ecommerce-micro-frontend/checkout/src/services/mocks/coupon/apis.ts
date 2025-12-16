import MockAdapter from 'axios-mock-adapter';
import { createEndpoint, createResponse } from '../utils';
import { findCouponByCode, getCoupons } from './data';

const ENDPOINT = '/api/v1/mock/coupons';

export default function register(mockAdapter: MockAdapter) {
  // GET /api/v1/mock/coupons (list all) - must be before specific code endpoint
  mockAdapter.onGet(createEndpoint(ENDPOINT)).reply((config) => {
    const code = config.params?.code;
    const coupons = getCoupons(code);
    return [200, createResponse(coupons)];
  });

  // GET /api/v1/mock/coupons/:code (get by code)
  mockAdapter.onGet(createEndpoint(`${ENDPOINT}/:code`)).reply((config) => {
    const urlParts = config.url?.split('/') || [];
    const code = urlParts[urlParts.length - 1];
      
    if (!code) {
      return [400, { error: 'Coupon code is required' }];
    }
      
    const coupon = findCouponByCode(code);
      
    if (!coupon) {
      return [404, { error: 'Coupon not found' }];
    }
      
    return [200, createResponse(coupon)];
  });
}
