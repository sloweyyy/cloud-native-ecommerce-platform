import React from 'react';

import { Card, Space } from 'antd';

import BasketItemRow from '../BasketItemRow';
import type { BasketItem } from '../../services/basket/schemas';

type OrderSummaryCardProps = {
  items: BasketItem[];
  onUpdateQuantity: (item: BasketItem, quantity: number) => void;
  onRemove: (productId: string) => void;
};

function OrderSummaryCard(props: OrderSummaryCardProps) {
  const { items, onUpdateQuantity, onRemove } = props;

  return (
    <Card title="Order Summary" style={{ marginBottom: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {items.map((item: BasketItem) => (
          <BasketItemRow
            key={item.productId}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </Space>
    </Card>
  );
}

export default React.memo(OrderSummaryCard);

