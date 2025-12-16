import { createApiFactory } from '../factory/createApiFactory';
import {
  Request,
  RequestParamsRequired,
  RequestPayloadRequired,
} from '../types';
import {
  ListCouponsInput,
  GetUserCouponsInput,
  listCouponsInput,
  getUserCouponsInput,
} from './input';
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
} from './schemas';
import { couponMapper } from './mappers';
import type {
  GetCouponRequest,
  ValidateCouponRequest,
  ApplyCouponRequest,
  RemoveCouponRequest,
  ClaimCouponRequest,
  CreateCouponRequest,
  UpdateCouponRequest,
  DeleteCouponRequest,
  GetCouponAnalyticsRequest,
  BulkCreateCouponsRequest,
  Coupon,
  CouponValidationResult,
  UserCoupon,
  CouponAnalytics,
  BulkCreateResult,
} from './types';

export const apiFactory = createApiFactory('/coupons');

export async function listCoupons(request?: Request<ListCouponsInput>) {
  return apiFactory<Coupon[], Coupon[]>('GET', null, request, {
    transformer: couponMapper.toListDto,
    paramsSchema: listCouponsInput,
    useMock: request?.params?.useMock ?? false,
  });
}

export async function getCoupon(
  request: RequestParamsRequired<GetCouponRequest>
) {
  return apiFactory<Coupon, Coupon>('GET', `/${request.params.code}`, request, {
    transformer: couponMapper.toDto,
    paramsSchema: getCouponRequestSchema,
    useMock: request?.params?.useMock ?? false,
  });
}

export async function validateCoupon(
  request: RequestPayloadRequired<ValidateCouponRequest>
) {
  return apiFactory<CouponValidationResult, CouponValidationResult>(
    'POST',
    '/validate',
    request,
    {
      payloadSchema: validateCouponRequestSchema,
      useMock: request?.payload?.useMock ?? false,
    }
  );
}

export async function applyCoupon(
  request: RequestPayloadRequired<ApplyCouponRequest>
) {
  return apiFactory<Coupon, Coupon>('POST', '/apply', request, {
    transformer: couponMapper.toDto,
    payloadSchema: applyCouponRequestSchema,
    useMock: request?.payload?.useMock ?? false,
  });
}

export async function removeCoupon(
  request: RequestPayloadRequired<RemoveCouponRequest>
) {
  return apiFactory<void, void>('DELETE', '/remove', request, {
    payloadSchema: removeCouponRequestSchema,
    useMock: request?.payload?.useMock ?? false,
  });
}

export async function getUserCoupons(request: Request<GetUserCouponsInput>) {
  return apiFactory<UserCoupon[], UserCoupon[]>('GET', '/my-coupons', request, {
    paramsSchema: getUserCouponsInput,
    useMock: request?.params?.useMock ?? false,
  });
}

export async function claimCoupon(
  request: RequestPayloadRequired<ClaimCouponRequest>
) {
  return apiFactory<UserCoupon, UserCoupon>('POST', '/claim', request, {
    payloadSchema: claimCouponRequestSchema,
    useMock: request?.payload?.useMock ?? false,
  });
}

export async function createCoupon(
  request: RequestPayloadRequired<CreateCouponRequest>
) {
  return apiFactory<Coupon, Coupon>('POST', '/admin', request, {
    transformer: couponMapper.toDto,
    payloadSchema: createCouponRequestSchema,
    useMock: request?.payload?.useMock ?? false,
  });
}

export async function updateCoupon(
  request: RequestPayloadRequired<UpdateCouponRequest>
) {
  return apiFactory<Coupon, Coupon>(
    'PUT',
    `/admin/${request.payload.couponId}`,
    request,
    {
      transformer: couponMapper.toDto,
      payloadSchema: updateCouponRequestSchema,
      useMock: request?.payload?.useMock ?? false,
    }
  );
}

export async function deleteCoupon(
  request: RequestPayloadRequired<DeleteCouponRequest>
) {
  return apiFactory<void, void>(
    'DELETE',
    `/admin/${request.payload.couponId}`,
    request,
    {
      payloadSchema: deleteCouponRequestSchema,
      useMock: request?.payload?.useMock ?? false,
    }
  );
}

export async function getCouponAnalytics(
  request: RequestParamsRequired<GetCouponAnalyticsRequest>
) {
  return apiFactory<CouponAnalytics, CouponAnalytics>(
    'GET',
    `/admin/${request.params.couponId}/analytics`,
    request,
    {
      paramsSchema: getCouponAnalyticsRequestSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}

export async function bulkCreateCoupons(
  request: RequestPayloadRequired<BulkCreateCouponsRequest>
) {
  return apiFactory<BulkCreateResult, BulkCreateResult>(
    'POST',
    '/admin/bulk',
    request,
    {
      payloadSchema: bulkCreateCouponsRequestSchema,
      useMock: request?.payload?.useMock ?? false,
    }
  );
}
