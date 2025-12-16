import type {
  ShoppingCartResponse,
  ShoppingCartItemResponse,
  Basket,
  BasketItem,
} from './types';
import {
  shoppingCartResponseSchema,
  shoppingCartItemResponseSchema,
} from './schemas';

/**
 * Map backend ShoppingCartItem to frontend BasketItem
 * Note: Backend returns camelCase
 */
export function mapBasketItem(
  response: ShoppingCartItemResponse
): BasketItem | null {
  // Validate with Zod schema
  const parseResult = shoppingCartItemResponseSchema.safeParse(response);
  if (!parseResult.success) {
    console.warn('[Basket Mapper] Invalid basket item:', parseResult.error);
    return null;
  }

  const data = parseResult.data;
  const itemTotal = data.price * data.quantity;

  return {
    productId: data.productId,
    productName: data.productName,
    price: data.price,
    originalPrice: data.originalPrice,
    discountAmount: data.discountAmount,
    quantity: data.quantity,
    imageFile: data.imageFile,
    itemTotal,
  };
}

/**
 * Map backend ShoppingCart to frontend Basket
 * Note: Backend returns camelCase
 */
export function mapBasket(response: ShoppingCartResponse): Basket | null {
  // Validate with Zod schema
  const parseResult = shoppingCartResponseSchema.safeParse(response);
  if (!parseResult.success) {
    console.warn('[Basket Mapper] Invalid basket response:', parseResult.error);
    return null;
  }

  const data = parseResult.data;
  const items = data.items || [];
  const mappedItems: BasketItem[] = [];

  for (const item of items) {
    const mappedItem = mapBasketItem(item);
    if (mappedItem !== null) {
      mappedItems.push(mappedItem);
    }
  }

  const itemCount = mappedItems.reduce((sum, item) => sum + item.quantity, 0);
  const isEmpty = mappedItems.length === 0;

  // Calculate total if not provided
  const totalPrice =
    data.totalPrice ??
    mappedItems.reduce((sum, item) => sum + (item.itemTotal ?? 0), 0);

  return {
    userName: data.userName,
    items: mappedItems,
    totalPrice,
    itemCount,
    isEmpty,
  };
}

// ====================================
// Mapper object for compatibility with createMapper pattern
// ====================================

export const basketItemMapper = {
  toDto: mapBasketItem,
  toListDto: (items: ShoppingCartItemResponse[] | null | undefined) => {
    if (!items || items.length === 0) {
      return [];
    }
    return items
      .map(mapBasketItem)
      .filter((item): item is BasketItem => item !== null);
  },
};

export const basketMapper = {
  toDto: mapBasket,
  toListDto: (baskets: ShoppingCartResponse[] | null | undefined) => {
    if (!baskets || baskets.length === 0) {
      return [];
    }
    return baskets
      .map(mapBasket)
      .filter((basket): basket is Basket => basket !== null);
  },
};
