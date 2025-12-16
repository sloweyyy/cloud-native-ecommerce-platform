import React from 'react';
import { Tag } from 'antd';
import { BADGE_COLORS, PRODUCT_CARD } from '../../constants/layoutConstants';

type ProductBadgeProps = {
  text: string;
  type: 'new' | 'discount' | 'hot';
};

function ProductBadge(props: ProductBadgeProps) {
  const { text, type } = props;

  const colors = BADGE_COLORS[type] || BADGE_COLORS.default;

  return (
    <Tag
      style={{
        position: 'absolute',
        top: PRODUCT_CARD.BADGE.TOP,
        right: PRODUCT_CARD.BADGE.RIGHT,
        zIndex: PRODUCT_CARD.BADGE.Z_INDEX,
        margin: 0,
        padding: '4px 12px',
        fontSize: PRODUCT_CARD.FONT_SIZE.BADGE,
        fontWeight: PRODUCT_CARD.FONT_WEIGHT.BADGE,
        border: 'none',
        borderRadius: '4px',
        ...colors,
      }}
    >
      {text}
    </Tag>
  );
}

export default ProductBadge;

