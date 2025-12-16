import { Coupon } from '../services/coupon/types';

export function isExpired(expiryDate: string): boolean {
  return new Date(expiryDate) < new Date();
}

export function isWithinValidDateRange(
  startDate: string,
  expiryDate: string
): boolean {
  const now = new Date();
  const start = new Date(startDate);
  const expiry = new Date(expiryDate);

  return now >= start && now <= expiry;
}

export function isExpiringSoon(
  expiryDate: string,
  daysThreshold: number
): boolean {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysUntilExpiry > 0 && daysUntilExpiry <= daysThreshold;
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);

  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateRemainingUses(
  usageLimit?: number,
  usedCount?: number
): number | undefined {
  if (usageLimit === undefined || usedCount === undefined) return undefined;
  return Math.max(0, usageLimit - usedCount);
}

export function hasReachedUsageLimit(
  usageLimit?: number,
  usedCount?: number
): boolean {
  if (usageLimit === undefined || usedCount === undefined) return false;
  return usedCount >= usageLimit;
}

export function calculateUsagePercentage(
  usageLimit?: number,
  usedCount?: number
): number {
  if (usageLimit === undefined || usedCount === undefined || usageLimit === 0) {
    return 0;
  }
  return Math.min(100, Math.round((usedCount / usageLimit) * 100));
}

export function canUseCoupon(coupon: Coupon): boolean {
  if (!coupon.isActive) return false;

  const expired = isExpired(coupon.expiryDate);
  if (expired) return false;

  const remainingUses = calculateRemainingUses(
    coupon.usageLimit,
    coupon.usedCount
  );
  if (remainingUses !== undefined && remainingUses <= 0) return false;

  return true;
}

export function isCouponAvailable(coupon: Coupon): boolean {
  return (
    coupon.isActive &&
    isWithinValidDateRange(coupon.startDate, coupon.expiryDate)
  );
}

export function getCouponStatus(coupon: Coupon): {
  status: 'active' | 'expired' | 'used_up' | 'inactive' | 'not_started';
  message: string;
} {
  if (!coupon.isActive) {
    return { status: 'inactive', message: 'Coupon is inactive' };
  }

  const now = new Date();
  const start = new Date(coupon.startDate);
  const expiry = new Date(coupon.expiryDate);

  if (now < start) {
    return { status: 'not_started', message: 'Coupon not yet active' };
  }

  if (now > expiry) {
    return { status: 'expired', message: 'Coupon has expired' };
  }

  if (hasReachedUsageLimit(coupon.usageLimit, coupon.usedCount)) {
    return { status: 'used_up', message: 'Coupon usage limit reached' };
  }

  return { status: 'active', message: 'Coupon is active' };
}

export function calculateDiscountAmount(
  coupon: Coupon,
  cartTotal: number
): number {
  // No discount for zero or negative cart total
  if (cartTotal <= 0) {
    return 0;
  }

  let discountAmount = 0;

  switch (coupon.discountType) {
    case 'percentage':
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      break;
    case 'fixed':
      discountAmount = coupon.discountValue;
      break;
    case 'freeShipping':
      discountAmount = 0;
      break;
    default:
      discountAmount = 0;
  }

  if (
    coupon.maxDiscountAmount !== undefined &&
    discountAmount > coupon.maxDiscountAmount
  ) {
    discountAmount = coupon.maxDiscountAmount;
  }

  return Math.min(discountAmount, cartTotal);
}

export function meetsMinPurchaseAmount(
  coupon: Coupon,
  cartTotal: number
): boolean {
  if (coupon.minPurchaseAmount === undefined) return true;
  return cartTotal >= coupon.minPurchaseAmount;
}
