import { productKeys } from '@services/products/keys';
import { basketKeys } from '@services/basket/keys';

export const cacheKeys = {
  products: productKeys,
  basket: basketKeys,
} as const;
