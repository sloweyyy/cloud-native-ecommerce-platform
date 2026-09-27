import React from 'react';
import { Button, Flex } from 'antd';
import { ShoppingOutlined, EyeOutlined } from '@ant-design/icons';
import ProductBadge from './ProductBadge';
import {
  PRODUCT_CARD,
  PRODUCT_CARD_COLORS,
} from '../../constants/layoutConstants';

type ProductCardCoverProps = {
  imageUrl?: string;
  imageAlt?: string;
  isHovered: boolean;
  onViewDetails: () => void;
  badge?: {
    text: string;
    type: 'new' | 'discount' | 'hot';
  };
};

function ProductCardCover(props: ProductCardCoverProps) {
  const { imageUrl, imageAlt, isHovered, onViewDetails, badge } = props;

  function handleViewDetailsClick(e: React.MouseEvent) {
    e.stopPropagation();
    onViewDetails();
  }

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: '100%',
        height: PRODUCT_CARD.COVER_HEIGHT,
        background: PRODUCT_CARD_COLORS.COVER_BACKGROUND,
        position: 'relative',
        overflow: 'hidden',
      }}
      data-testid="product-cover"
    >
      {badge && <ProductBadge text={badge.text} type={badge.type} />}

      {imageUrl ? (
        <img
          src={imageUrl}
          alt={imageAlt || 'Product image'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Flex
          align="center"
          justify="center"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <ShoppingOutlined
            style={{
              fontSize: 80,
              color: PRODUCT_CARD_COLORS.ICON_PLACEHOLDER,
            }}
          />
        </Flex>
      )}

      {isHovered && (
        <Flex
          align="center"
          justify="center"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: PRODUCT_CARD_COLORS.HOVER_OVERLAY,
            backdropFilter: 'blur(4px)',
            zIndex: 2,
          }}
        >
          <Button
            variant="filled"
            type="primary"
            size="large"
            color="primary"
            icon={<EyeOutlined />}
            onClick={handleViewDetailsClick}
            aria-label="View product details"
            data-testid="view-detail-button"
            style={{
              fontWeight: 600,
              fontSize: '16px',
            }}
          >
            View Details
          </Button>
        </Flex>
      )}
    </Flex>
  );
}

export default ProductCardCover;
