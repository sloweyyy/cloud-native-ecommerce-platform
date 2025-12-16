import React from 'react';
import { Typography, Flex } from 'antd';
import { DiscountType } from '../services/coupon/types';
import { couponBrandTokens } from '../styles/coupon-tokens';

const { Text } = Typography;

interface CouponDiscountBadgeProps {
  discountType: DiscountType | string;
  discountValue: number;
  size?: number;
}

const DISCOUNT_FORMAT_CONFIG: Record<string, (value: number) => string> = {
  percentage: (value) => `${value}% OFF`,
  fixed: (value) => `$${value.toFixed(2)} OFF`,
  freeshipping: () => 'FREE SHIPPING',
};

function CouponDiscountBadge(props: CouponDiscountBadgeProps) {
  // Props destructuring
  const { discountType, discountValue, size = 100 } = props;

  // Derived state
  const type = String(discountType).toLowerCase();
  const formatter = DISCOUNT_FORMAT_CONFIG[type];
  const displayText = formatter ? formatter(discountValue) : 'SPECIAL OFFER';

  // Render
  return (
    <Flex
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: couponBrandTokens.brandPrimary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        margin: '0 auto',
      }}
    >
      <Text style={{ color: '#ffffff', fontSize: size / 4, fontWeight: 700 }}>
        {displayText}
      </Text>
    </Flex>
  );
}

export default CouponDiscountBadge;
