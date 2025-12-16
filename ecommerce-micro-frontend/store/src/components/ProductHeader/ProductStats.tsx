import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

type ProductStatsProps = {
  productCount: number;
  totalCount: number;
};

/**
 * ProductStats Component
 * 
 * Single Responsibility: Display product count information
 * This component is responsible ONLY for rendering the product count text.
 */
function ProductStats(props: ProductStatsProps) {
  const { productCount, totalCount } = props;

  return (
    <Text type="secondary">
      Showing <strong>{productCount}</strong> of <strong>{totalCount}</strong>{' '}
      products
    </Text>
  );
}

export default React.memo(ProductStats);

