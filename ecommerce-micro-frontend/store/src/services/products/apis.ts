import { createApiFactory } from '../factory/createApiFactory';
import { Request, RequestParamsRequired } from '../types';
import {
  storeParamsInput,
  StoreParamsInput,
  productByIdInput,
  ProductByIdInput,
  brandsInput,
  typesInput,
} from './input';
import {
  productsMapper,
  productDetailMapper,
  reviewsMapper,
  brandArrayMapper,
  productTypeArrayMapper,
} from './mappers';
import {
  Product,
  ProductsResponse,
  ProductDetailResponse,
  ReviewsResponse,
  Review,
  BrandResponse,
  ProductTypeResponse,
  BrandArray,
  ProductTypeArray,
} from './types';
import {
  productsResponseSchema,
  productDetailResponseSchema,
  reviewsResponseSchema,
  brandArrayResponseSchema,
  productTypeArrayResponseSchema,
} from './schemas';

export const apiFactory = createApiFactory('/Catalog', { version: '' });

/**
 * Get all products with pagination and filters
 *
 * @param request - Optional request parameters
 * @param request.params.BrandId - Filter by brand ID
 * @param request.params.TypeId - Filter by product type ID
 * @param request.params.Sort - Sort order
 * @param request.params.Search - Search query
 * @param request.params.page - Page number for pagination
 * @param request.params.limit - Number of items per page
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Paginated list of products
 *
 * @example
 * ```typescript
 * const result = await getProducts({
 *   params: {
 *     BrandId: 'brand-123',
 *     PageIndex: 1,
 *     PageSize: 20,
 *     useMock: true
 *   }
 * });
 * ```
 */
export async function getProducts(request?: Request<StoreParamsInput>) {
  return apiFactory<ProductsResponse, import('./types').PaginatedProducts>(
    'GET',
    '/GetAllProducts',
    request,
    {
      transformer: productsMapper.toDto,
      paramsSchema: storeParamsInput,
      responseSchema: productsResponseSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}

/**
 * Get a single product by its ID with full details
 *
 * @param request - Request with product ID
 * @param request.params.id - The product ID to fetch
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Product details including stock, rating, shipping info
 *
 * @example
 * ```typescript
 * const result = await getProductById({
 *   params: {
 *     id: 'product-123',
 *     useMock: true
 *   }
 * });
 * ```
 */
export async function getProductById(
  request: RequestParamsRequired<ProductByIdInput>
) {
  return apiFactory<ProductDetailResponse, Product>(
    'GET',
    '/GetProductById/:id',
    request,
    {
      transformer: productDetailMapper.toDto,
      paramsSchema: productByIdInput,
      responseSchema: productDetailResponseSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}

/**
 * Get all reviews for a specific product
 *
 * @param request - Request with product ID
 * @param request.params.id - The product ID to get reviews for
 * @param request.params.useMock - Use mock data for development/testing
 * @returns List of product reviews with ratings and comments
 *
 * @example
 * ```typescript
 * const result = await getProductReviews({
 *   params: {
 *     id: 'product-123',
 *     useMock: true
 *   }
 * });
 * ```
 */
export async function getProductReviews(
  request: RequestParamsRequired<ProductByIdInput>
) {
  return apiFactory<ReviewsResponse, Review[]>(
    'GET',
    '/GetProductReviews/:id',
    request,
    {
      transformer: reviewsMapper,
      paramsSchema: productByIdInput,
      responseSchema: reviewsResponseSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}

/**
 * Get all available product brands
 *
 * @param request - Optional request parameters
 * @param request.params.useMock - Use mock data for development/testing
 * @returns List of all product brands
 *
 * @example
 * ```typescript
 * const result = await getBrands({
 *   params: { useMock: true }
 * });
 * ```
 */
export async function getBrands(request?: Request) {
  return apiFactory<BrandResponse[], BrandArray>(
    'GET',
    '/GetAllBrands',
    request,
    {
      transformer: brandArrayMapper.toDto,
      paramsSchema: brandsInput,
      responseSchema: brandArrayResponseSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}

/**
 * Get all available product types/categories
 *
 * @param request - Optional request parameters
 * @param request.params.useMock - Use mock data for development/testing
 * @returns List of all product types/categories
 *
 * @example
 * ```typescript
 * const result = await getTypes({
 *   params: { useMock: true }
 * });
 * ```
 */
export async function getTypes(request?: Request) {
  return apiFactory<ProductTypeResponse[], ProductTypeArray>(
    'GET',
    '/GetAllTypes',
    request,
    {
      transformer: productTypeArrayMapper.toDto,
      paramsSchema: typesInput,
      responseSchema: productTypeArrayResponseSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}
