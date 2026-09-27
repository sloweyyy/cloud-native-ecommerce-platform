import { z } from 'zod';
import { createApiFactory } from '../factory/createApiFactory';
import { Request, RequestParamsRequired, RequestPayloadRequired } from '../types';
import {
  productsParamsInput,
  ProductsParamsInput,
  productByIdInput,
  ProductByIdInput,
  createProductInput,
  CreateProductInput,
  updateProductInput,
  UpdateProductInput,
} from './input';
import {
  productMapper,
  productsMapper,
} from './mappers';
import {
  Product,
  ProductResponse,
  ProductsResponse,
  PaginatedProducts,
} from './types';
import {
  productResponseSchema,
  paginationSchema,
} from './schemas';

export const apiFactory = createApiFactory('/Catalog', { version: 'v1' });

/**
 * Get all products with pagination and filters
 *
 * @param request - Optional request parameters
 * @param request.params.brandId - Filter by brand ID
 * @param request.params.typeId - Filter by type ID
 * @param request.params.search - Search query
 * @param request.params.page - Page number for pagination
 * @param request.params.limit - Number of products per page
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Paginated list of products
 *
 * @example
 * ```typescript
 * const result = await getProducts({
 *   params: {
 *     brandId: 'brand-123',
 *     page: 1,
 *     limit: 20,
 *     useMock: true
 *   }
 * });
 * ```
 */
export async function getProducts(request?: Request<ProductsParamsInput>) {
  return apiFactory<ProductsResponse, PaginatedProducts>(
    'GET',
    '/GetAllProducts',
    request,
    {
      transformer: productsMapper.toDto,
      paramsSchema: productsParamsInput,
      responseSchema: paginationSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}

/**
 * Get a single product by its ID
 *
 * @param request - Request with product ID
 * @param request.params.id - The product ID to fetch
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Product details
 *
 * @example
 * ```typescript
 * const result = await getProductById({
 *   params: { id: 'product-123', useMock: true }
 * });
 * ```
 */
export async function getProductById(
  request: RequestParamsRequired<ProductByIdInput>
) {
  return apiFactory<ProductResponse, Product>(
    'GET',
    '/GetProductById/:id',
    request,
    {
      transformer: productMapper.toDto,
      paramsSchema: productByIdInput,
      responseSchema: productResponseSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}

/**
 * Create a new product
 *
 * @param request - Request with product data
 * @param request.payload - Product creation data
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Created product
 *
 * @example
 * ```typescript
 * const result = await createProduct({
 *   payload: {
 *     name: 'New Product',
 *     price: 99.99,
 *     brandId: 'brand-123'
 *   }
 * });
 * ```
 */
export async function createProduct(
  request: RequestPayloadRequired<CreateProductInput>
) {
  console.log('[createProduct API] Called with request:', request);
  const result = await apiFactory<ProductResponse, Product>(
    'POST',
    '/CreateProduct',
    request,
    {
      transformer: productMapper.toDto,
      payloadSchema: createProductInput,
      responseSchema: productResponseSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
  console.log('[createProduct API] Result:', result);
  return result;
}

/**
 * Update an existing product
 *
 * @param request - Request with product data
 * @param request.payload - Product update data (must include id)
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Updated product
 *
 * @example
 * ```typescript
 * const result = await updateProduct({
 *   payload: {
 *     id: 'product-123',
 *     name: 'Updated Product',
 *     price: 129.99
 *   }
 * });
 * ```
 */
export async function updateProduct(
  request: RequestPayloadRequired<UpdateProductInput>
) {
  console.log('[updateProduct API] Called with request:', request);
  const result = await apiFactory<boolean, boolean>(
    'PUT',
    '/UpdateProduct',
    request,
    {
      transformer: (data) => data,
      payloadSchema: updateProductInput,
      responseSchema: z.boolean(),
      useMock: request?.params?.useMock ?? false,
    }
  );
  console.log('[updateProduct API] Result:', result);
  return result;
}

/**
 * Delete a product by ID
 *
 * @param request - Request with product ID
 * @param request.params.id - The product ID to delete
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Success boolean
 *
 * @example
 * ```typescript
 * const result = await deleteProduct({
 *   params: { id: 'product-123', useMock: true }
 * });
 * ```
 */
export async function deleteProduct(
  request: RequestParamsRequired<ProductByIdInput>
) {
  console.log('[deleteProduct API] Called with request:', request);
  const result = await apiFactory<unknown, boolean>(
    'DELETE',
    '/:id',
    request,
    {
      transformer: () => true,
      paramsSchema: productByIdInput,
      responseSchema: z.any(),
      useMock: request?.params?.useMock ?? false,
    }
  );
  console.log('[deleteProduct API] Result:', result);
  return result;
}
