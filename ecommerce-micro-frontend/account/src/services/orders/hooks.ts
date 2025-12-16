import { useQuery } from '@tanstack/react-query';
import { ReactQueryOptions } from '../types';
import * as apis from './apis';
import { orderKeys } from './keys';
import type { GetOrdersRequest, GetOrderByIdRequest, Order } from './types';

// ====================================
// QUERY HOOKS (READ OPERATIONS)
// ====================================

/**
 * Get orders for current user
 */
export function useGetOrders(
  input?: GetOrdersRequest,
  options?: ReactQueryOptions
) {
  const { enabled = true } = options || {};

  return useQuery<{ data: Order[] } | null>({
    queryKey: orderKeys.get.create(input),
    queryFn: async () => {
      const result = await apis.getOrders({
        params: input,
      });
      return result ?? null;
    },
    enabled: Boolean(enabled),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}

/**
 * Get order by ID
 */
export function useGetOrderById(
  input: GetOrderByIdRequest,
  options?: ReactQueryOptions
) {
  const { enabled = true } = options || {};

  return useQuery<{ data: Order } | null>({
    queryKey: orderKeys.getById.create(input),
    queryFn: async () => {
      const result = await apis.getOrderById({
        params: input,
      });
      return result ?? null;
    },
    enabled: Boolean(enabled && input.orderId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

