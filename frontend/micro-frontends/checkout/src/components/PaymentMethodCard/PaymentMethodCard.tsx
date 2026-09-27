import React from 'react';

import { Card, Radio, Space, Typography } from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

type PaymentMethodCardProps = {
  paymentMethod: number;
  onPaymentMethodChange: (method: number) => void;
};

function PaymentMethodCard(props: PaymentMethodCardProps) {
  const { paymentMethod, onPaymentMethodChange } = props;

  return (
    <Card title="Payment Method">
      <Radio.Group
        value={paymentMethod}
        onChange={(e) => onPaymentMethodChange(e.target.value)}
        style={{ width: '100%' }}
      >
        <Space
          direction="vertical"
          size="middle"
          style={{ width: '100%' }}
        >
          <Radio value={0}>
            <Space>
              <DollarOutlined style={{ fontSize: 20 }} />
              <Space direction="vertical" size={0}>
                <Text strong>Cash on Delivery</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Pay when you receive your order
                </Text>
              </Space>
            </Space>
          </Radio>
          <Radio value={1}>
            <Space>
              <CreditCardOutlined style={{ fontSize: 20 }} />
              <Space direction="vertical" size={0}>
                <Text strong>Credit/Debit Card</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Pay securely with your card
                </Text>
              </Space>
            </Space>
          </Radio>
          <Radio value={2}>
            <Space>
              <BankOutlined style={{ fontSize: 20 }} />
              <Space direction="vertical" size={0}>
                <Text strong>Bank Transfer</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Pay via direct bank transfer
                </Text>
              </Space>
            </Space>
          </Radio>
        </Space>
      </Radio.Group>
    </Card>
  );
}

export default React.memo(PaymentMethodCard);

