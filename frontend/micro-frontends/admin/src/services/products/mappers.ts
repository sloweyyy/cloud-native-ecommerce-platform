import { createMapper } from '../factory/createMapper';
import {
  Product,
  ProductResponse,
  PaginatedProducts,
  ProductsResponse,
} from './types';
import {
  productResponseSchema,
  paginationSchema,
} from './schemas';

// Mapper for single product
export const productMapper = createMapper<ProductResponse, Product>(
  (response) => {
    return {
      id: response.id,
      name: response.name,
      summary: response.summary ?? undefined,
      description: response.description ?? undefined,
      imageFile: response.imageFile ?? undefined,
      price: response.price,
      brands: response.brands ?? undefined,
      types: response.types ?? undefined,
    };
  },
  productResponseSchema
);

// Mapper for paginated products list
export const productsMapper = createMapper<ProductsResponse, PaginatedProducts>(
  (response) => {
    return {
      pageIndex: response.pageIndex,
      pageSize: response.pageSize,
      count: response.count,
      data: response.data
        .map((productResponse) => productMapper.toDto(productResponse))
        .filter((product): product is Product => product !== null),
    };
  },
  paginationSchema
);

