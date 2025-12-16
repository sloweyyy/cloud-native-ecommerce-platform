import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';
import type { ListCouponsInput, GetUserCouponsInput } from './input';
import type {
  GetCouponRequest,
  ValidateCouponRequest,
  GetCouponAnalyticsRequest,
} from './types';

const createCouponKeys = createCacheKeyWithScope('_coupon');

export const couponKeys = {
  list: createCacheSection((input?: Partial<ListCouponsInput>) =>
    createCouponKeys(['list', input])
  ),
  get: createCacheSection((input?: GetCouponRequest) =>
    createCouponKeys(['get', input?.code])
  ),
  validate: createCacheSection((input?: ValidateCouponRequest) =>
    createCouponKeys(['validate', input?.code, input?.cartTotal])
  ),
  userCoupons: createCacheSection((input?: GetUserCouponsInput) =>
    createCouponKeys(['userCoupons', input?.userId, input?.status])
  ),

  analytics: createCacheSection((input?: GetCouponAnalyticsRequest) =>
    createCouponKeys([
      'analytics',
      input?.couponId,
      input?.startDate,
      input?.endDate,
    ])
  ),

  all: createCouponKeys(['all']),
  detail: (code: string) => createCouponKeys(['get', code]),
};
