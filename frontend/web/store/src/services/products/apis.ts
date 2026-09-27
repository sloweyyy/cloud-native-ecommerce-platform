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
  brandArrayMapper,
  productTypeArrayMapper,
} from './mappers';
import {
  ProductsResponse,
  ProductDetailResponse,
  BrandResponse,
  ProductTypeResponse,
  PaginatedProducts,
  productsResponseSchema,
  productDetailResponseSchema,
  brandArrayResponseSchema,
  productTypeArrayResponseSchema,
} from './schemas';

export const apiFactory = createApiFactory('/Catalog', { version: '' });

export async function getProducts(request?: Request<StoreParamsInput>) {
  return apiFactory<ProductsResponse, PaginatedProducts>(
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

export async function getProductById(
  request: RequestParamsRequired<ProductByIdInput>
) {
  return apiFactory<ProductDetailResponse>(
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

export async function getBrands(request?: Request) {
  return apiFactory<BrandResponse[]>('GET', '/GetAllBrands', request, {
    transformer: brandArrayMapper.toDto,
    paramsSchema: brandsInput,
    responseSchema: brandArrayResponseSchema,
    useMock: request?.params?.useMock ?? false,
  });
}

export async function getTypes(request?: Request) {
  return apiFactory<ProductTypeResponse[]>('GET', '/GetAllTypes', request, {
    transformer: productTypeArrayMapper.toDto,
    paramsSchema: typesInput,
    responseSchema: productTypeArrayResponseSchema,
    useMock: request?.params?.useMock ?? false,
  });
}
