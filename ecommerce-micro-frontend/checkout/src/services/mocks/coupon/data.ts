import { CouponResponse } from '../../coupon/types';

export const mockCoupons: CouponResponse[] = [
  {
    id: 'coupon-1',
    code: 'IPHONE20',
    description: '20% discount on IPhone X',
    discountType: 'percentage',
    discountValue: 20,
    minPurchaseAmount: 500,
    maxDiscountAmount: 150,
    usageLimit: 100,
    usagePerUser: 1,
    usedCount: 45,
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    applicableProducts: ['iphone-x'],
    applicableCategories: ['electronics'],
    excludedProducts: [],
    isActive: true,
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coupon-2',
    code: 'SAMSUNG50',
    description: 'Fixed discount $50',
    discountType: 'fixed',
    discountValue: 50,
    minPurchaseAmount: 200,
    usageLimit: 50,
    usagePerUser: 1,
    usedCount: 12,
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    applicableProducts: ['samsung-galaxy-s21'],
    applicableCategories: ['electronics'],
    excludedProducts: [],
    isActive: true,
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coupon-3',
    code: 'HUAWEI30',
    description: '30% off on Huawei P30',
    discountType: 'percentage',
    discountValue: 30,
    minPurchaseAmount: 300,
    usageLimit: 200,
    usagePerUser: 2,
    usedCount: 78,
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    applicableProducts: ['huawei-p30'],
    applicableCategories: ['electronics'],
    excludedProducts: [],
    isActive: true,
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function findCouponByCode(code: string): CouponResponse | undefined {
  return mockCoupons.find(
    (coupon) => coupon.code.toLowerCase() === code.toLowerCase()
  );
}

export function getCoupons(code?: string): CouponResponse[] {
  if (!code) return mockCoupons;
  return mockCoupons.filter((c) =>
    c.code.toLowerCase().includes(code.toLowerCase())
  );
}
