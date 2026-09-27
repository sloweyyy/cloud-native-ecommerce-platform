import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';

const createCatalogKeys = createCacheKeyWithScope('_catalog');

export const catalogKeys = {
  // Aligned with useUploadProductImage hook
  uploadImage: createCacheSection(() =>
    createCatalogKeys(['uploadImage'])
  ),
};

