import {
  isExpired,
  hasReachedUsageLimit,
  meetsMinPurchase,
  isUserEligible,
  hasProductRestrictions,
  canStack,
} from './couponValidator';
import { Coupon } from '../services/coupon/types';

const createMockCoupon = (overrides: Partial<Coupon> = {}): Coupon => ({
  id: 'test-coupon',
  code: 'TEST2024',
  discountType: 'percentage',
  discountValue: 20,
  description: 'Test coupon',
  startDate: new Date('2024-01-01').toISOString(),
  expiryDate: new Date('2025-12-31').toISOString(),
  usageLimit: 100,
  usedCount: 0,
  minPurchaseAmount: 0,
  isActive: true,
  isPublic: true,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  ...overrides,
});

describe('couponValidator', () => {
  describe('isExpired', () => {
    it('should return false for valid coupon with future expiry', () => {
      const coupon = createMockCoupon({
        expiryDate: new Date('2025-12-31').toISOString(),
      });

      const result = isExpired(coupon);

      expect(result).toBe(false);
    });

    it('should return true for expired coupon', () => {
      const coupon = createMockCoupon({
        expiryDate: new Date('2020-12-31').toISOString(),
      });

      const result = isExpired(coupon);

      expect(result).toBe(true);
    });

    it('should handle edge case of current date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const coupon = createMockCoupon({
        expiryDate: futureDate.toISOString(),
      });

      const result = isExpired(coupon);

      expect(result).toBe(false);
    });
  });

  describe('hasReachedUsageLimit', () => {
    it('should return false when usage is below limit', () => {
      const coupon = createMockCoupon({
        usageLimit: 100,
        usedCount: 50,
      });

      const result = hasReachedUsageLimit(coupon);

      expect(result).toBe(false);
    });

    it('should return true when usage equals limit', () => {
      const coupon = createMockCoupon({
        usageLimit: 100,
        usedCount: 100,
      });

      const result = hasReachedUsageLimit(coupon);

      expect(result).toBe(true);
    });

    it('should return true when usage exceeds limit', () => {
      const coupon = createMockCoupon({
        usageLimit: 100,
        usedCount: 150,
      });

      const result = hasReachedUsageLimit(coupon);

      expect(result).toBe(true);
    });

    it('should return false when usage limit is not set', () => {
      const coupon = createMockCoupon({
        usageLimit: undefined,
        usedCount: 1000,
      });

      const result = hasReachedUsageLimit(coupon);

      expect(result).toBe(false);
    });
  });

  describe('meetsMinPurchase', () => {
    it('should return true when subtotal meets minimum', () => {
      const coupon = createMockCoupon({
        minPurchaseAmount: 50,
      });

      const result = meetsMinPurchase(coupon, 50);

      expect(result).toBe(true);
    });

    it('should return true when subtotal exceeds minimum', () => {
      const coupon = createMockCoupon({
        minPurchaseAmount: 50,
      });

      const result = meetsMinPurchase(coupon, 100);

      expect(result).toBe(true);
    });

    it('should return false when subtotal is below minimum', () => {
      const coupon = createMockCoupon({
        minPurchaseAmount: 50,
      });

      const result = meetsMinPurchase(coupon, 30);

      expect(result).toBe(false);
    });

    it('should return true when no minimum is set', () => {
      const coupon = createMockCoupon({
        minPurchaseAmount: undefined,
      });

      const result = meetsMinPurchase(coupon, 10);

      expect(result).toBe(true);
    });

    it('should return true when minimum is zero', () => {
      const coupon = createMockCoupon({
        minPurchaseAmount: 0,
      });

      const result = meetsMinPurchase(coupon, 0);

      expect(result).toBe(true);
    });
  });

  describe('isUserEligible', () => {
    // Current implementation always returns true
    it('should return true for any user', () => {
      const coupon = createMockCoupon();

      const result = isUserEligible(coupon, 'user123');

      expect(result).toBe(true);
    });

    it('should return true when no userId provided', () => {
      const coupon = createMockCoupon();

      const result = isUserEligible(coupon, undefined);

      expect(result).toBe(true);
    });
  });

  describe('hasProductRestrictions', () => {
    it('should return false when no restrictions', () => {
      const coupon = createMockCoupon({
        applicableProducts: undefined,
        excludedProducts: undefined,
      });

      const result = hasProductRestrictions(coupon);

      expect(result).toBe(false);
    });

    it('should return true when applicable products exist', () => {
      const coupon = createMockCoupon({
        applicableProducts: ['product1'],
        excludedProducts: [],
      });

      const result = hasProductRestrictions(coupon);

      expect(result).toBe(true);
    });

    it('should return true when excluded products exist', () => {
      const coupon = createMockCoupon({
        applicableProducts: [],
        excludedProducts: ['product1'],
      });

      const result = hasProductRestrictions(coupon);

      expect(result).toBe(true);
    });

    it('should return false when restriction arrays are empty', () => {
      const coupon = createMockCoupon({
        applicableProducts: [],
        excludedProducts: [],
      });

      const result = hasProductRestrictions(coupon);

      expect(result).toBe(false);
    });
  });

  describe('canStack', () => {
    // Current implementation always returns true
    it('should return true for any coupon', () => {
      const coupon = createMockCoupon();

      const result = canStack(coupon);

      expect(result).toBe(true);
    });
  });
});
