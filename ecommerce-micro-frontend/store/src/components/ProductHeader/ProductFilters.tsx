import React, { useMemo } from 'react';
import { Typography, Button, Space, Flex } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import FilterTag from './FilterTag';
import { ProductType } from '../../services/products/types';
import {
  ProductFilterType,
  SpecialFilterConfig,
} from './types';

const { Text } = Typography;

type ProductFiltersProps = {
  specialFilters: SpecialFilterConfig[];
  productTypes: ProductType[];
  selectedTypeId?: string;
  selectedFilter: ProductFilterType;
  onTypeChange?: (typeId: string | undefined) => void;
  onFilterChange?: (filter: ProductFilterType) => void;
  onClearFilters?: () => void;
};

/**
 * ProductFilters Component
 *
 * Single Responsibility: Render filter tags and handle filter interactions
 * Open/Closed Principle: Accepts specialFilters and productTypes as props
 * Interface Segregation: Only receives props needed for filtering
 */
function ProductFilters(props: ProductFiltersProps) {
  const {
    specialFilters,
    productTypes,
    selectedTypeId,
    selectedFilter,
    onTypeChange,
    onFilterChange,
    onClearFilters,
  } = props;

  const hasActiveFilters = useMemo(
    () => selectedTypeId !== undefined || selectedFilter !== 'all',
    [selectedTypeId, selectedFilter]
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap="small">
        <Text strong>Filter by Category</Text>
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

      <Space size={[8, 8]} wrap>
        {specialFilters.map((filter) => (
          <FilterTag
            key={filter.value}
            label={filter.label}
            checked={
              filter.value === 'all'
                ? selectedFilter === filter.value && !selectedTypeId
                : selectedFilter === filter.value
            }
            icon={filter.icon}
            onChange={() => onFilterChange?.(filter.value)}
          />
        ))}
        {productTypes.map((type) => (
          <FilterTag
            key={type.id}
            label={type.name}
            checked={selectedTypeId === type.id}
            onChange={() => {
              const newTypeId = selectedTypeId === type.id ? undefined : type.id;
              onTypeChange?.(newTypeId);
            }}
          />
        ))}
      </Space>
    </Space>
  );
}

export default React.memo(ProductFilters);

