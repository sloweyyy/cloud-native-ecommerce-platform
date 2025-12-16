import React from 'react';
import { Typography, Space } from 'antd';
import { Product } from '../../services/products';
import { formatCurrency } from '../../helpers/formatUtils';
import {
  PRODUCT_CARD,
  PRODUCT_CARD_COLORS,
} from '../../constants/layoutConstants';

const { Text } = Typography;

type ProductPriceProps = {
  product: Product;
};

function ProductPrice(props: ProductPriceProps) {
  const { product } = props;

  const hasDiscount = product.hasDiscount && product.originalPrice;

  return (
    <Space
      direction="vertical"
      size={PRODUCT_CARD.SPACING.SMALL}
      style={{ width: '100%' }}
    >
      <Space size={PRODUCT_CARD.SPACING.MEDIUM} align="center">
        <Text
          strong
          style={{
            fontSize: PRODUCT_CARD.FONT_SIZE.PRICE,
            fontWeight: PRODUCT_CARD.FONT_WEIGHT.PRICE,
            color: PRODUCT_CARD_COLORS.PRICE,
            lineHeight: `${PRODUCT_CARD.LINE_HEIGHT.PRICE}px`,
          }}
        >
          {formatCurrency(product.price)}
        </Text>
        {hasDiscount && product.originalPrice && (
          <Text
            delete
            type="secondary"
            style={{
              fontSize: PRODUCT_CARD.FONT_SIZE.ORIGINAL_PRICE,
              color: PRODUCT_CARD_COLORS.ORIGINAL_PRICE,
            }}
          >
            {formatCurrency(product.originalPrice)}
          </Text>
        )}
      </Space>
    </Space>
  );
}

export default ProductPrice;
