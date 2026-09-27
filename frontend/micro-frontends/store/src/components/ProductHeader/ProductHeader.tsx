import React, { useCallback } from 'react';
import { Flex, Space, Divider } from 'antd';
import { ProductType, Brand } from '../../services/products/schemas';
import ProductStats from './ProductStats';
import ProductSort from './ProductSort';
import ProductFilters from './ProductFilters';
import { ProductFilterType, SortOption } from './types';
import { SORT_OPTIONS, SPECIAL_FILTERS } from './constants';

// Re-export types for backward compatibility
export type { ProductFilterType, SortOption };

type ProductHeaderProps = {
  productCount: number;
  totalCount: number;
  brands?: Brand[];
  productTypes?: ProductType[];
  selectedBrandId?: string;
  selectedTypeId?: string;
  selectedFilter?: ProductFilterType;
  sortOption?: SortOption;
  onBrandChange?: (brandId: string | undefined) => void;
  onTypeChange?: (typeId: string | undefined) => void;
  onFilterChange?: (filter: ProductFilterType) => void;
  onSortChange?: (sort: SortOption) => void;
};

/**
 * ProductHeader Component
 *
 * SOLID Principles Applied:
 *
 * 1. Single Responsibility Principle (SRP):
 *    - Component only responsible for COMPOSITION and LAYOUT
 *    - Each sub-component has one clear responsibility
 *
 * 2. Open/Closed Principle (OCP):
 *    - Open for extension: Can easily add new filter types or sort options via constants
 *    - Closed for modification: Adding features doesn't require changing this component
 *
 * 3. Liskov Substitution Principle (LSP):
 *    - Sub-components (ProductStats, ProductSort, ProductFilters) can be replaced with
 *      alternative implementations without breaking the parent
 *
 * 4. Interface Segregation Principle (ISP):
 *    - Each sub-component receives only the props it needs
 *    - No component is forced to depend on unused interfaces
 */
function ProductHeader(props: ProductHeaderProps) {
  const {
    productCount,
    totalCount,
    brands = [],
    productTypes = [],
    selectedBrandId,
    selectedTypeId,
    selectedFilter = 'all',
    sortOption = 'default',
    onBrandChange,
    onTypeChange,
    onFilterChange,
    onSortChange,
  } = props;

  const handleClearFilters = useCallback(() => {
    onBrandChange?.(undefined);
    onTypeChange?.(undefined);
  }, [onBrandChange, onTypeChange]);

  return (
    <Space
      direction="vertical"
      size="large"
      style={{ marginBottom: '32px', width: '100%' }}
    >
      {/* Top Section: Product Count and Sort */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <ProductStats productCount={productCount} totalCount={totalCount} />
        <ProductSort
          sortOption={sortOption}
          sortOptions={SORT_OPTIONS}
          onSortChange={onSortChange}
        />
      </Flex>

      <Divider style={{ margin: 0 }} />

      {/* Filter Section */}
      <ProductFilters
        specialFilters={SPECIAL_FILTERS}
        brands={brands}
        productTypes={productTypes}
        selectedBrandId={selectedBrandId}
        selectedTypeId={selectedTypeId}
        selectedFilter={selectedFilter}
        onBrandChange={onBrandChange}
        onTypeChange={onTypeChange}
        onFilterChange={onFilterChange}
        onClearFilters={handleClearFilters}
      />
    </Space>
  );
}

export default React.memo(ProductHeader);
