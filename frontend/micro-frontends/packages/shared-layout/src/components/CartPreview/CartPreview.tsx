import React from 'react';
import {
  Card,
  Button,
  Empty,
  Spin,
  Typography,
  Flex,
} from 'antd';
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { brandGradient } from '../../constants/theme';
import { useNavigate } from '../../utils/navigation-handler';

const { Text } = Typography;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartPreviewProps {
  visible: boolean;
  items?: CartItem[];
  isLoading?: boolean;
  onRemoveItem?: (id: string) => void;
  appName?: string;
  /** API base URL for image paths */
  apiBaseUrl?: string;
}

/**
 * Format currency for display
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Get full image URL from relative path
 */
function getImageUrl(imagePath: string | null | undefined, apiBaseUrl?: string): string {
  if (!imagePath) {
    return '/assets/placeholder-product.png';
  }

  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If starts with /, it's already an absolute path
  if (imagePath.startsWith('/')) {
    return apiBaseUrl ? `${apiBaseUrl}${imagePath}` : imagePath;
  }

  // Otherwise, prepend the base URL
  return apiBaseUrl ? `${apiBaseUrl}/${imagePath}` : `/${imagePath}`;
}

/**
 * Single cart item row component
 */
function CartItemRow({
  item,
  onRemove,
  apiBaseUrl,
}: {
  item: CartItem;
  onRemove: () => void;
  apiBaseUrl?: string;
}) {
  const itemTotal = item.price * item.quantity;

  return (
    <Flex
      gap={12}
      align="flex-start"
      style={{
        padding: '12px 0',
        borderBottom: '1px solid #f1f5f9',
      }}
    >
      {/* Product Image */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 8,
          overflow: 'hidden',
          flexShrink: 0,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
      >
        <img
          src={getImageUrl(item.image, apiBaseUrl)}
          alt={item.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/assets/placeholder-product.png';
          }}
        />
      </div>

      {/* Product Info */}
      <Flex vertical flex={1} style={{ minWidth: 0 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.3,
            color: '#1e293b',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: 4,
          }}
        >
          {item.name}
        </Text>

        <Flex align="center" gap={8}>
          <Text
            style={{
              fontSize: 12,
              color: '#64748b',
            }}
          >
            {formatPrice(item.price)} × {item.quantity}
          </Text>
        </Flex>
      </Flex>

      {/* Price & Remove */}
      <Flex vertical align="flex-end" gap={4}>
        <Text
          strong
          style={{
            fontSize: 14,
            color: brandGradient.start,
            whiteSpace: 'nowrap',
          }}
        >
          {formatPrice(itemTotal)}
        </Text>
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={onRemove}
          style={{
            color: '#94a3b8',
            padding: '2px 6px',
            height: 'auto',
          }}
          aria-label={`Remove ${item.name}`}
        />
      </Flex>
    </Flex>
  );
}

const CartPreview: React.FC<CartPreviewProps> = ({
  visible,
  items = [],
  isLoading = false,
  onRemoveItem,
  appName,
  apiBaseUrl,
}) => {
  const navigate = useNavigate(appName);

  if (!visible) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card
      style={{
        position: 'absolute',
        top: 'calc(100% + 12px)',
        right: 0,
        width: 360,
        borderRadius: 16,
        boxShadow: '0 12px 40px rgba(15, 23, 42, 0.15)',
        zIndex: 1002,
        border: 'none',
        overflow: 'hidden',
      }}
      styles={{
        header: {
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          background: '#fafbfc',
          minHeight: 'auto',
        },
        body: {
          padding: 0,
        },
      }}
      title={
        <Flex align="center" gap={8}>
          <ShoppingCartOutlined
            style={{
              fontSize: 18,
              color: brandGradient.start,
            }}
          />
          <Text strong style={{ fontSize: 15 }}>
            Cart
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: '#64748b',
              fontWeight: 400,
            }}
          >
            ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
          </Text>
        </Flex>
      }
    >
      {isLoading ? (
        <Flex
          justify="center"
          align="center"
          style={{ padding: '48px 20px' }}
        >
          <Spin tip="Loading..." />
        </Flex>
      ) : items.length === 0 ? (
        <Flex
          vertical
          align="center"
          justify="center"
          style={{ padding: '40px 20px' }}
        >
          <Empty
            description={
              <Text style={{ color: '#94a3b8' }}>Your cart is empty</Text>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Button
            type="link"
            onClick={() => navigate('/store')}
            style={{ marginTop: 8 }}
          >
            Start Shopping <RightOutlined />
          </Button>
        </Flex>
      ) : (
        <>
          {/* Cart Items - scrollable */}
          <div
            style={{
              maxHeight: 280,
              overflowY: 'auto',
              padding: '8px 20px',
            }}
          >
            {items.slice(0, 5).map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onRemove={() => onRemoveItem?.(item.id)}
                apiBaseUrl={apiBaseUrl}
              />
            ))}

            {/* Show "more items" if > 5 */}
            {items.length > 5 && (
              <Text
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px 0',
                  color: '#64748b',
                  fontSize: 13,
                }}
              >
                +{items.length - 5} more items in cart
              </Text>
            )}
          </div>

          {/* Footer - Subtotal & Actions */}
          <div
            style={{
              padding: '16px 20px',
              background: '#f8fafc',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#64748b' }}>Subtotal:</Text>
              <Text
                strong
                style={{
                  fontSize: 18,
                  color: brandGradient.start,
                }}
              >
                {formatPrice(totalAmount)}
              </Text>
            </Flex>

            <Button
              type="primary"
              size="middle"
              block
              onClick={() => navigate('/checkout')}
              style={{
                height: 42,
                fontWeight: 600,
                borderRadius: 10,
              }}
            >
              Checkout
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default CartPreview;

