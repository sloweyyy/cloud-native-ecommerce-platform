import { createMapper } from '../factory/createMapper';
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

// Mapper for single brand
export const brandMapper = createMapper<BrandResponse, Brand>(
  (response) => {
    return {
      id: response.id,
      name: response.name,
    };
  },
  brandResponseSchema
);

// Mapper for brand array
export const brandsMapper = createMapper<BrandResponse[], Brand[]>(
  (response) => {
    return brandMapper.toListDto(response);
  },
  brandResponseSchema.array()
);

// Mapper for single type
export const typeMapper = createMapper<TypeResponse, Type>(
  (response) => {
    return {
      id: response.id,
      name: response.name,
    };
  },
  typeResponseSchema
);

// Mapper for type array
export const typesMapper = createMapper<TypeResponse[], Type[]>(
  (response) => {
    return typeMapper.toListDto(response);
  },
  typeResponseSchema.array()
);

