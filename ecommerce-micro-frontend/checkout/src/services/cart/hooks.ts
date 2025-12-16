import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReactQueryOptions } from '../types';
import * as apis from './apis';
import { cartKeys } from './keys';
import type {
  GetCartRequest,
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveCartItemRequest,
  ClearCartRequest,
  CheckoutRequest,
  Cart,
} from './types';

/**
 * Custom event name for cross-module cart updates
 * Must match the event name in store/src/services/basket/index.ts
 */
const CART_UPDATED_EVENT = 'ecommerce:cart:updated';

// ====================================
// QUERY HOOKS (READ OPERATIONS)
// ====================================

/**
 * Get cart for current user
 * - Refetches on mount to ensure fresh data when navigating back
 * - Listens for CART_UPDATED_EVENT from store module to invalidate cache
 */
export function useGetCart(
  input?: GetCartRequest,
  options?: ReactQueryOptions
) {
  const { enabled = true } = options || {};
  const queryClient = useQueryClient();

  // Listen for cart updates from store module
  useEffect(() => {
    function handleCartUpdated() {
      console.log('[Checkout] Cart updated event received, refetching cart...');
      queryClient.refetchQueries({
        predicate: (query) => {
          const key = query.queryKey;
          // Cache keys: ['ecommerce-cache', '_cart', 'get', ...]
          return Array.isArray(key) && key[1] === '_cart';
        },
      });
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, [queryClient]);

  return useQuery<{ data: Cart } | null>({
    queryKey: cartKeys.get.create(input),
    queryFn: async () => {
      const result = await apis.getCart({
        params: input,
      });
      return result ?? null;
    },
    enabled: Boolean(enabled),
    staleTime: 30 * 1000, // 30 seconds - shorter to ensure fresher data
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

// ====================================
// MUTATION HOOKS (WRITE OPERATIONS)
// ====================================

/**
 * Refetch all cart-related queries and notify other modules
 * Cache key structure: ['ecommerce-cache', '_cart', ...]
 */
function refetchAllCartQueries(queryClient: ReturnType<typeof useQueryClient>) {
  // Refetch local cache immediately
  queryClient.refetchQueries({
    predicate: (query) => {
      const key = query.queryKey;
      // Cache keys: ['ecommerce-cache', '_cart', 'get', ...]
      return Array.isArray(key) && key[1] === '_cart';
    },
  });

  // Dispatch event to notify other modules (host's Navbar)
  console.log('[Checkout] Dispatching cart updated event...');
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
}

/**
 * Add item to cart
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation<{ data: Cart } | null, Error, AddToCartRequest>({
    mutationFn: async (input) => {
      const result = await apis.addToCart({
        payload: input,
      });
      return result ?? null;
    },
    onSuccess: () => {
      refetchAllCartQueries(queryClient);
    },
  });
}

/**
 * Update cart item quantity
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation<{ data: Cart } | null, Error, UpdateCartItemRequest>({
    mutationFn: async (input) => {
      const result = await apis.updateCartItem({
        payload: input,
      });
      return result ?? null;
    },
    onSuccess: () => {
      refetchAllCartQueries(queryClient);
    },
  });
}

/**
 * Remove item from cart
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation<{ data: Cart } | null, Error, RemoveCartItemRequest>({
    mutationFn: async (input) => {
      const result = await apis.removeCartItem({
        payload: input,
      });
      return result ?? null;
    },
    onSuccess: () => {
      refetchAllCartQueries(queryClient);
    },
  });
}

/**
 * Clear entire cart
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation<{ data: Cart } | null, Error, ClearCartRequest | void>({
    mutationFn: async (input) => {
      const result = await apis.clearCart({
        payload: input || {},
      });
      return result ?? null;
    },
    onSuccess: () => {
      refetchAllCartQueries(queryClient);
    },
  });
}

/**
 * Checkout cart (creates order)
 */
export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; orderId?: number },
    Error,
    CheckoutRequest
  >({
    mutationFn: async (input) => {
      return apis.checkout({
        payload: input,
      });
    },
    onSuccess: () => {
      // Clear cart cache after checkout
      refetchAllCartQueries(queryClient);
    },
  });
}

// ====================================
// DEPRECATED - Keep for backward compatibility
// ====================================

/** @deprecated Use useCheckout instead */
export function useApplyShipping() {
  const queryClient = useQueryClient();

  return useMutation<{ data: Cart } | null, Error, unknown>({
    mutationFn: async () => {
      console.warn('useApplyShipping is deprecated, use useCheckout instead');
      const result = await apis.getCart();
      return result ?? null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [cartKeys.all],
      });
    },
  });
}
