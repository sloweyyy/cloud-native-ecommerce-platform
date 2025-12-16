/**
 * Checkout Module - API Configuration
 */

export const API_CONFIG = {
  BASKET: {
    BASE: '/Basket',
    GET_BASKET: (userName: string) => `/Basket/GetBasket/${userName}`,
    CREATE_BASKET: '/Basket/CreateBasket',
    DELETE_BASKET: (userName: string) => `/Basket/DeleteBasket/${userName}`,
    CHECKOUT: '/Basket/Checkout',
  },
  DISCOUNT: {
    BASE: '/Discount',
    GET_DISCOUNT: (productName: string) => `/Discount/GetDiscount/${productName}`,
    CREATE_DISCOUNT: '/Discount/CreateDiscount',
    UPDATE_DISCOUNT: '/Discount/UpdateDiscount',
    DELETE_DISCOUNT: (productName: string) => `/Discount/DeleteDiscount/${productName}`,
  },
} as const;

