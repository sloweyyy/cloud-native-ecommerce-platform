import React, { useMemo } from 'react';
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

  const discountPercentage = useMemo(() => {
    if (!originalPrice) {
      return 0;
    }
    return calculateDiscountPercentage(originalPrice, price);
  }, [originalPrice, price]);

  const hasDiscount = discountPercentage > 0;
  const savingsAmount = useMemo(() => {
    if (!hasDiscount || !originalPrice) {
      return 0;
    }
    return originalPrice - price;
  }, [hasDiscount, originalPrice, price]);

  return (
    <Space direction="vertical" size="small">
      <Space size="middle" align="baseline">
        <Title level={2}>{formatCurrency(price)}</Title>
        {hasDiscount && originalPrice && (
          <>
            <Text delete type="secondary">
              {formatCurrency(originalPrice)}
            </Text>
            <Tag color="red">-{discountPercentage}%</Tag>
          </>
        )}
      </Space>
      {hasDiscount && (
        <Text type="secondary">You save {formatCurrency(savingsAmount)}</Text>
      )}
    </Space>
  );
}

export default ProductPrice;
