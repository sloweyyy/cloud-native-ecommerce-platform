import {
  calculateCouponDiscount,
  calculateTotalDiscount,
  canApplyToProduct,
  calculateFinalPrice,
} from './couponCalculator';
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

describe('couponCalculator', () => {
  describe('calculateCouponDiscount', () => {
    it('should calculate percentage discount correctly', () => {
      const coupon = createMockCoupon({
        discountType: 'percentage',
        discountValue: 20,
      });

      const result = calculateCouponDiscount(coupon, 100);

      expect(result).toBe(20);
    });

    it('should calculate fixed amount discount correctly', () => {
      const coupon = createMockCoupon({
        discountType: 'fixed',
        discountValue: 15,
      });

      const result = calculateCouponDiscount(coupon, 100);

      expect(result).toBe(15);
    });

    it('should cap percentage discount at subtotal', () => {
      const coupon = createMockCoupon({
        discountType: 'percentage',
        discountValue: 150,
      });

      const result = calculateCouponDiscount(coupon, 100);

      expect(result).toBe(100);
    });

    it('should cap fixed amount discount at subtotal', () => {
      const coupon = createMockCoupon({
        discountType: 'fixed',
        discountValue: 150,
      });

      const result = calculateCouponDiscount(coupon, 100);

      expect(result).toBe(100);
    });

    it('should return 0 for free shipping discount', () => {
      const coupon = createMockCoupon({
        discountType: 'freeShipping',
        discountValue: 10,
      });

      const result = calculateCouponDiscount(coupon, 100);

      expect(result).toBe(0);
    });

    it('should handle zero subtotal', () => {
      const coupon = createMockCoupon({
        discountType: 'percentage',
        discountValue: 20,
      });

      const result = calculateCouponDiscount(coupon, 0);

      expect(result).toBe(0);
    });

    it('should handle negative subtotal', () => {
      const coupon = createMockCoupon({
        discountType: 'percentage',
        discountValue: 20,
      });

      const result = calculateCouponDiscount(coupon, -50);

      expect(result).toBe(0);
    });

    it('should respect maxDiscountAmount for percentage discount', () => {
      const coupon = createMockCoupon({
        discountType: 'percentage',
        discountValue: 50,
        maxDiscountAmount: 20,
      });

      const result = calculateCouponDiscount(coupon, 100);

      expect(result).toBe(20); // Capped at maxDiscountAmount
    });
  });

  describe('calculateTotalDiscount', () => {
    it('should calculate total from multiple coupons', () => {
      const coupons = [
        createMockCoupon({
          discountType: 'percentage',
          discountValue: 10,
        }),
        createMockCoupon({
          discountType: 'fixed',
          discountValue: 5,
        }),
      ];

      const result = calculateTotalDiscount(coupons, 100);

      expect(result).toBe(15); // 10% of 100 + 5 fixed
    });

    it('should return 0 for empty coupon list', () => {
      const result = calculateTotalDiscount([], 100);

      expect(result).toBe(0);
    });

    it('should not exceed subtotal', () => {
      const coupons = [
        createMockCoupon({
          discountType: 'fixed',
          discountValue: 80,
        }),
        createMockCoupon({
          discountType: 'fixed',
          discountValue: 50,
        }),
      ];

      const result = calculateTotalDiscount(coupons, 100);

      expect(result).toBe(100); // Capped at subtotal
    });
  });

  describe('canApplyToProduct', () => {
    it('should return true when no product restrictions', () => {
      const coupon = createMockCoupon({
        applicableProducts: undefined,
        excludedProducts: undefined,
      });

      const result = canApplyToProduct(coupon, ['product1', 'product2']);

      expect(result).toBe(true);
    });

    it('should return true when product is in applicable list', () => {
      const coupon = createMockCoupon({
        applicableProducts: ['product1', 'product2'],
        excludedProducts: [],
      });

      const result = canApplyToProduct(coupon, ['product1']);

      expect(result).toBe(true);
    });

    it('should return false when product is not in applicable list', () => {
      const coupon = createMockCoupon({
        applicableProducts: ['product1', 'product2'],
        excludedProducts: [],
      });

      const result = canApplyToProduct(coupon, ['product3']);

      expect(result).toBe(false);
    });

    it('should return false when product is in excluded list', () => {
      const coupon = createMockCoupon({
        applicableProducts: [],
        excludedProducts: ['product1', 'product2'],
      });

      const result = canApplyToProduct(coupon, ['product1']);

      expect(result).toBe(false);
    });

    it('should return true when product is not in excluded list', () => {
      const coupon = createMockCoupon({
        applicableProducts: undefined,
        excludedProducts: ['product1', 'product2'],
      });

      const result = canApplyToProduct(coupon, ['product3']);

      expect(result).toBe(true);
    });

    it('should handle empty cart', () => {
      const coupon = createMockCoupon({
        applicableProducts: ['product1'],
        excludedProducts: [],
      });

      const result = canApplyToProduct(coupon, []);

      expect(result).toBe(false);
    });

    it('should handle multiple products in cart with at least one match', () => {
      const coupon = createMockCoupon({
        applicableProducts: ['product1', 'product2'],
        excludedProducts: [],
      });

      const result = canApplyToProduct(coupon, ['product1', 'product3']);

      expect(result).toBe(true); // At least one product matches
    });
  });

  describe('calculateFinalPrice', () => {
    it('should calculate final price with discount', () => {
      const result = calculateFinalPrice(100, 20);

      expect(result).toBe(80);
    });

    it('should not allow negative final price', () => {
      const result = calculateFinalPrice(100, 150);

      expect(result).toBe(0);
    });

    it('should handle zero subtotal', () => {
      const result = calculateFinalPrice(0, 10);

      expect(result).toBe(0);
    });

    it('should handle zero discount', () => {
      const result = calculateFinalPrice(100, 0);

      expect(result).toBe(100);
    });

    it('should round to 2 decimal places', () => {
      const result = calculateFinalPrice(100.456, 20.123);

      expect(result).toBe(80.33);
    });
  });
});
