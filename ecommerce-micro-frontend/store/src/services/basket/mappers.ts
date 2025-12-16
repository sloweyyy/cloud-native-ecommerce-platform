import type {
  ShoppingCartResponse,
  ShoppingCartItemResponse,
  Basket,
  BasketItem,
} from './types';

/**
 * Map backend ShoppingCartItem to frontend BasketItem
 * Note: Backend already returns camelCase, so mapping is straightforward
 */
export function mapShoppingCartItemToBasketItem(
  response: ShoppingCartItemResponse
): BasketItem {
  const price = response.price;
  const quantity = response.quantity;
  const itemTotal = price * quantity;

  return {
    productId: response.productId,
    productName: response.productName,
    price,
    originalPrice: response.originalPrice ?? price,
    discountAmount: response.discountAmount ?? 0,
    quantity,
    imageFile: response.imageFile,
    itemTotal,
  };
}

/**
 * Map backend ShoppingCart to frontend Basket
 */
export function mapShoppingCartToBasket(response: ShoppingCartResponse): Basket {
  const items = response.items.map(mapShoppingCartItemToBasketItem);
  const itemCount = items.length;
  const isEmpty = itemCount === 0;
  const totalPrice =
    response.totalPrice ?? items.reduce((sum, item) => sum + item.itemTotal, 0);

  return {
    userName: response.userName,
    items,
    totalPrice,
    itemCount,
    isEmpty,
  };
}

/**
 * Create an empty basket for a user
 */
export function createEmptyBasket(userName: string): Basket {
  return {
    userName,
    items: [],
    totalPrice: 0,
    itemCount: 0,
    isEmpty: true,
  };
}
