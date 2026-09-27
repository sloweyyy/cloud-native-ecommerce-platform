import { Nullable } from '../types';
import { ZodSchema } from 'zod';

export type ExtraParams = Record<PropertyKey, unknown>;

export type Mapper<Entity, Dto, ExtraParams> = {
  toDto: (entity: Nullable<Entity>, extraParams?: ExtraParams) => Dto | null;
  toListDto: (
    entities: Nullable<Array<Entity>>,
    extraParams?: ExtraParams,
  ) => Dto[];
};

export const createMapper = <Entity, Dto, ExtraParams = Record<string, never>>(
  mapFunction: (entity: Entity, extraParams?: ExtraParams) => Dto,
  schema: ZodSchema<Entity>,
): Mapper<Entity, Dto, ExtraParams> => {
  const baseMapper: Mapper<Entity, Dto, ExtraParams> = {
    toDto: (entity: Nullable<Entity>, extraParams?: ExtraParams) => {
      if (entity == null) {
        return null;
      }
      const parseResult = schema.safeParse(entity);
      if (!parseResult.success) {
        return null;
      }
      return mapFunction(parseResult.data, extraParams);
    },
    toListDto: (
      entities: Nullable<Array<Entity>>,
      extraParams?: ExtraParams,
    ) => {
      if (!entities || entities.length === 0) {
        return [];
      }
      return entities.reduce<Dto[]>((acc, entity) => {
        const parseResult = schema.safeParse(entity);
        if (parseResult.success) {
          acc.push(mapFunction(parseResult.data, extraParams));
        }
        return acc;
      }, []);
    },
  };
  return baseMapper;
};

