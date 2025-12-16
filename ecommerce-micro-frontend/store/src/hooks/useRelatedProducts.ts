import { useMemo } from 'react';
import { useGetProducts } from '../services/products/hooks';
import { Product } from '../services/products/types';

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

  const relatedProducts = useMemo(() => {
    if (!relatedProductIds || !paginatedData) {
      return [];
    }

    const allProducts = paginatedData.data;
    const filtered = allProducts.filter((product: Product) =>
      relatedProductIds.includes(product.id)
    );

    // Sort to maintain order of relatedProductIds
    const sorted = relatedProductIds
      .map((id) => filtered.find((p: Product) => p.id === id))
      .filter((product): product is Product => product !== undefined);

    return sorted.slice(0, limit);
  }, [relatedProductIds, paginatedData, limit]);

  return {
    relatedProducts,
    isLoading,
    isError,
  };
}

