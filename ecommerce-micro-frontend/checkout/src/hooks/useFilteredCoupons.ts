import { useMemo } from 'react';
import { Coupon } from '../services/coupon/types';

export function useFilteredCoupons(
  coupons: Coupon[],
  searchTerm = ''
): Coupon[] {
  return useMemo(() => {
    if (!coupons || !Array.isArray(coupons)) {
      return [];
    }

    if (!searchTerm || searchTerm.trim() === '') {
      return coupons;
    }

    const search = searchTerm.toLowerCase();
    return coupons.filter(
      (coupon) =>
        coupon.code.toLowerCase().includes(search) ||
        coupon.description.toLowerCase().includes(search) ||
        coupon.id.toLowerCase().includes(search)
    );
  }, [coupons, searchTerm]);
}
