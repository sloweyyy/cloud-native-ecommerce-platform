import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';
import { ProductsParamsInput } from './input';

const createProductKeys = createCacheKeyWithScope('_product');

export const productsKeys = {
  // Aligned with useGetProducts hook
  all: createCacheSection((input?: ProductsParamsInput) =>
    createProductKeys(['products', input])
  ),
  // Aligned with useGetProductById hook
  detail: createCacheSection((id?: string) =>
    createProductKeys(['product', id])
  ),
};
