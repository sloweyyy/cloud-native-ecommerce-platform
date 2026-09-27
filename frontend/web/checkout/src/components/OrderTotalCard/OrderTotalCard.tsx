import React from 'react';

import {
  Card,
  Button,
  Space,
  Typography,
  Divider,
  Flex,
} from 'antd';
import {
  LockOutlined,
  CheckOutlined,
  TagOutlined,
  StarOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

type OrderTotalCardProps = {
  originalTotal: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  totalSavings: number;
  isCheckingOut: boolean;
  onPlaceOrder: () => void;
};

function OrderTotalCard(props: OrderTotalCardProps) {
  const {
    originalTotal,
    subtotal,
    shipping,
    tax,
    total,
    totalSavings,
    isCheckingOut,
    onPlaceOrder,
  } = props;

  return (
    <Card title="Order Total" style={{ position: 'sticky', top: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {totalSavings > 0 && (
          <Flex justify="space-between" style={{ width: '100%' }}>
            <Text>Original Subtotal</Text>
            <Text>${originalTotal.toFixed(2)}</Text>
          </Flex>
        )}
        {totalSavings > 0 && (
          <Flex justify="space-between" style={{ width: '100%' }}>
            <Text type="success" style={{ fontWeight: 600 }}>
              <TagOutlined /> Total Savings
            </Text>
            <Text type="success" style={{ fontWeight: 600 }}>
              -${totalSavings.toFixed(2)}
            </Text>
          </Flex>
        )}
        <Flex justify="space-between" style={{ width: '100%' }}>
          <Text>Subtotal</Text>
          <Text>${subtotal.toFixed(2)}</Text>
        </Flex>
        <Flex justify="space-between" style={{ width: '100%' }}>
          <Text>Shipping</Text>
          <Text>${shipping.toFixed(2)}</Text>
        </Flex>
        <Flex justify="space-between" style={{ width: '100%' }}>
          <Text>Tax</Text>
          <Text>${tax.toFixed(2)}</Text>
        </Flex>
        <Divider style={{ margin: '8px 0' }} />
        <Flex justify="space-between" style={{ width: '100%' }}>
          <Text strong style={{ fontSize: 18 }}>
            Total
          </Text>
          <Text strong type="success" style={{ fontSize: 18 }}>
            ${total.toFixed(2)}
          </Text>
        </Flex>
        {totalSavings > 0 && (
          <Card
            size="small"
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              border: 'none',
              color: 'white',
            }}
          >
            <Flex align="center" justify="center" gap="small">
              <StarOutlined style={{ fontSize: 16 }} />
              <Text strong style={{ color: 'white', fontSize: 14 }}>
                You're saving ${totalSavings.toFixed(2)}!
              </Text>
            </Flex>
          </Card>
        )}
        <Button
          type="primary"
          size="large"
          block
          icon={<CheckOutlined />}
          loading={isCheckingOut}
          onClick={onPlaceOrder}
        >
          Place Order
        </Button>
        <Card
          size="small"
          style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}
        >
          <Space>
            <LockOutlined style={{ fontSize: 20 }} />
            <Space direction="vertical" size={0}>
              <Text strong style={{ fontSize: 12 }}>
                Secure Checkout
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Your information is protected with SSL encryption
              </Text>
            </Space>
          </Space>
        </Card>
      </Space>
    </Card>
  );
}

export default React.memo(OrderTotalCard);

