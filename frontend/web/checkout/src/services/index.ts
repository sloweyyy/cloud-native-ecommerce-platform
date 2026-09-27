import * as basketApis from './basket/apis';

export const checkoutClient = {
  basket: {
    ...basketApis,
    getBasket: basketApis.getBasket,
    addToCart: basketApis.addToCart,
    updateBasketItem: basketApis.updateBasketItem,
    removeBasketItem: basketApis.removeBasketItem,
    checkout: basketApis.checkout,
  },
};

export * from './httpClient';
export * from './queryClient';
export * from './types';
export * from './factory/createApiFactory';
export * from './factory/createCacheKeyFactory';
export * from './factory/createApiResponseSchemaFactory';
export * from './factory/createApiInputFactory';
export * from './factory/createMapper';
export * from './utils/common';
