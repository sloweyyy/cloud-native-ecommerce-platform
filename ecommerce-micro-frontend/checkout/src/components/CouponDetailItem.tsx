import React from 'react';
import { Space, Typography } from 'antd';

const { Text } = Typography;

interface CouponDetailItemProps {
  label: string;
  children: React.ReactNode;
}

function CouponDetailItem(props: CouponDetailItemProps) {
  // Props destructuring
  const { label, children } = props;

  return (
    <Space direction="vertical" size={4} style={{ width: '100%' }}>
      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
        {label}
      </Text>
      {children}
    </Space>
  );
}

export default CouponDetailItem;

