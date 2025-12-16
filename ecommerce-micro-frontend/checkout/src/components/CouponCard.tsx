import React from 'react';
import { Card, Space, Typography, Button, Tag, Flex } from 'antd';
import { TagFilled } from '@ant-design/icons';
import { Coupon } from '../services/coupon/types';
import { getValidationMessage } from '../helpers/couponValidator';
import { COUPON_METADATA_CONFIGS } from '../configs/couponMetadataConfigs';

const { Text } = Typography;

interface CouponCardProps {
  coupon: Coupon;
  onApply: (code: string) => void;
  onViewDetails: (coupon: Coupon) => void;
}

const DISCOUNT_FORMAT_CONFIG: Record<string, (value: number) => string> = {
  percentage: (value) => `${value}% OFF`,
  fixed: (value) => `$${value.toFixed(2)} OFF`,
  freeshipping: () => 'FREE SHIPPING',
};

function CouponCard(props: CouponCardProps) {
  // Props destructuring
  const { coupon, onApply, onViewDetails } = props;

  // Derived state
  const validationMsg = getValidationMessage(coupon);
  const isDisabled = !!validationMsg;

  const type = String(coupon.discountType).toLowerCase();
  const formatter = DISCOUNT_FORMAT_CONFIG[type];
  const discountDisplay = formatter
    ? formatter(coupon.discountValue)
    : 'SPECIAL OFFER';

  // Defined functions
  function handleApply() {
    onApply(coupon.code);
  }

  function handleViewDetails() {
    onViewDetails(coupon);
  }

  return (
    <Card
      hoverable={!isDisabled}
      style={{
        opacity: isDisabled ? 0.6 : 1,
        marginBottom: 16,
      }}
    >
      <Flex justify="space-between" align="flex-start">
        <Space direction="vertical" style={{ flex: 1 }}>
          <Flex align="center" gap={8}>
            <Tag color="blue" style={{ margin: 0 }}>
              {discountDisplay}
            </Tag>
          </Flex>

          <Space direction="vertical" size={4}>
            <Space>
              <TagFilled />
              <Text strong>{coupon.code.toUpperCase()}</Text>
            </Space>
            <Text type="secondary">{coupon.description}</Text>
          </Space>

          {/* Metadata Tags */}
          <Space wrap size={[8, 8]}>
            {COUPON_METADATA_CONFIGS.map((config) =>
              config.enabled(coupon) ? (
                <Tag key={config.key} icon={config.icon} color={config.color}>
                  {config.render(coupon)}
                </Tag>
              ) : null
            )}
          </Space>

          {validationMsg && (
            <Text type="danger" style={{ fontSize: 12 }}>
              {validationMsg}
            </Text>
          )}
        </Space>

        <Space direction="vertical" size="small">
          <Button
            type="primary"
            onClick={handleApply}
            disabled={isDisabled}
            block
          >
            Apply
          </Button>
          <Button onClick={handleViewDetails} block>
            Details
          </Button>
        </Space>
      </Flex>
    </Card>
  );
}

export default CouponCard;
