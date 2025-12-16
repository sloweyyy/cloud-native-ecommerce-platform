import { Coupon } from '../services/coupon/types';
import { calculateDiscountAmount } from './couponUtils';

export function calculateCouponDiscount(
  coupon: Coupon,
  subtotal: number
): number {
  return calculateDiscountAmount(coupon, subtotal);
}

export function calculateTotalDiscount(
  coupons: Coupon[],
  subtotal: number
): number {
  const totalDiscount = coupons.reduce((total, coupon) => {
    return total + calculateDiscountAmount(coupon, subtotal);
  }, 0);

  return Math.min(totalDiscount, subtotal);
}

export function canApplyToProduct(
  coupon: Coupon,
  productIds: string[]
): boolean {
  if (!productIds || productIds.length === 0) {
    return false;
  }

  if (coupon.excludedProducts && coupon.excludedProducts.length > 0) {
    const hasExcludedProduct = productIds.some((id) =>
      coupon.excludedProducts?.includes(id)
    );
    if (hasExcludedProduct) {
      return false;
    }
  }

  if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
    return productIds.some((id) => coupon.applicableProducts?.includes(id));
  }

  return true;
}

export function calculateFinalPrice(
  subtotal: number,
  discount: number
): number {
  const final = Math.max(0, subtotal - discount);
  return Math.round(final * 100) / 100;
}

export function calculateDiscount(coupon: Coupon, subtotal: number): number {
  return calculateCouponDiscount(coupon, subtotal);
}

export function calculateTotalSavings(
  coupons: Coupon[],
  subtotal: number
): number {
  return calculateTotalDiscount(coupons, subtotal);
}

export function formatDiscount(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
