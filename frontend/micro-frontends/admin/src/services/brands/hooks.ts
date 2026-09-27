import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReactQueryOptions, ReactMutationOptions } from '../types';
import { brandsKeys } from './keys';
import { CreateBrandInput, CreateTypeInput } from './input';
import { env } from '../../config';
import * as brandsApi from './apis';
import type { Brand, Type } from './types';

/**
 * Hook to fetch all brands
 *
 * @param options - React Query options (enabled, initialData, etc.)
 * @returns Query result with brand list, loading state, and error
 *
 * @example
 * ```tsx
 * const { data: brands, isLoading, error } = useGetAllBrands();
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 *
 * return <BrandList brands={brands} />;
 * ```
 */
export const useGetAllBrands = (
  options?: ReactQueryOptions<Brand[]> & { useMock?: boolean }
) => {
  const { enabled = true, initialData, useMock, ...rest } = options || {};

  const shouldUseMock = useMock ?? env.useMockData;

  return useQuery<Brand[]>({
    ...rest,
    enabled: Boolean(enabled),
    queryKey: [brandsKeys.all.create()],
    queryFn: async () => {
      const result = await brandsApi.getBrands({
        params: { useMock: shouldUseMock },
      });
      return result?.data ?? [];
    },
    initialData: initialData as Brand[] | undefined,
  });
};

/**
 * Hook to create a new brand
 *
 * @param options - Mutation options (onSuccess, onError)
 * @returns Mutation object with mutate function and state
 *
 * @example
 * ```tsx
 * const createBrand = useCreateBrand({
 *   onSuccess: (data) => {
 *     message.success('Brand created successfully');
 *   },
 *   onError: (error) => {
 *     message.error('Failed to create brand');
 *   }
 * });
 *
 * createBrand.mutate({
 *   payload: {
 *     name: 'New Brand'
 *   }
 * });
 * ```
 */
export const useCreateBrand = (options?: ReactMutationOptions<Brand | null, Error, CreateBrandInput>) => {
  const queryClient = useQueryClient();

  return useMutation<Brand | null, Error, CreateBrandInput>({
    mutationFn: async (payload: CreateBrandInput) => {
      const result = await brandsApi.createBrand({ payload });
      return result?.data ?? null;
    },
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate relevant queries
      brandsKeys.all.invalidateQueries(queryClient);
      options?.onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      options?.onError?.(error, variables, context, mutation);
    },
  });
};

/**
 * Hook to fetch all types
 *
 * @param options - React Query options (enabled, initialData, etc.)
 * @returns Query result with type list, loading state, and error
 *
 * @example
 * ```tsx
 * const { data: types, isLoading, error } = useGetAllTypes();
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 *
 * return <TypeList types={types} />;
 * ```
 */
export const useGetAllTypes = (
  options?: ReactQueryOptions<Type[]> & { useMock?: boolean }
) => {
  const { enabled = true, initialData, useMock, ...rest } = options || {};

  const shouldUseMock = useMock ?? env.useMockData;

  return useQuery<Type[]>({
    ...rest,
    enabled: Boolean(enabled),
    queryKey: [brandsKeys.types.create()],
    queryFn: async () => {
      const result = await brandsApi.getTypes({
        params: { useMock: shouldUseMock },
      });
      return result?.data ?? [];
    },
    initialData: initialData as Type[] | undefined,
  });
};

/**
 * Hook to create a new type
 *
 * @param options - Mutation options (onSuccess, onError)
 * @returns Mutation object with mutate function and state
 *
 * @example
 * ```tsx
 * const createType = useCreateType({
 *   onSuccess: (data) => {
 *     message.success('Type created successfully');
 *   },
 *   onError: (error) => {
 *     message.error('Failed to create type');
 *   }
 * });
 *
 * createType.mutate({
 *   payload: {
 *     name: 'New Type'
 *   }
 * });
 * ```
 */
export const useCreateType = (options?: ReactMutationOptions<Type | null, Error, CreateTypeInput>) => {
  const queryClient = useQueryClient();

  return useMutation<Type | null, Error, CreateTypeInput>({
    mutationFn: async (payload: CreateTypeInput) => {
      const result = await brandsApi.createType({ payload });
      return result?.data ?? null;
    },
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate relevant queries
      brandsKeys.types.invalidateQueries(queryClient);
      options?.onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      options?.onError?.(error, variables, context, mutation);
    },
  });
};
