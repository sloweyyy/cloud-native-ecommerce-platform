import React from 'react';
import { Button, Space, Flex, Typography, message } from 'antd';
import {
  ShoppingCartOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import QuantitySelector from './QuantitySelector';

const { Text } = Typography;

type ProductActionsProps = {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onAddToWishlist: () => void;
  canAddToCart: boolean;
  maxQuantity: number;
  isInStock: boolean;
  isLoading?: boolean;
};

function ProductActions(props: ProductActionsProps) {
  const {
    quantity,
    onQuantityChange,
    onAddToCart,
    onBuyNow,
    onAddToWishlist,
    canAddToCart,
    maxQuantity,
    isInStock,
    isLoading = false,
  } = props;

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        message.success('Link copied to clipboard');
      }
    } catch (error) {
      // User cancelled or error occurred - only log if not AbortError
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share failed:', error);
        message.error('Failed to share');
      }
    }
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text strong>Quantity</Text>
          <Flex align="center" gap={16} wrap>
            <QuantitySelector
              value={quantity}
              onChange={onQuantityChange}
              min={1}
              max={maxQuantity}
              disabled={!isInStock}
            />
            <Button
              type="text"
              icon={<HeartOutlined />}
              onClick={onAddToWishlist}
            >
              Add to Wishlist
            </Button>
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              onClick={handleShare}
            >
              Share
            </Button>
          </Flex>
          {maxQuantity > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {maxQuantity} available
            </Text>
          )}
        </Space>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={onAddToCart}
            disabled={!canAddToCart}
            loading={isLoading}
            block
          >
            {isLoading ? 'Adding...' : 'Add to Cart'}
          </Button>
          <Button
            size="large"
            icon={<ThunderboltOutlined />}
            onClick={onBuyNow}
            disabled={!canAddToCart || isLoading}
            block
          >
            Buy Now
          </Button>
        </Space>
      </Space>
    </Space>
  );
}

export default ProductActions;
