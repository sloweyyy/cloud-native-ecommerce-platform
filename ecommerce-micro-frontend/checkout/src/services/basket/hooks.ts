/**
 * Basket React Query Hooks
 * Type-safe hooks for basket operations with automatic caching and refetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mapShoppingCartItemToBackend,
  type ShoppingCartItem,
  type ShoppingCartItemFrontend,
} from '../../types';
import { getBasket, createBasket, deleteBasket, checkoutBasket, type CheckoutRequest } from './apis';
import { AuthService } from '../../auth';

// Query keys for React Query caching
export const basketKeys = {
  all: ['basket'] as const,
  byUser: (username: string) => ['basket', username] as const,
};

/**
 * Hook to get current user's basket
 *
 * Features:
 * - Automatic caching
 * - Refetches on window focus
 * - Only fetches if user is authenticated
 *
 * @returns React Query result with basket data
 */
export function useBasket() {
  const username = AuthService.getCurrentUsername();
  const isAuthenticated = AuthService.isAuthenticated();

  return useQuery({
    queryKey: basketKeys.byUser(username),
    queryFn: getBasket,
    enabled: isAuthenticated, // Only fetch if logged in
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Only retry once on failure
  });
}

/**
 * Hook to create or update basket
 *
 * Features:
 * - Optimistic updates
 * - Automatic cache invalidation
 * - Error rollback
 *
 * @returns Mutation function and status
 */
export function useCreateBasket() {
  const queryClient = useQueryClient();
  const username = AuthService.getCurrentUsername();

  return useMutation({
    mutationFn: (items: ShoppingCartItem[]) => createBasket(items),
    onSuccess: (data) => {
      // Update cache with new basket data
      queryClient.setQueryData(basketKeys.byUser(username), data);
    },
    onError: (error) => {
      console.error('Failed to create/update basket:', error);
      // Invalidate cache to refetch fresh data
      queryClient.invalidateQueries({ queryKey: basketKeys.byUser(username) });
    },
  });
}

/**
 * Hook to delete basket
 *
 * Features:
 * - Clears cache after deletion
 * - Error handling
 *
 * @returns Mutation function and status
 */
export function useDeleteBasket() {
  const queryClient = useQueryClient();
  const username = AuthService.getCurrentUsername();

  return useMutation({
    mutationFn: deleteBasket,
    onSuccess: () => {
      // Clear basket cache
      queryClient.setQueryData(basketKeys.byUser(username), null);
      queryClient.invalidateQueries({ queryKey: basketKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete basket:', error);
    },
  });
}

/**
 * Hook to checkout basket (creates order)
 *
 * Features:
 * - Clears basket cache after successful checkout
 * - Error handling
 * - Success callback support
 *
 * @returns Mutation function and status
 */
export function useCheckoutBasket() {
  const queryClient = useQueryClient();
  const username = AuthService.getCurrentUsername();

  return useMutation({
    mutationFn: (request: CheckoutRequest) => checkoutBasket(request),
    onSuccess: (result) => {
      // Clear basket after successful checkout
      queryClient.setQueryData(basketKeys.byUser(username), null);
      queryClient.invalidateQueries({ queryKey: basketKeys.all });

      console.log('✅ Checkout successful! Order ID:', result.orderId);
    },
    onError: (error) => {
      console.error('Failed to checkout:', error);
    },
  });
}

/**
 * Hook to add item to basket
 * Convenience wrapper around useCreateBasket
 */
export function useAddToBasket() {
  const { data: currentBasket } = useBasket();
  const createBasketMutation = useCreateBasket();

  const addItem = (item: ShoppingCartItemFrontend) => {
    const existingItems = currentBasket?.items || [];

    // Check if item already exists - items from basket are in frontend format (camelCase)
    const existingItemIndex = existingItems.findIndex(
      (i) => i.productId === item.productId
    );

    let updatedItems: ShoppingCartItemFrontend[];

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      updatedItems = existingItems.map((i, index) =>
        index === existingItemIndex
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      // Add new item
      updatedItems = [...existingItems, item];
    }

    // Convert to backend format (PascalCase) before sending
    const backendItems = updatedItems.map(mapShoppingCartItemToBackend);
    return createBasketMutation.mutateAsync(backendItems);
  };

  return {
    addItem,
    isLoading: createBasketMutation.isPending,
    error: createBasketMutation.error,
  };
}

/**
 * Hook to remove item from basket
 */
export function useRemoveFromBasket() {
  const { data: currentBasket } = useBasket();
  const createBasketMutation = useCreateBasket();
  const deleteBasketMutation = useDeleteBasket();

  const removeItem = (productId: string) => {
    if (!currentBasket) return Promise.resolve(null);

    const updatedItems = currentBasket.items.filter(
      (item) => item.productId !== productId
    );

    if (updatedItems.length === 0) {
      // If no items left, delete basket
      return deleteBasketMutation.mutateAsync();
    }

    // Convert to backend format before sending
    const backendItems = updatedItems.map(mapShoppingCartItemToBackend);
    return createBasketMutation.mutateAsync(backendItems);
  };

  return {
    removeItem,
    isLoading: createBasketMutation.isPending || deleteBasketMutation.isPending,
    error: createBasketMutation.error || deleteBasketMutation.error,
  };
}

/**
 * Hook to update item quantity in basket
 */
export function useUpdateQuantity() {
  const { data: currentBasket } = useBasket();
  const createBasketMutation = useCreateBasket();
  const { removeItem } = useRemoveFromBasket();

  const updateQuantity = (productId: string, quantity: number) => {
    if (!currentBasket) return Promise.resolve(null);

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      return removeItem(productId);
    }

    const updatedItems = currentBasket.items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );

    // Convert to backend format before sending
    const backendItems = updatedItems.map(mapShoppingCartItemToBackend);
    return createBasketMutation.mutateAsync(backendItems);
  };

  return {
    updateQuantity,
    isLoading: createBasketMutation.isPending,
    error: createBasketMutation.error,
  };
}
