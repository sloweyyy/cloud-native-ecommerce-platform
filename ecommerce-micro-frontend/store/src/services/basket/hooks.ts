import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../../auth';
import * as apis from './apis';
import { basketKeys } from './keys';
import type { AddToCartRequest, Basket } from './types';

/**
 * Custom event name for cross-module cart updates
 */
export const CART_UPDATED_EVENT = 'ecommerce:cart:updated';

/**
 * Hook to add item to cart
 * 
 * Features:
 * - Calls real Basket API
 * - Invalidates basket cache on success
 * - Dispatches CustomEvent to notify other modules (e.g., host Navbar)
 */
export function useAddToCart() {
  const queryClient = useQueryClient();
  const userName = AuthService.getCurrentUsername();

  return useMutation<Basket, Error, AddToCartRequest>({
    mutationFn: apis.addToCart,
    onSuccess: (basket) => {
      // Invalidate basket cache
      queryClient.invalidateQueries({
        queryKey: basketKeys.detail(userName),
      });

      // Dispatch CustomEvent to notify other modules (e.g., host Navbar)
      // Using window.dispatchEvent for cross-module communication
      window.dispatchEvent(
        new CustomEvent(CART_UPDATED_EVENT, {
          detail: {
            itemCount: basket.itemCount,
            totalPrice: basket.totalPrice,
          },
        })
      );
    },
    onError: (error) => {
      console.error('[useAddToCart] Error:', error);
    },
  });
}

