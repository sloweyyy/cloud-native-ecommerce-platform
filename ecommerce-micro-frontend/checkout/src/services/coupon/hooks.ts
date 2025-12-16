import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse, ReactQueryOptions } from '../types';
import * as apis from './apis';
import { couponKeys } from './keys';
import type { ListCouponsInput, GetUserCouponsInput } from './input';
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

export function useListCoupons(
  input?: ListCouponsInput,
  options?: ReactQueryOptions
) {
  const { enabled = true } = options || {};
  return useQuery<ApiResponse<Coupon[]> | null>({
    queryKey: couponKeys.list.create(input),
    queryFn: async () => {
      const result = await apis.listCoupons({
        params: { ...input, useMock: true },
      });
      return result ?? null;
    },
    enabled: Boolean(enabled),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGetCoupon(
  input: GetCouponRequest,
  options?: ReactQueryOptions
) {
  const { enabled = true } = options || {};
  return useQuery<ApiResponse<Coupon> | null>({
    queryKey: couponKeys.get.create(input),
    queryFn: async () => {
      const result = await apis.getCoupon({
        params: { ...input, useMock: true },
      });
      return result ?? null;
    },
    enabled: Boolean(enabled && input.code),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetUserCoupons(
  input: GetUserCouponsInput,
  options?: ReactQueryOptions
) {
  const { enabled = true } = options || {};
  return useQuery<ApiResponse<UserCoupon[]> | null>({
    queryKey: couponKeys.userCoupons.create(input),
    queryFn: async () => {
      const result = await apis.getUserCoupons({
        params: { ...input, useMock: true },
      });
      return result ?? null;
    },
    enabled: Boolean(enabled && input.userId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useGetCouponAnalytics(
  input: GetCouponAnalyticsRequest,
  options?: ReactQueryOptions
) {
  const { enabled = true } = options || {};
  return useQuery<ApiResponse<CouponAnalytics> | null>({
    queryKey: couponKeys.analytics.create(input),
    queryFn: async () => {
      const result = await apis.getCouponAnalytics({
        params: { ...input, useMock: true },
      });
      return result ?? null;
    },
    enabled: Boolean(enabled && input.couponId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useValidateCoupon() {
  return useMutation<
    ApiResponse<CouponValidationResult> | null,
    Error,
    ValidateCouponRequest
  >({
    mutationFn: async (input) => {
      const result = await apis.validateCoupon({
        payload: { ...input, useMock: true },
      });
      return result ?? null;
    },
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Coupon> | null, Error, ApplyCouponRequest>({
    mutationFn: async (input) => {
      const result = await apis.applyCoupon({
        payload: { ...input, useMock: true },
      });
      return result ?? null;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: couponKeys.userCoupons.create({ userId: variables.userId }),
      });
      if (data?.data) {
        queryClient.invalidateQueries({
          queryKey: couponKeys.get.create({ code: variables.code }),
        });
      }
    },
  });
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RemoveCouponRequest>({
    mutationFn: async (input) => {
      await apis.removeCoupon({
        payload: { ...input, useMock: true },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [couponKeys.all],
      });
    },
  });
}

export function useClaimCoupon() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<UserCoupon> | null, Error, ClaimCouponRequest>(
    {
      mutationFn: async (input) => {
        const result = await apis.claimCoupon({
          payload: { ...input, useMock: true },
        });
        return result ?? null;
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: couponKeys.userCoupons.create({ userId: variables.userId }),
        });
      },
    }
  );
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Coupon> | null, Error, CreateCouponRequest>({
    mutationFn: async (input) => {
      const result = await apis.createCoupon({
        payload: { ...input, useMock: true },
      });
      return result ?? null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [couponKeys.all],
      });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Coupon> | null, Error, UpdateCouponRequest>({
    mutationFn: async (input) => {
      const result = await apis.updateCoupon({
        payload: { ...input, useMock: true },
      });
      return result ?? null;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [couponKeys.all],
      });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteCouponRequest>({
    mutationFn: async (input) => {
      await apis.deleteCoupon({
        payload: { ...input, useMock: true },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [couponKeys.all],
      });
    },
  });
}

export function useBulkCreateCoupons() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<BulkCreateResult> | null,
    Error,
    BulkCreateCouponsRequest
  >({
    mutationFn: async (input) => {
      const result = await apis.bulkCreateCoupons({
        payload: { ...input, useMock: true },
      });
      return result ?? null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [couponKeys.all],
      });
    },
  });
}
