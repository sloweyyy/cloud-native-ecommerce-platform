import { useMemo } from 'react';
import { useGetProducts } from '../services/products/hooks';
import { Product, PaginatedProducts } from '../services/products/schemas';

type UseRelatedProductsReturn = {
  relatedProducts: Product[];
  isLoading: boolean;
  isError: boolean;
};

export function useRelatedProducts(
  relatedProductIds: string[] | undefined,
  limit = 4
): UseRelatedProductsReturn {
  const {
    data: paginatedData,
    isLoading,
    isError,
  } = useGetProducts(
    {
      // No filters, just fetch all products
    },
    {
      enabled: !!relatedProductIds && relatedProductIds.length > 0,
    }
  );

  const typedPaginatedData = paginatedData as PaginatedProducts | null | undefined;

  const relatedProducts = useMemo(() => {
    if (!relatedProductIds || !typedPaginatedData?.data) {
      return [];
    }

    const allProducts = typedPaginatedData.data;
    const filtered = allProducts.filter((product: Product) =>
      relatedProductIds.includes(product.id)
    );

    // Sort to maintain order of relatedProductIds
    const sorted = relatedProductIds
      .map((id) => filtered.find((p: Product) => p.id === id))
      .filter((product): product is Product => product !== undefined);

    return sorted.slice(0, limit);
  }, [relatedProductIds, typedPaginatedData, limit]);

  return {
    relatedProducts,
    isLoading,
    isError,
  };
}

