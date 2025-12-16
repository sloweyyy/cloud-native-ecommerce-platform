import { createCacheKeyWithScope } from '../factory/createCacheKeyFactory';

const createBasketKeys = createCacheKeyWithScope('_basket');

export const basketKeys = {
  all: createBasketKeys(['all']),
  detail: (userName?: string) => createBasketKeys(['detail', userName]),
};

