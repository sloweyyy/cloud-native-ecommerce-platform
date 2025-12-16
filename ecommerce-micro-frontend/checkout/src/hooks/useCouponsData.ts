import { Coupon } from '../services/coupon/types';

/**
 * Custom hook to manage coupons data state with discriminated union
 * Simplified for basic coupon structure
 */

type CouponsDataSuccess = {
  state: 'success';
  data: Coupon[];
};

type CouponsDataLoading = {
  state: 'loading';
};

type CouponsDataError = {
  state: 'error';
  message: string;
};

type CouponsDataEmpty = {
  state: 'empty';
};

export type CouponsDataState = CouponsDataSuccess | CouponsDataLoading | CouponsDataError | CouponsDataEmpty;

export function useCouponsData(
  data: Coupon[] | undefined,
  isLoading: boolean,
  error: Error | null | unknown
): CouponsDataState {
  if (isLoading) {
    return { state: 'loading' };
  }

  if (error) {
    return {
      state: 'error',
      message: error instanceof Error ? error.message : 'An error occurred',
    };
  }

  if (!data || data.length === 0) {
    return { state: 'empty' };
  }

  return {
    state: 'success',
    data,
  };
}
