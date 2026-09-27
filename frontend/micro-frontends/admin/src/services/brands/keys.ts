import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';

const createBrandKeys = createCacheKeyWithScope('_brand');

export const brandsKeys = {
  // Aligned with useGetAllBrands hook
  all: createCacheSection(() =>
    createBrandKeys(['brands'])
  ),
  // Aligned with useGetAllTypes hook
  types: createCacheSection(() =>
    createBrandKeys(['types'])
  ),
};
