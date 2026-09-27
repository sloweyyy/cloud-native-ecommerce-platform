import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReactQueryOptions, ReactMutationOptions } from '../types';
import { ordersKeys } from './keys';
import { UpdateOrderInput } from './input';
import { env } from '../../config';
import * as ordersApi from './apis';
import type { Order } from './types';

/**
 * Hook to fetch orders filtered by userName
 *
 * @param userName - User name to filter orders (required)
 * @param options - React Query options (enabled, initialData, etc.)
 * @returns Query result with order list, loading state, and error
 *
 * @example
 * ```tsx
 * const { data: orders, isLoading, error } = useGetAllOrders('user123');
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 *
 * return <OrderList orders={orders} />;
 * ```
 */
export const useGetAllOrders = (
  userName: string,
  options?: ReactQueryOptions<Order[]> & { useMock?: boolean }
) => {
  const { enabled = true, initialData, useMock, ...rest } = options || {};

  const shouldUseMock = useMock ?? env.useMockData;

  // Only enable query if userName is provided and not empty
  const isEnabled = Boolean(enabled && userName && userName.trim().length > 0);

  return useQuery<Order[]>({
    ...rest,
    enabled: isEnabled,
    queryKey: [ordersKeys.all.create({ userName })],
    queryFn: async () => {
      if (!userName || userName.trim().length === 0) {
        throw new Error('userName is required');
      }
      const result = await ordersApi.getOrders({
        params: { userName, useMock: shouldUseMock },
      });
      return result?.data ?? [];
    },
    initialData: initialData as Order[] | undefined,
  });
};

/**
 * Hook to update an existing order
 *
 * @param options - Mutation options (onSuccess, onError)
 * @returns Mutation object with mutate function and state
 *
 * @example
 * ```tsx
 * const updateOrder = useUpdateOrder({
 *   onSuccess: (data) => {
 *     message.success('Order updated successfully');
 *   },
 *   onError: (error) => {
 *     message.error('Failed to update order');
 *   }
 * });
 *
 * updateOrder.mutate({
 *   payload: {
 *     id: 123,
 *     status: 'shipped'
 *   }
 * });
 * ```
 */
export const useUpdateOrder = (options?: ReactMutationOptions<Order | null, Error, UpdateOrderInput>) => {
  const queryClient = useQueryClient();

  return useMutation<Order | null, Error, UpdateOrderInput>({
    mutationFn: async (payload: UpdateOrderInput) => {
      const result = await ordersApi.updateOrder({ payload });
      return result?.data ?? null;
    },
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate relevant queries
      ordersKeys.all.invalidateQueries(queryClient);
      options?.onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      options?.onError?.(error, variables, context, mutation);
    },
  });
};

/**
 * Hook to delete an order
 *
 * @param options - Mutation options (onSuccess, onError)
 * @returns Mutation object with mutate function and state
 *
 * @example
 * ```tsx
 * const deleteOrder = useDeleteOrder({
 *   onSuccess: () => {
 *     message.success('Order deleted successfully');
 *   }
 * });
 *
 * deleteOrder.mutate({ params: { id: 123 } });
 * ```
 */
export const useDeleteOrder = (options?: ReactMutationOptions<boolean, Error, number>) => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, number>({
    mutationFn: async (id: number) => {
      const result = await ordersApi.deleteOrder({ params: { id } });
      return result?.data ?? true;
    },
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate relevant queries
      ordersKeys.all.invalidateQueries(queryClient);
      options?.onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      options?.onError?.(error, variables, context, mutation);
    },
  });
};
