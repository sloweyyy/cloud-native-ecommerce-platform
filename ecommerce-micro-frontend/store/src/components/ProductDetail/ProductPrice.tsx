import React from 'react';
import { Typography, Space, Tag } from 'antd';
import { formatCurrency } from '../../helpers/formatUtils';
import { calculateDiscountPercentage } from '../../helpers/productUtils';

const { Title, Text } = Typography;

type ProductPriceProps = {
  price: number;
  originalPrice?: number;
};

function ProductPrice(props: ProductPriceProps) {
  const { price, originalPrice } = props;

  const discountPercentage = originalPrice
    ? calculateDiscountPercentage(originalPrice, price)
    : 0;

  const hasDiscount = discountPercentage > 0;

  return (
    <div>
      <Space size="middle" align="baseline">
        <Title level={2}>{formatCurrency(price)}</Title>
        {hasDiscount && originalPrice && (
          <>
            <Text delete type="secondary" style={{ fontSize: 18 }}>
              {formatCurrency(originalPrice)}
            </Text>
            <Tag color="red">-{discountPercentage}%</Tag>
          </>
        )}
      </Space>
      {hasDiscount && originalPrice && (
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">
            You save {formatCurrency(originalPrice - price)}
          </Text>
        </div>
      )}
    </div>
  );
}

export default ProductPrice;
