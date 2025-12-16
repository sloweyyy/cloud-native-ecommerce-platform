import { Coupon } from '../services/coupon/types';
import {
  isExpired as isExpiredUtil,
  hasReachedUsageLimit as hasReachedUsageLimitUtil,
  meetsMinPurchaseAmount,
  canUseCoupon,
} from './couponUtils';

export function isExpired(coupon: Coupon): boolean {
  return isExpiredUtil(coupon.expiryDate);
}

export function hasReachedUsageLimit(coupon: Coupon): boolean {
  return hasReachedUsageLimitUtil(coupon.usageLimit, coupon.usedCount);
}

export function meetsMinPurchase(coupon: Coupon, subtotal: number): boolean {
  return meetsMinPurchaseAmount(coupon, subtotal);
}

export function isUserEligible(coupon: Coupon, userId?: string): boolean {
  return true;
}

export function hasProductRestrictions(coupon: Coupon): boolean {
  return (
    (coupon.applicableProducts?.length ?? 0) > 0 ||
    (coupon.excludedProducts?.length ?? 0) > 0
  );
}

export function canStack(coupon: Coupon): boolean {
  return true;
}

export function getValidationMessage(coupon: Coupon): string | null {
  if (!coupon || !coupon.id) {
    return 'Invalid coupon';
  }

  if (!canUseCoupon(coupon)) {
    if (!coupon.isActive) {
      return 'Coupon is inactive';
    }
    if (isExpired(coupon)) {
      return 'Coupon has expired';
    }
    if (hasReachedUsageLimit(coupon)) {
      return 'Coupon usage limit reached';
    }
  }

  return null;
}

/**
 * Check if coupon is valid for display
 */
export function isCouponValid(coupon: Coupon): boolean {
  return getValidationMessage(coupon) === null;
}
