import React from 'react';
import { Typography, Select, Flex } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { SortOption, SortOptionConfig } from './types';

const { Text } = Typography;

type ProductSortProps = {
  sortOption: SortOption;
  sortOptions: SortOptionConfig[];
  onSortChange?: (value: SortOption) => void;
};

/**
 * ProductSort Component
 * 
 * Single Responsibility: Render sorting dropdown and handle sort changes
 * Open/Closed Principle: Accepts sortOptions as props, easy to extend without modification
 */
function ProductSort(props: ProductSortProps) {
  const { sortOption, sortOptions, onSortChange } = props;

  return (
    <Flex align="center" gap="small">
      <Text type="secondary">Sort by:</Text>
      <Select
        value={sortOption}
        onChange={onSortChange}
        style={{ minWidth: 200 }}
        suffixIcon={<DownOutlined />}
        options={sortOptions}
      />
    </Flex>
  );
}

export default React.memo(ProductSort);

