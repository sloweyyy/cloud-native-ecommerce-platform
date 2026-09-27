import { useMemo, useCallback } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ProductType } from '../services/products/schemas';
import { StoreParamsInput } from '../services/products/input';
import type { ProductListSearch } from '../typings/search';
import { ProductFilterType, SortOption } from '../components/ProductList';

const PAGE_SIZE = 10;

interface UseProductListFiltersOptions {
  productTypes?: ProductType[] | null;
}

interface UseProductListFiltersReturn {
  selectedFilter: ProductFilterType;
  sortOption: SortOption;
  currentPage: number;
  selectedBrandId?: string;
  selectedTypeId?: string;
  params: StoreParamsInput;
  updateSearch: (updates: Partial<ProductListSearch>) => void;
}

export function useProductListFilters(
  options: UseProductListFiltersOptions = {}
): UseProductListFiltersReturn {
  const { productTypes } = options;
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as ProductListSearch;

  // Derived state - read directly from URL
  const selectedFilter = (searchParams?.filter ?? 'all') as ProductFilterType;
  const sortOption = (searchParams?.sort ?? 'default') as SortOption;
  const currentPage = searchParams?.page ?? 1;
  const selectedBrandId = searchParams?.brandId;

  // Resolve typeId: use typeId directly, or lookup from cat name
  const selectedTypeId = useMemo(() => {
    if (searchParams?.typeId) {
      return searchParams.typeId;
    }
    if (searchParams?.cat && productTypes) {
      const matchingType = productTypes.find(
        (type) => type.name.toLowerCase() === searchParams.cat?.toLowerCase()
      );
      return matchingType?.id;
    }
    return undefined;
  }, [searchParams?.typeId, searchParams?.cat, productTypes]);

  // Transform search params to API params
  const params = useMemo<StoreParamsInput>(() => {
    const baseParams: StoreParamsInput = {
      page: currentPage,
      limit: PAGE_SIZE,
    };

    if (selectedBrandId) {
      baseParams.BrandId = selectedBrandId;
    }

    if (selectedTypeId) {
      baseParams.TypeId = selectedTypeId;
    }

    if (sortOption !== 'default') {
      baseParams.Sort = sortOption;
    }

    return baseParams;
  }, [selectedBrandId, selectedTypeId, sortOption, currentPage]);

  // Simple handler - use spread pattern like ucm-ui
  const updateSearch = useCallback(
    (updates: Partial<ProductListSearch>) => {
      navigate({
        to: '/',
        search: { ...searchParams, ...updates },
      });
    },
    [navigate, searchParams]
  );

  return {
    selectedFilter,
    sortOption,
    currentPage,
    selectedBrandId,
    selectedTypeId,
    params,
    updateSearch,
  };
}
