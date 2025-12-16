import React from 'react';
import { Card, Space, Typography } from 'antd';
import { getCouponIcon } from '../constants/couponConfig';
import { couponBrandTokens } from '../styles/coupon-tokens';

const { Text } = Typography;

interface CouponCodeCardProps {
  code: string;
}

function CouponCodeCard(props: CouponCodeCardProps) {
  // Props destructuring
  const { code } = props;

  return (
    <Card
      style={{
        background: '#f8f8f8',
        border: `2px dashed ${couponBrandTokens.brandPrimary}`,
      }}
    >
      <Space direction="vertical" align="center" style={{ width: '100%' }}>
        <Space align="center">
          {getCouponIcon()}
          <Text copyable strong style={{ fontSize: 20, letterSpacing: 2 }}>
            {code.toUpperCase()}
          </Text>
        </Space>
      </Space>
    </Card>
  );
}

export default CouponCodeCard;
