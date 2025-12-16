import React from 'react';
import { Space, Typography } from 'antd';
import { TagsFilled } from '@ant-design/icons';

const { Text, Title } = Typography;

interface AvailableCouponsModalTitleProps {
  count: number;
}

function AvailableCouponsModalTitle(props: AvailableCouponsModalTitleProps) {
  // Props destructuring
  const { count } = props;

  // Derived state
  const pluralizedText = count === 1 ? 'coupon' : 'coupons';

  return (
    <Space direction="vertical" size="small">
      <Space size="middle">
        <TagsFilled style={{ fontSize: 20 }} />
        <Title level={4} style={{ margin: 0 }}>
          Available Coupons
        </Title>
      </Space>
      <Text type="secondary">
        {count} {pluralizedText} available
      </Text>
    </Space>
  );
}

export default AvailableCouponsModalTitle;

