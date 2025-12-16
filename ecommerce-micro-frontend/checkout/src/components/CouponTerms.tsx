import React, { useState } from 'react';
import { Collapse, Typography, Space } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { Coupon } from '../services/coupon/types';

const { Panel } = Collapse;
const { Text } = Typography;

interface CouponTermsProps {
  coupon: Coupon;
}

function CouponTerms(props: CouponTermsProps) {
  // Props destructuring
  const { coupon } = props;

  // State
  const [isExpanded, setIsExpanded] = useState(false);

  // Defined functions
  function handleChange(key: string | string[]) {
    setIsExpanded(!!key.length);
  }

  // Render
  const terms = [
    'Coupon cannot be exchanged for cash or credit',
    'Not valid with any other promotional offers',
    `Coupon code: ${coupon.code}`,
    'Subject to availability',
  ];

  return (
    <Collapse onChange={handleChange} style={{ marginTop: 16 }}>
      <Panel
        header={
          <Space>
            <FileTextOutlined />
            <Text strong>Terms & Conditions</Text>
          </Space>
        }
        key="terms"
      >
        <Space direction="vertical" size="small">
          {terms.map((term, index) => (
            <Text key={index} type="secondary" style={{ fontSize: 12 }}>
              • {term}
            </Text>
          ))}
        </Space>
      </Panel>
    </Collapse>
  );
}

export default CouponTerms;
