import { useQuery } from '@tanstack/react-query';
import { storeClient } from '@services/index';
import { StoreParamsInput } from './input';
import { ReactQueryOptions } from '@services/types';
import { productKeys } from './keys';
import { PaginatedProducts, Product, Brand, ProductType } from './schemas';

export function useGetProducts(
  params?: StoreParamsInput,
  options?: ReactQueryOptions
) {
  return useQuery({
    ...options,
    queryKey: [productKeys.products.create(params)],
    queryFn: async (): Promise<PaginatedProducts | null> => {
      const result = await storeClient.products.getProducts({ params });
      return result ?? null;
    },
  });
}

export function useGetProductById(id: string, options?: ReactQueryOptions) {
  return useQuery({
    ...options,
    enabled: !!id && (options?.enabled ?? true),
    queryKey: [productKeys.productById.create(id)],
    queryFn: async (): Promise<Product | null> => {
      const result = await storeClient.products.getProductById({
        params: { id },
      });
      return result ?? null;
    },
  });
}

export function useGetBrands(options?: ReactQueryOptions) {
  return useQuery({
    ...options,
    queryKey: [productKeys.brands.create()],
    queryFn: async (): Promise<Brand[] | null> => {
      const result = await storeClient.products.getBrands();
      return result ?? null;
    },
  });
}

export function useGetTypes(options?: ReactQueryOptions) {
  return useQuery({
    ...options,
    queryKey: [productKeys.types.create()],
    queryFn: async (): Promise<ProductType[] | null> => {
      const result = await storeClient.products.getTypes();
      return result ?? null;
    },
  });
}
