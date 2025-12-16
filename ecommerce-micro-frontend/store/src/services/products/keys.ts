import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';
import { StoreParamsInput } from './input';

const createProductKeys = createCacheKeyWithScope('_product');

export const productKeys = {
  // Aligned with useGetProducts hook
  products: createCacheSection((input?: StoreParamsInput) =>
    createProductKeys(['products', input])
  ),
  // Aligned with useGetProductById hook
  productById: createCacheSection((id?: string) =>
    createProductKeys(['product', id])
  ),
  // Aligned with useGetProductReviews hook
  productReviews: createCacheSection((productId?: string) =>
    createProductKeys(['reviews', productId])
  ),
  // Aligned with useGetBrands hook
  brands: createCacheSection(() => createProductKeys(['brands'])),
  // Aligned with useGetTypes hook
  types: createCacheSection(() => createProductKeys(['types'])),
};
