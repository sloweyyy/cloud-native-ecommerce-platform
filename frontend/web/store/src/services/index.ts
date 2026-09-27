import * as products from './products/apis';
import * as basket from './basket/apis';

export const storeClient = {
  products,
  basket,
};

export * from './cache-keys';
