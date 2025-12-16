import React, { useMemo, useCallback } from 'react';
import { message, Pagination } from 'antd';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import { useGetProducts, useGetTypes } from '../services/products/hooks';
import { StoreParamsInput, Product, ProductType } from '../services/products';
import { useAddToCart } from '../services/basket';
import {
  ProductHeader,
  ProductGrid,
  LoadingState,
  ErrorState,
  ProductFilterType,
  SortOption,
} from '../components/ProductList';
import type { ProductListSearch } from '../typings/search';

type ProductListProps = {
  config?: AppInjectorProps['config'];
};

const PAGE_SIZE = 10;

const ProductList: React.FC<ProductListProps> = ({ config }) => {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as ProductListSearch;
  const { onError } = config || {};

  const { data: productTypes } = useGetTypes();

  // Derive filter values directly from URL (single source of truth)
  const selectedFilter = (searchParams?.filter ?? 'all') as ProductFilterType;
  const sortOption = (searchParams?.sort ?? 'default') as SortOption;
  const currentPage = searchParams?.page ?? 1;

  // Resolve typeId: use typeId directly, or lookup from cat name
  const selectedTypeId = useMemo(() => {
    if (searchParams?.typeId) {
      return searchParams.typeId;
    }
    if (searchParams?.cat && productTypes) {
      const matchingType = productTypes.find(
        (type: ProductType) =>
          type.name.toLowerCase() === searchParams.cat?.toLowerCase()
      );
      return matchingType?.id;
    }
    return undefined;
  }, [searchParams?.typeId, searchParams?.cat, productTypes]);

  const params = useMemo<StoreParamsInput>(() => {
    const baseParams: StoreParamsInput = {
      page: currentPage,
      limit: PAGE_SIZE,
    };

    if (selectedTypeId) {
      baseParams.TypeId = selectedTypeId;
    }

    if (sortOption !== 'default') {
      baseParams.Sort = sortOption;
    }

    return baseParams;
  }, [selectedTypeId, sortOption, currentPage]);

  const { data: paginatedProducts, isLoading, error } = useGetProducts(params);

  const addToCartMutation = useAddToCart();

  const products = useMemo(() => {
    return paginatedProducts?.data || [];
  }, [paginatedProducts]);

  const productCount = useMemo(() => {
    return products.length;
  }, [products]);

  const totalCount = useMemo(() => {
    return paginatedProducts?.count || 0;
  }, [paginatedProducts]);

  const handleAddToCart = useCallback(
    async (productId: string, productName: string) => {
      const product = products.find((p: Product) => p.id === productId);

      if (!product) {
        message.error('Product not found');
        return;
      }

      try {
        await addToCartMutation.mutateAsync({
          productId: product.id,
          productName: product.name,
          price: product.price,
          originalPrice: product.originalPrice ?? product.price,
          quantity: 1,
          imageFile: product.imageFile ?? null,
        });

        message.success(`${productName} added to cart!`);
      } catch (err) {
        if (onError) {
          onError(err as Error);
        } else {
          message.error('Failed to add item to cart');
        }
      }
    },
    [products, addToCartMutation, onError]
  );

  function handleViewDetails(productId: string) {
    navigate({ to: '/product/$id', params: { id: productId } });
  }

  // Navigate with search params - URL is the source of truth
  function handleTypeChange(typeId: string | undefined) {
    navigate({
      to: '/',
      search: {
        typeId,
        cat: undefined,
        filter: undefined,
        sort: searchParams?.sort,
        page: undefined,
      },
    });
  }

  function handleFilterChange(filter: ProductFilterType) {
    // When selecting 'all', clear all filters (including typeId/cat)
    // When selecting a special filter (new-arrivals, best-seller), clear typeId/cat
    navigate({
      to: '/',
      search: {
        filter: filter === 'all' ? undefined : filter,
        typeId: undefined, // Always clear typeId when changing filter
        cat: undefined, // Always clear cat when changing filter
        sort: searchParams?.sort,
        page: undefined,
      },
    });
  }

  function handleSortChange(sort: SortOption) {
    navigate({
      to: '/',
      search: {
        ...searchParams,
        sort: sort === 'default' ? undefined : sort,
        page: undefined,
      },
    });
  }

  function handlePageChange(page: number) {
    navigate({
      to: '/',
      search: {
        ...searchParams,
        page: page === 1 ? undefined : page,
      },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (error) {
    return <ErrorState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!products || products.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <ProductHeader
          productCount={0}
          totalCount={0}
          productTypes={productTypes || undefined}
          selectedTypeId={selectedTypeId}
          selectedFilter={selectedFilter}
          sortOption={sortOption}
          onTypeChange={handleTypeChange}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <ProductHeader
        productCount={productCount}
        totalCount={totalCount}
        productTypes={productTypes || undefined}
        selectedTypeId={selectedTypeId}
        selectedFilter={selectedFilter}
        sortOption={sortOption}
        onTypeChange={handleTypeChange}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
      />
      <ProductGrid
        products={products}
        onAddToCart={handleAddToCart}
        onViewDetails={handleViewDetails}
      />
      {totalCount > PAGE_SIZE && (
        <div
          style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}
        >
          <Pagination
            current={currentPage}
            pageSize={PAGE_SIZE}
            total={totalCount}
            onChange={handlePageChange}
            showSizeChanger={false}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} products`
            }
          />
        </div>
      )}
    </div>
  );
};

export default ProductList;
