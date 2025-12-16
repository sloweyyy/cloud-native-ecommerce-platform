import React from 'react';
import { Tag } from 'antd';
import { StockStatus } from '../../services/products/types';

type StockConfig = {
  label: string;
  color: 'success' | 'warning' | 'error';
};

const STOCK_CONFIG: Record<StockStatus, StockConfig> = {
  'in-stock': {
    label: 'In Stock',
    color: 'success',
  },
  'low-stock': {
    label: 'Low Stock',
    color: 'warning',
  },
  'out-of-stock': {
    label: 'Out of Stock',
    color: 'error',
  },
};

type ProductStockBadgeProps = {
  stockStatus: StockStatus;
};

function ProductStockBadge(props: ProductStockBadgeProps) {
  const { stockStatus } = props;
  const stockConfig = STOCK_CONFIG[stockStatus];

  return <Tag color={stockConfig.color}>{stockConfig.label}</Tag>;
}

export default ProductStockBadge;
