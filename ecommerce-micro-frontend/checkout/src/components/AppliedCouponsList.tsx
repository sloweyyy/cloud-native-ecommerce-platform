import React, { useMemo } from 'react';
import { Card, Tag, Space, Typography, Alert, Flex } from 'antd';
import { CheckCircleFilled, TagFilled } from '@ant-design/icons';
import { Coupon } from '../services/coupon/types';
import { formatCurrency } from '../helpers/formatUtils';

const { Text } = Typography;

interface AppliedCouponsListProps {
  coupons: Coupon[];
  onRemove: (code: string) => void;
  subtotal?: number;
}

const DISCOUNT_FORMAT_CONFIG: Record<string, (value: number) => string> = {
  percentage: (value) => `${value}% OFF`,
  fixed: (value) => `$${value.toFixed(2)} OFF`,
  freeshipping: () => 'FREE SHIPPING',
};

function AppliedCouponsList(props: AppliedCouponsListProps) {
  // Props destructuring
  const { coupons, onRemove, subtotal = 0 } = props;

  // Derived state
  const isEmpty = !coupons || coupons.length === 0;

  const totalSavings = useMemo(() => {
    return coupons.reduce((sum, coupon) => {
      const type = String(coupon.discountType).toLowerCase();

      if (type === 'percentage') {
        const percentageAmount =
          subtotal > 0 ? (subtotal * coupon.discountValue) / 100 : 0;
        return (
          sum +
          (coupon.maxDiscountAmount
            ? Math.min(percentageAmount, coupon.maxDiscountAmount)
            : percentageAmount)
        );
      }

      if (type === 'fixed') {
        return sum + coupon.discountValue;
      }

      return sum;
    }, 0);
  }, [coupons, subtotal]);

  // Defined functions
  function handleRemove(code: string) {
    onRemove(code);
  }

  // Early return for empty state
  if (isEmpty) {
    return (
      <Alert
        message="No coupons applied"
        description="Apply coupons to get discounts on your order"
        type="info"
        showIcon
      />
    );
  }

  return (
    <Card bordered>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Text strong>Applied Coupons ({coupons.length})</Text>

        <Space direction="vertical" style={{ width: '100%' }}>
          {coupons.map((coupon) => {
            const type = String(coupon.discountType).toLowerCase();
            const formatter = DISCOUNT_FORMAT_CONFIG[type];
            const discountDisplay = formatter
              ? formatter(coupon.discountValue)
              : 'SPECIAL OFFER';

            return (
              <Tag
                key={coupon.id}
                color="success"
                icon={<CheckCircleFilled />}
                closable
                onClose={() => handleRemove(coupon.code)}
                style={{ padding: '8px 12px', fontSize: 14 }}
              >
                <Space>
                  <TagFilled />
                  <Text>{coupon.code.toUpperCase()}</Text>
                  <Text strong>{discountDisplay}</Text>
                </Space>
              </Tag>
            );
          })}
        </Space>

        {totalSavings > 0 && (
          <Card size="small" style={{ background: '#f0f2f5' }}>
            <Flex justify="space-between">
              <Text strong>Total Savings:</Text>
              <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                {formatCurrency(totalSavings)}
              </Text>
            </Flex>
          </Card>
        )}
      </Space>
    </Card>
  );
}

export default AppliedCouponsList;
