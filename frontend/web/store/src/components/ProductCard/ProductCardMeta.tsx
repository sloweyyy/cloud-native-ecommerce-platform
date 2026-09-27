import React from 'react';
import { Space, Typography } from 'antd';
import { Product } from '../../services/products';
import ProductPrice from './ProductPrice';
import ProductDescription from './ProductDescription';
import ProductRating from './ProductRating';
import { hasRating } from '../../helpers/productUtils';
import {
  PRODUCT_CARD,
  PRODUCT_CARD_COLORS,
} from '../../constants/layoutConstants';

const { Title } = Typography;

type ProductCardMetaProps = {
  product: Product;
};

function ProductCardMeta(props: ProductCardMetaProps) {
  const { product } = props;

  return (
    <Space
      direction="vertical"
      size={PRODUCT_CARD.SPACING.LARGE}
      style={{ width: '100%' }}
    >
      <ProductPrice product={product} />

      <Title
        level={5}
        data-testid="product-name"
        style={{
          margin: 0,
          fontSize: PRODUCT_CARD.FONT_SIZE.TITLE,
          fontWeight: PRODUCT_CARD.FONT_WEIGHT.TITLE,
          color: PRODUCT_CARD_COLORS.TITLE,
          lineHeight: `${PRODUCT_CARD.LINE_HEIGHT.TITLE}px`,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          height: `${PRODUCT_CARD.TITLE_HEIGHT}px`,
        }}
      >
        {product.name}
      </Title>


      <ProductDescription description={product.description} />
    </Space>
  );
}

export default ProductCardMeta;

