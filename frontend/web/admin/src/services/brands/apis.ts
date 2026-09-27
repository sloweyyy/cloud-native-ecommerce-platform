import { z } from 'zod';
import { createApiFactory } from '../factory/createApiFactory';
import { Request, RequestPayloadRequired } from '../types';
import {
  createBrandInput,
  CreateBrandInput,
  createTypeInput,
  CreateTypeInput,
} from './input';
import {
  brandMapper,
  typeMapper,
} from './mappers';
import {
  Brand,
  Type,
  BrandResponse,
  TypeResponse,
} from './types';
import {
  brandResponseSchema,
  typeResponseSchema,
} from './schemas';

export const apiFactory = createApiFactory('/Catalog', { version: 'v1' });

/**
 * Get all brands
 *
 * @param request - Optional request parameters
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Array of brands
 *
 * @example
 * ```typescript
 * const result = await getBrands({
 *   params: { useMock: true }
 * });
 * ```
 */
export async function getBrands(request?: Request) {
  return apiFactory<BrandResponse[], Brand[]>(
    'GET',
    '/GetAllBrands',
    request,
    {
      transformer: brandMapper.toListDto,
      paramsSchema: z.object({}),
      responseSchema: z.array(brandResponseSchema),
      useMock: request?.params?.useMock ?? false,
    }
  );
}

/**
 * Create a new brand
 *
 * @param request - Request with brand data
 * @param request.payload - Brand creation data
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Created brand
 *
 * @example
 * ```typescript
 * const result = await createBrand({
 *   payload: {
 *     name: 'New Brand'
 *   }
 * });
 * ```
 */
export async function createBrand(
  request: RequestPayloadRequired<CreateBrandInput>
) {
  return apiFactory<BrandResponse, Brand>(
    'POST',
    '/CreateBrand',
    request,
    {
      transformer: brandMapper.toDto,
      payloadSchema: createBrandInput,
      responseSchema: brandResponseSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}

/**
 * Get all types
 *
 * @param request - Optional request parameters
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Array of types
 *
 * @example
 * ```typescript
 * const result = await getTypes({
 *   params: { useMock: true }
 * });
 * ```
 */
export async function getTypes(request?: Request) {
  return apiFactory<TypeResponse[], Type[]>(
    'GET',
    '/GetAllTypes',
    request,
    {
      transformer: typeMapper.toListDto,
      paramsSchema: z.object({}),
      responseSchema: z.array(typeResponseSchema),
      useMock: request?.params?.useMock ?? false,
    }
  );
}

/**
 * Create a new type
 *
 * @param request - Request with type data
 * @param request.payload - Type creation data
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Created type
 *
 * @example
 * ```typescript
 * const result = await createType({
 *   payload: {
 *     name: 'New Type'
 *   }
 * });
 * ```
 */
export async function createType(
  request: RequestPayloadRequired<CreateTypeInput>
) {
  return apiFactory<TypeResponse, Type>(
    'POST',
    '/CreateType',
    request,
    {
      transformer: typeMapper.toDto,
      payloadSchema: createTypeInput,
      responseSchema: typeResponseSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}
