import {
  isExpired,
  isWithinValidDateRange,
  isExpiringSoon,
  getDaysUntilExpiry,
  calculateRemainingUses,
  hasReachedUsageLimit,
  calculateUsagePercentage,
  canUseCoupon,
  isCouponAvailable,
  getCouponStatus,
  calculateDiscountAmount,
  meetsMinPurchaseAmount,
} from './couponUtils';
import { Coupon } from '../services/coupon/types';

function createDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function createMockCoupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: 'test-coupon-1',
    code: 'TEST2024',
    description: 'Test coupon',
    discountType: 'percentage',
    discountValue: 10,
    minPurchaseAmount: 0,
    maxDiscountAmount: 100,
    usageLimit: 100,
    usagePerUser: 1,
    usedCount: 0,
    startDate: createDateOffset(-30),
    expiryDate: createDateOffset(30),
    applicableProducts: [],
    applicableCategories: [],
    excludedProducts: [],
    isActive: true,
    isPublic: true,
    createdAt: createDateOffset(-30),
    updatedAt: createDateOffset(-30),
    isExpired: false,
    canUse: true,
    remainingUses: 100,
    ...overrides,
  };
}

describe('couponUtils', () => {
  describe('isExpired', () => {
    it('should return false for future date', () => {
      const futureDate = createDateOffset(10);
      expect(isExpired(futureDate)).toBe(false);
    });

    it('should return true for past date', () => {
      const pastDate = createDateOffset(-10);
      expect(isExpired(pastDate)).toBe(true);
    });

    it('should return false for current date', () => {
      const now = new Date().toISOString();
      expect(isExpired(now)).toBe(false);
    });
  });

  describe('isWithinValidDateRange', () => {
    it('should return true when current date is between start and expiry', () => {
      const startDate = createDateOffset(-10);
      const expiryDate = createDateOffset(10);
      expect(isWithinValidDateRange(startDate, expiryDate)).toBe(true);
    });

    it('should return false when current date is before start', () => {
      const startDate = createDateOffset(5);
      const expiryDate = createDateOffset(15);
      expect(isWithinValidDateRange(startDate, expiryDate)).toBe(false);
    });

    it('should return false when current date is after expiry', () => {
      const startDate = createDateOffset(-15);
      const expiryDate = createDateOffset(-5);
      expect(isWithinValidDateRange(startDate, expiryDate)).toBe(false);
    });
  });

  describe('isExpiringSoon', () => {
    it('should return true when expiring within default threshold (7 days)', () => {
      const expiryDate = createDateOffset(5);
      expect(isExpiringSoon(expiryDate, 7)).toBe(true);
    });

    it('should return false when expiring beyond default threshold', () => {
      const expiryDate = createDateOffset(10);
      expect(isExpiringSoon(expiryDate, 7)).toBe(false);
    });

    it('should return false when already expired', () => {
      const expiryDate = createDateOffset(-5);
      expect(isExpiringSoon(expiryDate, 7)).toBe(false);
    });

    it('should respect custom threshold', () => {
      const expiryDate = createDateOffset(5);
      expect(isExpiringSoon(expiryDate, 3)).toBe(false);
      expect(isExpiringSoon(expiryDate, 10)).toBe(true);
    });
  });

  describe('getDaysUntilExpiry', () => {
    it('should return positive number for future date', () => {
      const expiryDate = createDateOffset(10);
      const days = getDaysUntilExpiry(expiryDate);
      expect(days).toBeGreaterThan(9);
      expect(days).toBeLessThanOrEqual(11);
    });

    it('should return negative number for past date', () => {
      const expiryDate = createDateOffset(-10);
      const days = getDaysUntilExpiry(expiryDate);
      expect(days).toBeLessThan(0);
    });
  });

  describe('calculateRemainingUses', () => {
    it('should calculate correct remaining uses', () => {
      expect(calculateRemainingUses(100, 30)).toBe(70);
    });

    it('should return 0 when usage limit reached', () => {
      expect(calculateRemainingUses(100, 100)).toBe(0);
    });

    it('should return 0 when used count exceeds limit', () => {
      expect(calculateRemainingUses(100, 120)).toBe(0);
    });

    it('should return undefined when usageLimit is undefined', () => {
      expect(calculateRemainingUses(undefined, 50)).toBeUndefined();
    });

    it('should return undefined when usedCount is undefined', () => {
      expect(calculateRemainingUses(100, undefined)).toBeUndefined();
    });
  });

  describe('hasReachedUsageLimit', () => {
    it('should return true when limit reached', () => {
      expect(hasReachedUsageLimit(100, 100)).toBe(true);
    });

    it('should return true when exceeded', () => {
      expect(hasReachedUsageLimit(100, 120)).toBe(true);
    });

    it('should return false when below limit', () => {
      expect(hasReachedUsageLimit(100, 50)).toBe(false);
    });

    it('should return false when limits are undefined', () => {
      expect(hasReachedUsageLimit(undefined, 50)).toBe(false);
      expect(hasReachedUsageLimit(100, undefined)).toBe(false);
    });
  });

  describe('calculateUsagePercentage', () => {
    it('should calculate correct percentage', () => {
      expect(calculateUsagePercentage(100, 50)).toBe(50);
      expect(calculateUsagePercentage(100, 75)).toBe(75);
    });

    it('should return 100 for fully used coupons', () => {
      expect(calculateUsagePercentage(100, 100)).toBe(100);
    });

    it('should cap at 100 when exceeded', () => {
      expect(calculateUsagePercentage(100, 150)).toBe(100);
    });

    it('should return 0 for undefined values', () => {
      expect(calculateUsagePercentage(undefined, 50)).toBe(0);
      expect(calculateUsagePercentage(100, undefined)).toBe(0);
    });

    it('should return 0 when usageLimit is 0', () => {
      expect(calculateUsagePercentage(0, 0)).toBe(0);
    });
  });

  describe('canUseCoupon', () => {
    it('should return true for valid coupon', () => {
      const coupon = createMockCoupon({
        isActive: true,
        expiryDate: createDateOffset(30),
        usageLimit: 100,
        usedCount: 50,
      });
      expect(canUseCoupon(coupon)).toBe(true);
    });

    it('should return false for inactive coupon', () => {
      const coupon = createMockCoupon({ isActive: false });
      expect(canUseCoupon(coupon)).toBe(false);
    });

    it('should return false for expired coupon', () => {
      const coupon = createMockCoupon({
        expiryDate: createDateOffset(-10),
      });
      expect(canUseCoupon(coupon)).toBe(false);
    });

    it('should return false when usage limit reached', () => {
      const coupon = createMockCoupon({
        usageLimit: 100,
        usedCount: 100,
      });
      expect(canUseCoupon(coupon)).toBe(false);
    });

    it('should return true when usage limit is undefined', () => {
      const coupon = createMockCoupon({
        usageLimit: undefined,
        usedCount: undefined,
      });
      expect(canUseCoupon(coupon)).toBe(true);
    });
  });

  describe('isCouponAvailable', () => {
    it('should return true for active coupon within date range', () => {
      const coupon = createMockCoupon({
        isActive: true,
        startDate: createDateOffset(-10),
        expiryDate: createDateOffset(10),
      });
      expect(isCouponAvailable(coupon)).toBe(true);
    });

    it('should return false for inactive coupon', () => {
      const coupon = createMockCoupon({ isActive: false });
      expect(isCouponAvailable(coupon)).toBe(false);
    });

    it('should return false for coupon not yet started', () => {
      const coupon = createMockCoupon({
        startDate: createDateOffset(5),
        expiryDate: createDateOffset(15),
      });
      expect(isCouponAvailable(coupon)).toBe(false);
    });

    it('should return false for expired coupon', () => {
      const coupon = createMockCoupon({
        startDate: createDateOffset(-20),
        expiryDate: createDateOffset(-10),
      });
      expect(isCouponAvailable(coupon)).toBe(false);
    });
  });

  describe('getCouponStatus', () => {
    it('should return inactive status for inactive coupon', () => {
      const coupon = createMockCoupon({ isActive: false });
      const result = getCouponStatus(coupon);
      expect(result.status).toBe('inactive');
      expect(result.message).toBe('Coupon is inactive');
    });

    it('should return not_started status for future coupon', () => {
      const coupon = createMockCoupon({
        startDate: createDateOffset(5),
        expiryDate: createDateOffset(15),
      });
      const result = getCouponStatus(coupon);
      expect(result.status).toBe('not_started');
      expect(result.message).toBe('Coupon not yet active');
    });

    it('should return expired status for expired coupon', () => {
      const coupon = createMockCoupon({
        startDate: createDateOffset(-20),
        expiryDate: createDateOffset(-10),
      });
      const result = getCouponStatus(coupon);
      expect(result.status).toBe('expired');
      expect(result.message).toBe('Coupon has expired');
    });

    it('should return used_up status when usage limit reached', () => {
      const coupon = createMockCoupon({
        usageLimit: 100,
        usedCount: 100,
      });
      const result = getCouponStatus(coupon);
      expect(result.status).toBe('used_up');
      expect(result.message).toBe('Coupon usage limit reached');
    });

    it('should return active status for valid coupon', () => {
      const coupon = createMockCoupon({
        isActive: true,
        startDate: createDateOffset(-10),
        expiryDate: createDateOffset(10),
        usageLimit: 100,
        usedCount: 50,
      });
      const result = getCouponStatus(coupon);
      expect(result.status).toBe('active');
      expect(result.message).toBe('Coupon is active');
    });
  });

  describe('calculateDiscountAmount', () => {
    it('should calculate percentage discount correctly', () => {
      const coupon = createMockCoupon({
        discountType: 'percentage',
        discountValue: 20,
      });
      expect(calculateDiscountAmount(coupon, 100)).toBe(20);
      expect(calculateDiscountAmount(coupon, 50)).toBe(10);
    });

    it('should calculate fixed discount correctly', () => {
      const coupon = createMockCoupon({
        discountType: 'fixed',
        discountValue: 15,
      });
      expect(calculateDiscountAmount(coupon, 100)).toBe(15);
      expect(calculateDiscountAmount(coupon, 50)).toBe(15);
    });

    it('should apply max discount limit for percentage', () => {
      const coupon = createMockCoupon({
        discountType: 'percentage',
        discountValue: 50,
        maxDiscountAmount: 30,
      });
      expect(calculateDiscountAmount(coupon, 100)).toBe(30);
    });

    it('should not exceed cart total', () => {
      const coupon = createMockCoupon({
        discountType: 'fixed',
        discountValue: 150,
      });
      expect(calculateDiscountAmount(coupon, 100)).toBe(100);
    });

    it('should return 0 for free shipping type', () => {
      const coupon = createMockCoupon({
        discountType: 'freeShipping',
        discountValue: 0,
      });
      expect(calculateDiscountAmount(coupon, 100)).toBe(0);
    });
  });

  describe('meetsMinPurchaseAmount', () => {
    it('should return true when cart meets minimum', () => {
      const coupon = createMockCoupon({ minPurchaseAmount: 50 });
      expect(meetsMinPurchaseAmount(coupon, 100)).toBe(true);
      expect(meetsMinPurchaseAmount(coupon, 50)).toBe(true);
    });

    it('should return false when cart below minimum', () => {
      const coupon = createMockCoupon({ minPurchaseAmount: 50 });
      expect(meetsMinPurchaseAmount(coupon, 30)).toBe(false);
    });

    it('should return true when no minimum is set', () => {
      const coupon = createMockCoupon({ minPurchaseAmount: undefined });
      expect(meetsMinPurchaseAmount(coupon, 10)).toBe(true);
    });
  });
});
