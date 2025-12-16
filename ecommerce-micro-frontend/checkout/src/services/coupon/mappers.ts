import { createMapper } from '../factory/createMapper';
import type { CouponResponse, Coupon } from './types';
import { couponResponseSchema } from './schemas';
import { isExpired, calculateRemainingUses } from '../../helpers/couponUtils';

export const couponMapper = createMapper<CouponResponse, Coupon>((response) => {
  // Computed fields
  const expired = isExpired(response.expiryDate);
  const remainingUses = calculateRemainingUses(
    response.usageLimit,
    response.usedCount
  );

  // Calculate canUse flag
  let canUse = false;
  if (response.isActive && !expired) {
    if (remainingUses !== undefined) {
      canUse = remainingUses > 0;
    } else {
      canUse = true;
    }
  }

  return {
    id: response.id,
    code: response.code,
    description: response.description || '',
    discountType: response.discountType,
    discountValue: response.discountValue,
    minPurchaseAmount: response.minPurchaseAmount,
    maxDiscountAmount: response.maxDiscountAmount,
    usageLimit: response.usageLimit,
    usagePerUser: response.usagePerUser,
    usedCount: response.usedCount ?? 0,
    startDate: response.startDate,
    expiryDate: response.expiryDate,
    applicableProducts: response.applicableProducts ?? [],
    applicableCategories: response.applicableCategories ?? [],
    excludedProducts: response.excludedProducts ?? [],
    isActive: response.isActive ?? false,
    isPublic: response.isPublic ?? false,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    isExpired: expired,
    canUse,
    remainingUses,
  };
}, couponResponseSchema);
