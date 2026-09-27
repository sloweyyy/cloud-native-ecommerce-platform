import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { storeClient } from '@services/index';
import { AddToCartInput } from './input';
import { FilterOptions } from '@services/types';
import { basketKeys } from './keys';
import { Basket } from './schemas';

export const CART_UPDATED_EVENT = 'ecommerce:cart:updated';

function getUserName(user: ReturnType<typeof useAuth>['user']): string | null {
  if (!user) {
    return null;
  }
  return user.email || user.displayName || user.id || null;
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
    mutationFn: async (payload: AddToCartPayload) => {
      const userName = getUserName(user);
      if (!userName) {
        throw new Error('User must be authenticated to add items to cart');
      }

      const basketKey = basketKeys.getBasket.create({ userName });
      let currentBasket: Basket | undefined =
        queryClient.getQueryData<Basket>(basketKey);

      if (!currentBasket) {
        try {
          const response = await storeClient.basket.getBasket({
            params: { userName },
          });
          if (response && 'itemCount' in response && 'isEmpty' in response) {
            currentBasket = response as Basket;
          }
        } catch (error) {
          console.error('[useAddToCart] Error fetching basket', error);
        }
      }

      if (!currentBasket) {
        currentBasket = {
          userName,
          items: [],
          totalPrice: 0,
          itemCount: 0,
          isEmpty: true,
        };
      }

      const existingItems = currentBasket.items;
      const existingItemIndex = existingItems.findIndex(
        (item) => item.productId === payload.productId
      );

      let updatedItems: Basket['items'];

      if (existingItemIndex >= 0) {
        updatedItems = existingItems.map((item, index) => {
          if (index === existingItemIndex) {
            return {
              ...item,
              quantity: item.quantity + payload.quantity,
              itemTotal: item.price * (item.quantity + payload.quantity),
            };
          }
          return item;
        });
      } else {
        updatedItems = [
          ...existingItems,
          {
            productId: payload.productId,
            productName: payload.productName,
            price: payload.price,
            originalPrice: payload.originalPrice,
            discountAmount: 0, // Backend calculates discount via gRPC
            quantity: payload.quantity,
            imageFile: payload.imageFile,
            itemTotal: payload.price * payload.quantity,
          },
        ];
      }

      const command: AddToCartInput = {
        UserName: userName,
        Items: updatedItems.map((item) => ({
          Quantity: item.quantity,
          Price: item.price,
          OriginalPrice: item.originalPrice,
          DiscountAmount: item.discountAmount,
          ProductId: item.productId,
          ImageFile: item.imageFile || undefined,
          ProductName: item.productName,
        })),
      };

      return storeClient.basket.addToCart({
        payload: command,
      });
    },
    onSuccess: (data) => {
      const userName = getUserName(user);
      if (!userName) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: basketKeys.getBasket.create({ userName }),
      });

      const event = new CustomEvent(CART_UPDATED_EVENT, {
        detail: {
          itemCount: data?.items?.length ?? 0,
          totalPrice: data?.totalPrice ?? 0,
          userName,
        },
      });

      window.dispatchEvent(event);
    },
  });
}
