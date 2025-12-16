import React from 'react';
import { TagFilled } from '@ant-design/icons';

/**
 * Coupon Display Configuration
 * 
 * Simplified configuration for displaying coupon information
 * (Backend only provides: id, productName, description, amount)
 */

/**
 * Format coupon amount for display
 */
export function formatCouponAmount(amount: number): string {
  if (amount === 0) {
    return 'Special Offer';
  }
  return `$${amount.toFixed(2)} OFF`;
}

/**
 * Get default coupon icon
 */
export function getCouponIcon(): React.ReactElement {
  return <TagFilled />;
}
