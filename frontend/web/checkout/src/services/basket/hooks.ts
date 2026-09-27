import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { checkoutClient } from '../index';
import {
  AddToCartInput,
  UpdateBasketItemInput,
  RemoveBasketItemInput,
  CheckoutInput,
} from './input';
import { FilterOptions } from '../types';
import { basketKeys } from './keys';
import type { Basket } from './schemas';

export const CART_UPDATED_EVENT = 'ecommerce:cart:updated';

function getUserName(user: ReturnType<typeof useAuth>['user']): string | null {
  if (!user) {
    return null;
  }
  return user.email || user.displayName || user.id || null;
}

function updateBasketCache(
  queryClient: ReturnType<typeof useQueryClient>,
  newBasketData: Basket | null,
  userName: string
) {
  if (newBasketData) {
    queryClient.setQueryData(basketKeys.getBasket.create({ userName }), {
      data: newBasketData,
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: basketKeys.getBasket.create({ userName }),
    });
  }

  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
}

export function useGetBasket() {
  const { user, isLoading: authLoading } = useAuth();
  const userName = getUserName(user);

  return useQuery<{ data: Basket } | null>({
    queryKey: basketKeys.getBasket.create({ userName: userName || 'guest' }),
    queryFn: async () => {
      if (!userName) {
        throw new Error('User must be authenticated to access basket');
      }
      const response = await checkoutClient.basket.getBasket({
        params: { userName },
      });
      const basketData = response as Basket | undefined;
      return basketData ? { data: basketData } : null;
    },
    enabled: !authLoading && !!userName,
    staleTime: 30 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

type AddToCartPayload = {
  productId: string;
  productName: string;
  price: number;
  originalPrice: number;
  quantity: number;
  imageFile: string | null;
};

export function useAddToCart(input?: FilterOptions<AddToCartInput>) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationKey: [basketKeys.addToCart.create(input)],
    mutationFn: (payload: AddToCartPayload) => {
      const userName = getUserName(user);
      if (!userName) {
        throw new Error('User must be authenticated to add items to cart');
      }

      const command: AddToCartInput = {
        UserName: userName,
        Items: [
          {
            Quantity: payload.quantity,
            Price: payload.price,
            OriginalPrice: payload.originalPrice,
            DiscountAmount: payload.originalPrice - payload.price,
            ProductId: payload.productId,
            ImageFile: payload.imageFile || undefined,
            ProductName: payload.productName,
          },
        ],
      };

      return checkoutClient.basket.addToCart({
        payload: command,
      });
    },
    onSuccess: (response) => {
      const data = (response as Basket | undefined) ?? null;
      const userName = data?.userName || getUserName(user);
      if (!userName) {
        return;
      }

      updateBasketCache(queryClient, data, userName);
    },
  });
}

export function useUpdateBasketItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: UpdateBasketItemInput) => {
      const userName = getUserName(user);
      if (!userName) {
        throw new Error('User must be authenticated to update basket');
      }
      const basketKey = basketKeys.getBasket.create({ userName });
      let cachedBasket = queryClient.getQueryData<{ data: Basket } | null>(
        basketKey
      );

      if (!cachedBasket?.data) {
        try {
          const response = await checkoutClient.basket.getBasket({
            params: { userName },
          });
          const basketData = response as Basket | undefined;
          if (basketData) {
            cachedBasket = { data: basketData };
            queryClient.setQueryData(basketKey, cachedBasket);
          }
        } catch {
          cachedBasket = null;
        }
      }

      return checkoutClient.basket.updateBasketItem({
        payload: { ...input, userName },
        currentBasket: cachedBasket?.data ?? null,
      });
    },
    onMutate: async (input) => {
      const userName = getUserName(user);
      if (!userName) {
        return { previousBasket: null };
      }
      const basketKey = basketKeys.getBasket.create({ userName });
      await queryClient.cancelQueries({ queryKey: basketKey });

      const previousBasket = queryClient.getQueryData<{ data: Basket } | null>(
        basketKey
      );

      if (previousBasket?.data) {
        const updatedItems = previousBasket.data.items.map((item) =>
          item.productId === input.productId
            ? { ...item, quantity: input.quantity }
            : item
        );

        const updatedBasket: Basket = {
          ...previousBasket.data,
          items: updatedItems,
          totalPrice: updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
          itemCount: updatedItems.length,
          isEmpty: updatedItems.length === 0,
        };

        queryClient.setQueryData(basketKey, { data: updatedBasket });
      }

      return { previousBasket };
    },
    onError: (err, input, context) => {
      const userName = getUserName(user);
      if (!userName || !context?.previousBasket) {
        return;
      }
      const basketKey = basketKeys.getBasket.create({ userName });
      queryClient.setQueryData(basketKey, context.previousBasket);
    },
    onSettled: (response, error, input) => {
      // Sync cache with server response after mutation completes (success or error)
      // Only update if mutation succeeded and data is different from optimistic update
      if (!error && response) {
        const responseData = response as { data: Basket } | null;
        const data = responseData?.data ?? null;
        if (data) {
          const userName = data.userName || getUserName(user);
          if (!userName) {
            return;
          }
          const basketKey = basketKeys.getBasket.create({ userName });
          const currentCache = queryClient.getQueryData<{
            data: Basket;
          } | null>(basketKey);

          // Only update if data is actually different from optimistic update
          if (
            !currentCache?.data ||
            JSON.stringify(currentCache.data.items) !==
              JSON.stringify(data.items)
          ) {
            queryClient.setQueryData(basketKey, { data });
          }
        }
      }
    },
  });
}

export function useRemoveBasketItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: RemoveBasketItemInput) => {
      const userName = getUserName(user);
      if (!userName) {
        throw new Error(
          'User must be authenticated to remove items from basket'
        );
      }
      const basketKey = basketKeys.getBasket.create({ userName });
      let cachedBasket = queryClient.getQueryData<{ data: Basket } | null>(
        basketKey
      );

      if (!cachedBasket?.data) {
        try {
          const response = await checkoutClient.basket.getBasket({
            params: { userName },
          });
          const basketData = response as Basket | undefined;
          if (basketData) {
            cachedBasket = { data: basketData };
            queryClient.setQueryData(basketKey, cachedBasket);
          }
        } catch {
          cachedBasket = null;
        }
      }

      return checkoutClient.basket.removeBasketItem({
        payload: { ...input, userName },
        currentBasket: cachedBasket?.data ?? null,
      });
    },
    onMutate: async (input) => {
      const userName = getUserName(user);
      if (!userName) {
        return { previousBasket: null };
      }
      const basketKey = basketKeys.getBasket.create({ userName });
      await queryClient.cancelQueries({ queryKey: basketKey });

      const previousBasket = queryClient.getQueryData<{ data: Basket } | null>(
        basketKey
      );

      if (previousBasket?.data) {
        const updatedItems = previousBasket.data.items.filter(
          (item) => item.productId !== input.productId
        );

        const updatedBasket: Basket = {
          ...previousBasket.data,
          items: updatedItems,
          totalPrice: updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
          itemCount: updatedItems.length,
          isEmpty: updatedItems.length === 0,
        };

        queryClient.setQueryData(basketKey, { data: updatedBasket });
      }

      return { previousBasket };
    },
    onError: (err, input, context) => {
      const userName = getUserName(user);
      if (!userName || !context?.previousBasket) {
        return;
      }
      const basketKey = basketKeys.getBasket.create({ userName });
      queryClient.setQueryData(basketKey, context.previousBasket);
    },
    onSettled: (response, error, input) => {
      // Sync cache with server response after mutation completes (success or error)
      // Only update if mutation succeeded and data is different from optimistic update
      if (!error && response) {
        const responseData = response as { data: Basket } | null;
        const data = responseData?.data ?? null;
        if (data) {
          const userName = data.userName || getUserName(user);
          if (!userName) {
            return;
          }
          const basketKey = basketKeys.getBasket.create({ userName });
          const currentCache = queryClient.getQueryData<{
            data: Basket;
          } | null>(basketKey);

          // Only update if data is actually different from optimistic update
          if (
            !currentCache?.data ||
            JSON.stringify(currentCache.data.items) !==
              JSON.stringify(data.items)
          ) {
            queryClient.setQueryData(basketKey, { data });
          }
        }
      }
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CheckoutInput) => {
      const userName = getUserName(user);
      if (!userName) {
        throw new Error('User must be authenticated to checkout');
      }
      return checkoutClient.basket.checkout({
        payload: { ...input, userName },
      });
    },
    onSuccess: () => {
      const userName = getUserName(user);
      if (!userName) {
        return;
      }
      const emptyBasket: Basket = {
        userName,
        items: [],
        totalPrice: 0,
        itemCount: 0,
        isEmpty: true,
      };
      updateBasketCache(queryClient, emptyBasket, userName);
    },
  });
}
