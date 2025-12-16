import React from 'react';
import { Space, Skeleton, Card, Divider, Flex } from 'antd';
import { couponSpacingTokens } from '../styles/coupon-tokens';

function CouponDetailsDrawerSkeleton() {
  return (
    <Space direction="vertical" size={0} style={{ width: '100%' }}>
      {/* Colored header strip placeholder */}
      <Skeleton.Button
        active
        size="small"
        block
        style={{ height: 8, borderRadius: 0 }}
      />

      <Space
        direction="vertical"
        size={couponSpacingTokens.spacingXl}
        style={{ padding: couponSpacingTokens.spacingXl, width: '100%' }}
      >
        {/* Discount Badge Skeleton */}
        <Flex justify="center">
          <Skeleton.Avatar active size={100} shape="circle" />
        </Flex>

        {/* Coupon Code Card Skeleton */}
        <Card size="small">
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Skeleton.Input active size="small" block style={{ height: 16 }} />
            <Skeleton.Input active size="small" block style={{ height: 20 }} />
          </Space>
        </Card>

        {/* Description Skeleton */}
        <Skeleton active paragraph={{ rows: 2, width: ['100%', '80%'] }} title={false} />

        <Divider style={{ margin: 0 }} />

        {/* Details Grid Skeleton */}
        <Space
          direction="vertical"
          size={couponSpacingTokens.spacingLg}
          style={{ width: '100%' }}
        >
          {/* Detail items (6 items) */}
          {[...Array(6)].map((_, index) => (
            <div key={index}>
              <Skeleton.Input
                active
                size="small"
                style={{ width: 120, height: 12, marginBottom: 4 }}
              />
              <Skeleton.Input active size="small" style={{ width: 180, height: 24 }} />
            </div>
          ))}
        </Space>

        <Divider style={{ margin: 0 }} />

        {/* Action Buttons Skeleton */}
        <Space
          direction="vertical"
          size={couponSpacingTokens.spacingMd}
          style={{ width: '100%' }}
        >
          <Skeleton.Button active block style={{ height: 40 }} />
          <Skeleton.Button active block style={{ height: 48 }} />
        </Space>
      </Space>
    </Space>
  );
}

export default CouponDetailsDrawerSkeleton;

