import { z } from 'zod';
import {
  getCouponRequestSchema,
  validateCouponRequestSchema,
  applyCouponRequestSchema,
  removeCouponRequestSchema,
  claimCouponRequestSchema,
  createCouponRequestSchema,
  updateCouponRequestSchema,
  deleteCouponRequestSchema,
  getCouponAnalyticsRequestSchema,
  bulkCreateCouponsRequestSchema,
  couponResponseSchema,
  couponSchema,
  couponValidationResultSchema,
  userCouponSchema,
  couponAnalyticsSchema,
  bulkCreateResultSchema,
} from './schemas';

export type GetCouponRequest = z.infer<typeof getCouponRequestSchema>;
export type ValidateCouponRequest = z.infer<typeof validateCouponRequestSchema>;
export type ApplyCouponRequest = z.infer<typeof applyCouponRequestSchema>;
export type RemoveCouponRequest = z.infer<typeof removeCouponRequestSchema>;
export type ClaimCouponRequest = z.infer<typeof claimCouponRequestSchema>;
export type CreateCouponRequest = z.infer<typeof createCouponRequestSchema>;
export type UpdateCouponRequest = z.infer<typeof updateCouponRequestSchema>;
export type DeleteCouponRequest = z.infer<typeof deleteCouponRequestSchema>;
export type GetCouponAnalyticsRequest = z.infer<
  typeof getCouponAnalyticsRequestSchema
>;
export type BulkCreateCouponsRequest = z.infer<
  typeof bulkCreateCouponsRequestSchema
>;

export type CouponResponse = z.infer<typeof couponResponseSchema>;
export type Coupon = z.infer<typeof couponSchema>;
export type CouponValidationResult = z.infer<
  typeof couponValidationResultSchema
>;
export type UserCoupon = z.infer<typeof userCouponSchema>;
export type CouponAnalytics = z.infer<typeof couponAnalyticsSchema>;
export type BulkCreateResult = z.infer<typeof bulkCreateResultSchema>;

export enum DiscountType {
  Percentage = 'percentage',
  Fixed = 'fixed',
  FreeShipping = 'freeShipping',
}

export enum CouponStatus {
  Available = 'available',
  Used = 'used',
  Expired = 'expired',
  All = 'all',
}
