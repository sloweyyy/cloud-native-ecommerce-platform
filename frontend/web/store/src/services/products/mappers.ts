import { createMapper } from '../factory/createMapper';
import { ZodSchema } from 'zod';

import {
  Product,
  ProductResponse,
  ProductsResponse,
  ProductDetailResponse,
  Brand,
  BrandResponse,
  ProductType,
  ProductTypeResponse,
  PaginatedProducts,
  productResponseSchema,
  productsResponseSchema,
  productDetailResponseSchema,
  brandResponseSchema,
  productTypeResponseSchema,
  brandArrayResponseSchema,
  productTypeArrayResponseSchema,
} from './schemas';

export const productMapper = createMapper<ProductResponse, Product>(
  (entity) => {
    return {
      id: entity.id,
      name: entity.name,
      summary: entity.summary,
      description: entity.description,
      imageFile: entity.imageFile,
      brands: entity.brands,
      types: entity.types,
      price: entity.price,
    };
  },
  productResponseSchema as ZodSchema<ProductResponse>
);

export const productsMapper = createMapper<ProductsResponse, PaginatedProducts>(
  (entity) => {
    return {
      pageIndex: entity.pageIndex,
      pageSize: entity.pageSize,
      count: entity.count,
      data: entity.data
        .map((productResponse) => productMapper.toDto(productResponse))
        .filter((product): product is Product => product !== null),
    };
  },
  productsResponseSchema as ZodSchema<ProductsResponse>
);

export const brandMapper = createMapper<BrandResponse, Brand>((entity) => {
  return {
    id: entity.id,
    name: entity.name,
  };
}, brandResponseSchema as ZodSchema<BrandResponse>);

export const brandArrayMapper = createMapper<BrandResponse[], Brand[]>(
  (entity) => {
    return entity
      .map((brandResponse) => brandMapper.toDto(brandResponse))
      .filter((brand): brand is Brand => brand !== null);
  },
  brandArrayResponseSchema as ZodSchema<BrandResponse[]>
);

export const productTypeMapper = createMapper<ProductTypeResponse, ProductType>(
  (entity) => {
    return {
      id: entity.id,
      name: entity.name,
    };
  },
  productTypeResponseSchema as ZodSchema<ProductTypeResponse>
);

export const productTypeArrayMapper = createMapper<
  ProductTypeResponse[],
  ProductType[]
>((entity) => {
  return entity
    .map((typeResponse) => productTypeMapper.toDto(typeResponse))
    .filter((type): type is ProductType => type !== null);
}, productTypeArrayResponseSchema as ZodSchema<ProductTypeResponse[]>);

export const productDetailMapper = createMapper<ProductDetailResponse, Product>(
  (entity) => {
    return {
      id: entity.id,
      name: entity.name,
      summary: entity.summary,
      description: entity.description,
      imageFile: entity.imageFile,
      brands: entity.brands,
      types: entity.types,
      price: entity.price,
    };
  },
  productDetailResponseSchema as ZodSchema<ProductDetailResponse>
);
