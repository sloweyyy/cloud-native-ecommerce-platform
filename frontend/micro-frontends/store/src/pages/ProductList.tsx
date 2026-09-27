import React, { useMemo, useCallback } from 'react';
import { message, Pagination, Space, Flex } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetProducts,
  useGetTypes,
  useGetBrands,
} from '../services/products/hooks';
import {
  Product,
  ProductType,
  Brand,
  PaginatedProducts,
} from '../services/products/schemas';
import { useAddToCart } from '../services/basket';
import {
  ProductHeader,
  ProductGrid,
  LoadingState,
  ErrorState,
} from '../components/ProductList';
import { ProductFilterType, SortOption } from '../components/ProductList/types';
import type { ProductListSearch } from '../typings/search';
import { useProductListFilters } from '../hooks/useProductListFilters';

const PAGE_SIZE = 10;

function ProductList() {
  const navigate = useNavigate();

  const { data: productTypes } = useGetTypes();
  const { data: brands } = useGetBrands();

  const typedProductTypes = (productTypes ?? null) as ProductType[] | null;
  const typedBrands = (brands ?? null) as Brand[] | null;

  const {
    selectedFilter,
    sortOption,
    currentPage,
    selectedBrandId,
    selectedTypeId,
    params,
    updateSearch,
  } = useProductListFilters({ productTypes: typedProductTypes });

  const { data: paginatedProducts, isLoading, error } = useGetProducts(params);

  const typedPaginatedProducts = paginatedProducts as
    | PaginatedProducts
    | null
    | undefined;

  const addToCartMutation = useAddToCart();

  const products = useMemo(() => {
    return typedPaginatedProducts?.data || [];
  }, [typedPaginatedProducts]);

  const productCount = products.length;
  const totalCount = typedPaginatedProducts?.count || 0;

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
          originalPrice: product.price,
          quantity: 1,
          imageFile: product.imageFile ?? null,
        });

        message.success(`${productName} added to cart!`);
      } catch {
        message.error('Failed to add item to cart');
      }
    },
    [products, addToCartMutation]
  );

  function handleViewDetails(productId: string) {
    navigate({ to: '/product/$id', params: { id: productId } });
  }

  const handleBrandChange = useCallback(
    (brandId: string | undefined) => {
      updateSearch({ brandId, page: undefined });
    },
    [updateSearch]
  );

  const handleTypeChange = useCallback(
    (typeId: string | undefined) => {
      updateSearch({ typeId, cat: undefined, page: undefined });
    },
    [updateSearch]
  );

  const handleFilterChange = useCallback(
    (filter: ProductFilterType) => {
      const updates: Record<string, unknown> = {
        brandId: undefined,
        typeId: undefined,
        cat: undefined,
        page: undefined,
      };

      if (filter === 'all') {
        updates.filter = undefined;
      } else {
        updates.filter = filter;
      }

      updateSearch(updates as Partial<ProductListSearch>);
    },
    [updateSearch]
  );

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      updateSearch({
        sort: sort === 'default' ? undefined : sort,
        page: undefined,
      });
    },
    [updateSearch]
  );

  function handlePageChange(page: number) {
    updateSearch({ page: page === 1 ? undefined : page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const productHeaderProps = useMemo(
    () => ({
      productCount: products.length > 0 ? productCount : 0,
      totalCount: products.length > 0 ? totalCount : 0,
      brands: typedBrands || undefined,
      productTypes: typedProductTypes || undefined,
      selectedBrandId,
      selectedTypeId,
      selectedFilter,
      sortOption,
      onBrandChange: handleBrandChange,
      onTypeChange: handleTypeChange,
      onFilterChange: handleFilterChange,
      onSortChange: handleSortChange,
    }),
    [
      productCount,
      totalCount,
      typedBrands,
      typedProductTypes,
      selectedBrandId,
      selectedTypeId,
      selectedFilter,
      sortOption,
      handleBrandChange,
      handleTypeChange,
      handleFilterChange,
      handleSortChange,
      products.length,
    ]
  );

  if (error) {
    return <ErrorState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!products || products.length === 0) {
    return (
      <Space
        direction="vertical"
        size="large"
        style={{ width: '100%', padding: '24px' }}
      >
        <ProductHeader {...productHeaderProps} />
      </Space>
    );
  }

  return (
    <Space
      direction="vertical"
      size="large"
      style={{ width: '100%', padding: '24px' }}
    >
      <ProductHeader {...productHeaderProps} />
      <ProductGrid
        products={products}
        onAddToCart={handleAddToCart}
        onViewDetails={handleViewDetails}
      />
      {totalCount > PAGE_SIZE && (
        <Flex justify="center" style={{ marginTop: '32px' }}>
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
        </Flex>
      )}
    </Space>
  );
}

export default ProductList;
