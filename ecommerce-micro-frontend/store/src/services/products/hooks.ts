import { useQuery } from '@tanstack/react-query';
import { ReactQueryOptions } from '../types';
import { ReactQueryUnwrapPromise } from '../../typings/common';
import { storeClient } from '../index';
import { productKeys } from './keys';
import { StoreParamsInput } from './input';
import { env } from '../../config';

/**
 * Hook to fetch all products with pagination and filters
 *
 * @param params - Filter and pagination parameters
 * @param params.BrandId - Filter by brand ID
 * @param params.TypeId - Filter by product type ID
 * @param params.Sort - Sort order
 * @param params.Search - Search query
 * @param params.PageIndex - Page number (default: 1)
 * @param params.PageSize - Items per page (default: 10)
 * @param options - React Query options (enabled, initialData, etc.)
 * @returns Query result with product list, loading state, and error
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useGetProducts({
 *   BrandId: 'brand-123',
 *   PageIndex: 1,
 *   PageSize: 20
 * });
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 *
 * return <ProductList products={data?.data} />;
 * ```
 */
export const useGetProducts = (
  params?: StoreParamsInput,
  options?: ReactQueryOptions & { useMock?: boolean }
) => {
  const { enabled = true, initialData, useMock, ...rest } = options || {};

  // Use useMock from options, or fallback to params, or default to env config
  const shouldUseMock = useMock ?? params?.useMock ?? env.useMockData;

  // Debug logging to trace mock data usage
  console.log('[useGetProducts] Mock data decision:', {
    optionsUseMock: useMock,
    paramsUseMock: params?.useMock,
    envUseMockData: env.useMockData,
    finalDecision: shouldUseMock
  });

  return useQuery({
    ...rest,
    enabled: Boolean(enabled),
    queryKey: [productKeys.products.create(params)],
    queryFn: () =>
      storeClient.products.getProducts({
        params: { ...params, useMock: shouldUseMock },
      }),
    initialData: initialData as ReactQueryUnwrapPromise<
      typeof storeClient.products.getProducts
    >,
  });
};

/**
 * Hook to fetch a single product by ID with full details
 *
 * @param id - The product ID to fetch
 * @param options - React Query options (enabled, initialData, etc.)
 * @returns Query result with product details including stock, rating, shipping
 *
 * @example
 * ```tsx
 * const { data: product, isLoading, error } = useGetProductById('product-123');
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 *
 * return (
 *   <ProductDetails
 *     product={product?.data}
 *     stock={product?.data?.stockQuantity}
 *     rating={product?.data?.ratingAverage}
 *   />
 * );
 * ```
 */
export const useGetProductById = (
  id: string,
  options?: ReactQueryOptions & { useMock?: boolean }
) => {
  const {
    enabled = true,
    initialData,
    useMock = env.useMockData,
    ...rest
  } = options || {};

  return useQuery({
    ...rest,
    enabled: !!id && Boolean(enabled),
    queryKey: [productKeys.productById.create(id)],
    queryFn: () =>
      storeClient.products.getProductById({ params: { id, useMock } }),
    initialData: initialData as ReactQueryUnwrapPromise<
      typeof storeClient.products.getProductById
    >,
  });
};

/**
 * Hook to fetch all reviews for a specific product
 *
 * @param productId - The product ID to get reviews for
 * @param options - React Query options (enabled, initialData, etc.)
 * @returns Query result with list of product reviews
 *
 * @example
 * ```tsx
 * const { data: reviews, isLoading } = useGetProductReviews('product-123');
 *
 * if (isLoading) return <Loading />;
 *
 * return (
 *   <ReviewsList reviews={reviews?.data}>
 *     {reviews?.data?.map(review => (
 *       <ReviewCard key={review.reviewId} review={review} />
 *     ))}
 *   </ReviewsList>
 * );
 * ```
 */
export const useGetProductReviews = (
  productId: string,
  options?: ReactQueryOptions & { useMock?: boolean }
) => {
  const {
    enabled = true,
    initialData,
    useMock = env.useMockData,
    ...rest
  } = options || {};

  return useQuery({
    ...rest,
    enabled: !!productId && Boolean(enabled),
    queryKey: [productKeys.productReviews.create(productId)],
    queryFn: () =>
      storeClient.products.getProductReviews({
        params: { id: productId, useMock },
      }),
    initialData: initialData as ReactQueryUnwrapPromise<
      typeof storeClient.products.getProductReviews
    >,
  });
};

/**
 * Hook to fetch all available product brands
 *
 * @param options - React Query options (enabled, initialData, etc.)
 * @returns Query result with list of all brands
 *
 * @example
 * ```tsx
 * const { data: brands, isLoading } = useGetBrands();
 *
 * return (
 *   <Select placeholder="Select Brand">
 *     {brands?.data?.map(brand => (
 *       <Select.Option key={brand.id} value={brand.id}>
 *         {brand.name}
 *       </Select.Option>
 *     ))}
 *   </Select>
 * );
 * ```
 */
export const useGetBrands = (
  options?: ReactQueryOptions & { useMock?: boolean }
) => {
  const {
    enabled = true,
    initialData,
    useMock = env.useMockData,
    ...rest
  } = options || {};
  return useQuery({
    ...rest,
    enabled: Boolean(enabled),
    queryKey: [productKeys.brands.create()],
    queryFn: () =>
      storeClient.products.getBrands({
        params: { useMock },
      }),
    initialData: initialData as ReactQueryUnwrapPromise<
      typeof storeClient.products.getBrands
    >,
  });
};

/**
 * Hook to fetch all available product types/categories
 *
 * @param options - React Query options (enabled, initialData, etc.)
 * @returns Query result with list of all product types
 *
 * @example
 * ```tsx
 * const { data: types, isLoading } = useGetTypes();
 *
 * return (
 *   <Tabs>
 *     <Tabs.TabPane key="all" tab="All Products" />
 *     {types?.data?.map(type => (
 *       <Tabs.TabPane key={type.id} tab={type.name} />
 *     ))}
 *   </Tabs>
 * );
 * ```
 */
export const useGetTypes = (
  options?: ReactQueryOptions & { useMock?: boolean }
) => {
  const {
    enabled = true,
    initialData,
    useMock = env.useMockData,
    ...rest
  } = options || {};
  return useQuery({
    ...rest,
    enabled: Boolean(enabled),
    queryKey: [productKeys.types.create()],
    queryFn: () =>
      storeClient.products.getTypes({
        params: { useMock },
      }),
    initialData: initialData as ReactQueryUnwrapPromise<
      typeof storeClient.products.getTypes
    >,
  });
};
