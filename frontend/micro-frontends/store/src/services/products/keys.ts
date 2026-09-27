import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';
import { StoreParamsInput } from './input';

const createProductKeys = createCacheKeyWithScope('_product');

export const productKeys = {
  products: createCacheSection((input?: StoreParamsInput) =>
    createProductKeys(['products', input])
  ),
  productById: createCacheSection((id?: string) =>
    createProductKeys(['product', id])
  ),
  brands: createCacheSection(() => createProductKeys(['brands'])),
  types: createCacheSection(() => createProductKeys(['types'])),
};
