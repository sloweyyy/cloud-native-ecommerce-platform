import React from 'react';
import { Space, Typography } from 'antd';

const { Text } = Typography;

interface CouponUsageProgressProps {
  label: string;
}

/**
 * Placeholder component for usage progress
 * (Backend doesn't provide usage data in simplified version)
 */
function CouponUsageProgress(props: CouponUsageProgressProps) {
  // Props destructuring
  const { label } = props;

  return (
    <Space>
      <Text type="secondary">{label}</Text>
    </Space>
  );
}

export default CouponUsageProgress;
