import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReactQueryOptions, ReactMutationOptions } from '../types';
import { productsKeys } from './keys';
import { ProductsParamsInput, CreateProductInput, UpdateProductInput } from './input';
import { env } from '../../config';
import * as productsApi from './apis';
import type { Product, PaginatedProducts } from './types';

/**
 * Hook to fetch all products with pagination and filters
 *
 * @param params - Filter and pagination parameters
 * @param params.brandId - Filter by brand ID
 * @param params.typeId - Filter by type ID
 * @param params.search - Search query
 * @param params.page - Page number (default: 1)
 * @param params.limit - Products per page (default: 10)
 * @param options - React Query options (enabled, initialData, etc.)
 * @returns Query result with product list, loading state, and error
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useGetAllProducts({
 *   brandId: 'brand-123',
 *   page: 1,
 *   limit: 20
 * });
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 *
 * return <ProductList products={data?.data} />;
 * ```
 */
export const useGetAllProducts = (
  params?: ProductsParamsInput,
  options?: ReactQueryOptions<PaginatedProducts | null> & { useMock?: boolean }
) => {
  const { enabled = true, initialData, useMock, ...rest } = options || {};

  const shouldUseMock = useMock ?? params?.useMock ?? env.useMockData;

  return useQuery<PaginatedProducts | null>({
    ...rest,
    enabled: Boolean(enabled),
    queryKey: [productsKeys.all.create(params)],
    queryFn: async () => {
      const result = await productsApi.getProducts({
        params: { ...params, useMock: shouldUseMock },
      });
      return result?.data ?? null;
    },
    initialData: initialData as PaginatedProducts | null | undefined,
  });
};

/**
 * Hook to fetch a single product by ID
 *
 * @param id - The product ID to fetch
 * @param options - React Query options (enabled, initialData, etc.)
 * @returns Query result with product details
 *
 * @example
 * ```tsx
 * const { data: product, isLoading, error } = useGetProductById('product-123');
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 *
 * return <ProductDetails product={product} />;
 * ```
 */
export const useGetProductById = (
  id: string,
  options?: ReactQueryOptions<Product | null> & { useMock?: boolean }
) => {
  const {
    enabled = true,
    initialData,
    useMock = env.useMockData,
    ...rest
  } = options || {};

  return useQuery<Product | null>({
    ...rest,
    enabled: !!id && Boolean(enabled),
    queryKey: [productsKeys.detail.create(id)],
    queryFn: async () => {
      const result = await productsApi.getProductById({ params: { id, useMock } });
      return result?.data ?? null;
    },
    initialData: initialData as Product | null | undefined,
  });
};

/**
 * Hook to create a new product
 *
 * @param options - Mutation options (onSuccess, onError)
 * @returns Mutation object with mutate function and state
 *
 * @example
 * ```tsx
 * const createProduct = useCreateProduct({
 *   onSuccess: (data) => {
 *     message.success('Product created successfully');
 *     navigate(`/products/${data.id}`);
 *   },
 *   onError: (error) => {
 *     message.error('Failed to create product');
 *   }
 * });
 *
 * function handleSubmit(values) {
 *   createProduct.mutate({
 *     payload: {
 *       name: values.name,
 *       price: values.price,
 *       brandId: values.brandId
 *     }
 *   });
 * }
 * ```
 */
export const useCreateProduct = (options?: ReactMutationOptions<Product | null, Error, CreateProductInput>) => {
  const queryClient = useQueryClient();

  return useMutation<Product | null, Error, CreateProductInput>({
    mutationFn: async (payload: CreateProductInput) => {
      console.log('[useCreateProduct] mutationFn called with payload:', payload);
      const result = await productsApi.createProduct({ payload });
      console.log('[useCreateProduct] API result:', result);
      return result?.data ?? null;
    },
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate relevant queries
      productsKeys.all.invalidateQueries(queryClient);
      options?.onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      options?.onError?.(error, variables, context, mutation);
    },
  });
};

/**
 * Hook to update an existing product
 *
 * @param options - Mutation options (onSuccess, onError)
 * @returns Mutation object with mutate function and state
 *
 * @example
 * ```tsx
 * const updateProduct = useUpdateProduct({
 *   onSuccess: (data) => {
 *     message.success('Product updated successfully');
 *   }
 * });
 *
 * updateProduct.mutate({
 *   payload: {
 *     id: 'product-123',
 *     name: 'Updated Name',
 *     price: 129.99
 *   }
 * });
 * ```
 */
export const useUpdateProduct = (options?: ReactMutationOptions<boolean, Error, UpdateProductInput>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProductInput): Promise<boolean> => {
      console.log('[useUpdateProduct] mutationFn called with payload:', payload);
      const result = await productsApi.updateProduct({ payload });
      console.log('[useUpdateProduct] API result:', result);
      return result?.data ?? false;
    },
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate relevant queries
      productsKeys.all.invalidateQueries(queryClient);
      if (variables.id) {
        productsKeys.detail.invalidateQueries(queryClient, variables.id);
      }
      options?.onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      options?.onError?.(error, variables, context, mutation);
    },
  });
};

/**
 * Hook to delete a product
 *
 * @param options - Mutation options (onSuccess, onError)
 * @returns Mutation object with mutate function and state
 *
 * @example
 * ```tsx
 * const deleteProduct = useDeleteProduct({
 *   onSuccess: () => {
 *     message.success('Product deleted successfully');
 *   }
 * });
 *
 * deleteProduct.mutate({ params: { id: 'product-123' } });
 * ```
 */
export const useDeleteProduct = (options?: ReactMutationOptions<boolean, Error, string>) => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      console.log('[useDeleteProduct] mutationFn called with id:', id);
      const result = await productsApi.deleteProduct({ params: { id } });
      console.log('[useDeleteProduct] API result:', result);
      return result?.data ?? true;
    },
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate relevant queries
      productsKeys.all.invalidateQueries(queryClient);
      options?.onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      options?.onError?.(error, variables, context, mutation);
    },
  });
};
