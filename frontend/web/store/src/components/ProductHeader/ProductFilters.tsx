import React, { useMemo } from 'react';
import { Typography, Button, Space, Flex, Select } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { ProductType, Brand } from '../../services/products/schemas';
import { ProductFilterType, SpecialFilterConfig } from './types';

const { Text } = Typography;

type ProductFiltersProps = {
  specialFilters: SpecialFilterConfig[];
  brands?: Brand[];
  productTypes?: ProductType[];
  selectedBrandId?: string;
  selectedTypeId?: string;
  selectedFilter: ProductFilterType;
  onBrandChange?: (brandId: string | undefined) => void;
  onTypeChange?: (typeId: string | undefined) => void;
  onFilterChange?: (filter: ProductFilterType) => void;
  onClearFilters?: () => void;
};

/**
 * ProductFilters Component
 *
 * Single Responsibility: Render filter tags and dropdowns for filtering products
 * Open/Closed Principle: Accepts brands and productTypes as props
 * Interface Segregation: Only receives props needed for filtering
 */
function ProductFilters(props: ProductFiltersProps) {
  const {
    specialFilters,
    brands = [],
    productTypes = [],
    selectedBrandId,
    selectedTypeId,
    selectedFilter,
    onBrandChange,
    onTypeChange,
    onFilterChange,
    onClearFilters,
  } = props;

  const hasActiveFilters = useMemo(
    () => selectedBrandId !== undefined || selectedTypeId !== undefined,
    [selectedBrandId, selectedTypeId]
  );

  const brandOptions = useMemo(
    () => brands.map((brand) => ({ label: brand.name, value: brand.id })),
    [brands]
  );

  const typeOptions = useMemo(
    () => productTypes.map((type) => ({ label: type.name, value: type.id })),
    [productTypes]
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap="small">
        <Text strong>Filters</Text>
        {hasActiveFilters && (
          <Button
            type="text"
            size="small"
            icon={<ClearOutlined />}
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        )}
      </Flex>

      <Space size="middle" wrap style={{ width: '100%' }}>
        <Select
          placeholder="Filter by Brand"
          allowClear
          style={{ minWidth: 200 }}
          value={selectedBrandId}
          onChange={(value) => onBrandChange?.(value)}
          options={brandOptions}
          notFoundContent={<Text type="secondary">No brands available</Text>}
        />
        <Select
          placeholder="Filter by Type"
          allowClear
          style={{ minWidth: 200 }}
          value={selectedTypeId}
          onChange={(value) => onTypeChange?.(value)}
          options={typeOptions}
          notFoundContent={<Text type="secondary">No types available</Text>}
        />
      </Space>
    </Space>
  );
}

export default React.memo(ProductFilters);
