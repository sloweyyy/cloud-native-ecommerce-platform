import React, { useState } from 'react';
import { Card, Button, Col } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Product } from '../../services/products';
import ProductCardCover from './ProductCardCover';
import ProductCardMeta from './ProductCardMeta';
import {
  calculateDiscountBadge,
  getProductImageUrl,
} from '../../helpers/productUtils';
import {
  PRODUCT_CARD,
  PRODUCT_CARD_COLORS,
} from '../../constants/layoutConstants';

type ProductCardProps = {
  product: Product;
  onAddToCart: (productId: string, productName: string) => void;
  onViewDetails: (productId: string) => void;
};

function ProductCard(props: ProductCardProps) {
  const { product, onAddToCart, onViewDetails } = props;

  const [isHovered, setIsHovered] = useState(false);

  const badge = calculateDiscountBadge(product);
  const imageUrl = getProductImageUrl(product);

  function handleViewDetails() {
    onViewDetails(product.id);
  }

  function handleAddToCartClick() {
    onAddToCart(product.id, product.name);
  }

  function handleMouseEnter() {
    setIsHovered(true);
  }

  function handleMouseLeave() {
    setIsHovered(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleViewDetails();
    }
  }

  return (
    <Card
      hoverable
      tabIndex={0}
      data-testid="product-card"
      data-product-id={product.id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      cover={
        <ProductCardCover
          imageUrl={imageUrl}
          imageAlt={product.name}
          isHovered={isHovered}
          onViewDetails={handleViewDetails}
          badge={badge}
        />
      }
      styles={{
        body: {
          padding: `${PRODUCT_CARD.PADDING}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: `${PRODUCT_CARD.SPACING.XLARGE}px`,
        },
      }}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: `${PRODUCT_CARD.BORDER_RADIUS}px`,
        overflow: 'hidden',
        border: `1px solid ${PRODUCT_CARD_COLORS.BORDER}`,
        background: PRODUCT_CARD_COLORS.BACKGROUND,
        boxShadow: isHovered
          ? '0 8px 16px rgba(0, 0, 0, 0.08)'
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s ease',
        transform: isHovered
          ? `translateY(-${PRODUCT_CARD.HOVER_LIFT}px)`
          : 'translateY(0)',
      }}
    >
      <ProductCardMeta product={product} />
      <Button
        variant="outlined"
        size="large"
        block
        icon={<ShoppingCartOutlined />}
        style={{
          marginTop: 'auto',
        }}
        onClick={handleAddToCartClick}
      >
        Add to Cart
      </Button>
    </Card>
  );
}

export default ProductCard;
