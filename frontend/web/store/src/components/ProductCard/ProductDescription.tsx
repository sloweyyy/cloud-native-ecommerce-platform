import React from 'react';
import { Typography } from 'antd';
import { Product } from '../../services/products';
import {
  PRODUCT_CARD,
  PRODUCT_CARD_COLORS,
} from '../../constants/layoutConstants';

const { Text } = Typography;

type ProductDescriptionProps = {
  description: Product['description'];
};

function ProductDescription(props: ProductDescriptionProps) {
  const { description } = props;

  return (
    <Text
      type="secondary"
      style={{
        fontSize: PRODUCT_CARD.FONT_SIZE.DESCRIPTION,
        lineHeight: `${PRODUCT_CARD.LINE_HEIGHT.DESCRIPTION}px`,
        color: PRODUCT_CARD_COLORS.DESCRIPTION,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        height: `${PRODUCT_CARD.DESCRIPTION_HEIGHT}px`,
      }}
    >
      {description}
    </Text>
  );
}

export default ProductDescription;

