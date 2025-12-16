import React from 'react';
import { TagFilled, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Coupon } from '../services/coupon/types';
import { isExpiringSoon, isExpired } from '../helpers/couponUtils';

/**
 * Metadata Configuration Interface
 *
 * Defines the structure for each metadata tag configuration
 */
export interface MetadataConfig {
  key: string;
  enabled: (coupon: Coupon) => boolean;
  render: (coupon: Coupon) => React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
}

const DISCOUNT_FORMAT_CONFIG: Record<string, (value: number) => string> = {
  percentage: (value) => `${value}% OFF`,
  fixed: (value) => `$${value.toFixed(2)} OFF`,
  freeshipping: () => 'FREE SHIPPING',
};

/**
 * Metadata configs for coupon display
 * Updated for new coupon schema (code, discountType, discountValue)
 */
export const COUPON_METADATA_CONFIGS: MetadataConfig[] = [
  {
    key: 'discount',
    enabled: (coupon) => coupon.discountValue > 0,
    render: (coupon) => {
      const type = String(coupon.discountType).toLowerCase();
      const formatter = DISCOUNT_FORMAT_CONFIG[type];
      return formatter ? formatter(coupon.discountValue) : 'SPECIAL OFFER';
    },
    icon: <TagFilled />,
    color: 'success',
  },
  {
    key: 'expiring',
    enabled: (coupon) => isExpiringSoon(coupon.expiryDate, 7) && !isExpired(coupon.expiryDate),
    render: () => 'Expiring Soon',
    icon: <ClockCircleOutlined />,
    color: 'warning',
  },
  {
    key: 'active',
    enabled: (coupon) => coupon.isActive && !isExpired(coupon.expiryDate),
    render: () => 'Active',
    icon: <CheckCircleOutlined />,
    color: 'success',
  },
];
