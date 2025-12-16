import { z } from 'zod';

export const getCouponRequestSchema = z.object({
  code: z.string().min(1).max(50),
  useMock: z.boolean().optional(),
});

export const validateCouponRequestSchema = z.object({
  code: z.string().min(1).max(50),
  userId: z.string(),
  cartTotal: z.number().min(0),
  productIds: z.array(z.string()).optional(),
  useMock: z.boolean().optional(),
});

export const applyCouponRequestSchema = z.object({
  code: z.string().min(1).max(50),
  userId: z.string(),
  orderId: z.string().optional(),
  cartId: z.string(),
  cartTotal: z.number().min(0),
  productIds: z.array(z.string()),
  useMock: z.boolean().optional(),
});

export const removeCouponRequestSchema = z.object({
  cartId: z.string(),
  couponId: z.string(),
  useMock: z.boolean().optional(),
});

export const claimCouponRequestSchema = z.object({
  couponId: z.string(),
  userId: z.string(),
  useMock: z.boolean().optional(),
});

export const createCouponRequestSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9_-]+$/),
  description: z.string().min(1).max(500),
  discountType: z.enum(['percentage', 'fixed', 'freeShipping']),
  discountValue: z.number().min(0),
  minPurchaseAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  usagePerUser: z.number().min(1).optional(),
  startDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  excludedProducts: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  useMock: z.boolean().optional(),
});

export const updateCouponRequestSchema = z.object({
  couponId: z.string(),
  description: z.string().min(1).max(500).optional(),
  discountValue: z.number().min(0).optional(),
  minPurchaseAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  usagePerUser: z.number().min(1).optional(),
  expiryDate: z.string().datetime().optional(),
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  useMock: z.boolean().optional(),
});

export const deleteCouponRequestSchema = z.object({
  couponId: z.string(),
  softDelete: z.boolean().default(true),
  useMock: z.boolean().optional(),
});

export const getCouponAnalyticsRequestSchema = z.object({
  couponId: z.string(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  useMock: z.boolean().optional(),
});

export const bulkCreateCouponsRequestSchema = z.object({
  template: z.object({
    prefix: z.string().min(1).max(20),
    description: z.string().min(1).max(500),
    discountType: z.enum(['percentage', 'fixed', 'freeShipping']),
    discountValue: z.number().min(0),
    minPurchaseAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).optional(),
    usageLimit: z.number().min(1).optional(),
    usagePerUser: z.number().min(1).optional(),
    startDate: z.string().datetime(),
    expiryDate: z.string().datetime(),
    isActive: z.boolean().default(true),
  }),
  quantity: z.number().min(1).max(10000),
  useMock: z.boolean().optional(),
});

export const couponResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string(),
  discountType: z.enum(['percentage', 'fixed', 'freeShipping']),
  discountValue: z.number(),
  minPurchaseAmount: z.number().optional(),
  maxDiscountAmount: z.number().optional(),
  usageLimit: z.number().optional(),
  usagePerUser: z.number().optional(),
  usedCount: z.number(),
  startDate: z.string(),
  expiryDate: z.string(),
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  excludedProducts: z.array(z.string()).optional(),
  isActive: z.boolean(),
  isPublic: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const couponSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string(),
  discountType: z.enum(['percentage', 'fixed', 'freeShipping']),
  discountValue: z.number(),
  minPurchaseAmount: z.number().optional(),
  maxDiscountAmount: z.number().optional(),
  usageLimit: z.number().optional(),
  usagePerUser: z.number().optional(),
  usedCount: z.number(),
  startDate: z.string(),
  expiryDate: z.string(),
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  excludedProducts: z.array(z.string()).optional(),
  isActive: z.boolean(),
  isPublic: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isExpired: z.boolean().optional(),
  canUse: z.boolean().optional(),
  remainingUses: z.number().optional(),
});

export const couponValidationResultSchema = z.object({
  isValid: z.boolean(),
  coupon: couponSchema.nullable(),
  discountAmount: z.number(),
  finalAmount: z.number(),
  reason: z.string().optional(),
  errors: z.array(z.string()).optional(),
});

export const userCouponSchema = z.object({
  id: z.string(),
  userId: z.string(),
  couponId: z.string(),
  coupon: couponSchema,
  status: z.enum(['available', 'used', 'expired']),
  usedAt: z.string().nullable(),
  claimedAt: z.string(),
  expiresAt: z.string(),
});

export const couponAnalyticsSchema = z.object({
  couponId: z.string(),
  totalUses: z.number(),
  totalRevenue: z.number(),
  totalDiscount: z.number(),
  uniqueUsers: z.number(),
  conversionRate: z.number(),
  averageOrderValue: z.number(),
  usageByDate: z.array(
    z.object({
      date: z.string(),
      uses: z.number(),
      revenue: z.number(),
    })
  ),
  topProducts: z
    .array(
      z.object({
        productId: z.string(),
        productName: z.string(),
        uses: z.number(),
      })
    )
    .optional(),
});

export const bulkCreateResultSchema = z.object({
  success: z.boolean(),
  created: z.number(),
  failed: z.number(),
  coupons: z.array(couponSchema),
  errors: z
    .array(
      z.object({
        code: z.string(),
        reason: z.string(),
      })
    )
    .optional(),
});
