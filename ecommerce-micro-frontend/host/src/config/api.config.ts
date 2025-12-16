/**
 * Host Module - API Configuration
 */

export const API_CONFIG = {
  BASKET: {
    BASE: '/Basket',
    GET_BASKET: (userName: string) => `/Basket/GetBasket/${userName}`,
    CREATE_BASKET: '/Basket/CreateBasket',
    DELETE_BASKET: (userName: string) => `/Basket/DeleteBasket/${userName}`,
    CHECKOUT: '/Basket/Checkout',
  },
} as const;

