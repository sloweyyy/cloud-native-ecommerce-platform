import React from 'react';
import { Drawer, Space, Typography, Button, Flex, Alert, Divider } from 'antd';
import { CheckOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useGetCoupon } from '../services/coupon/hooks';
import { Coupon } from '../services/coupon/types';
import { ApiResponse } from '../services/types';
import CouponDetailsDrawerSkeleton from './CouponDetailsDrawerSkeleton';
import CouponDiscountBadge from './CouponDiscountBadge';
import CouponCodeCard from './CouponCodeCard';
import CouponDetailItem from './CouponDetailItem';
import CouponTerms from './CouponTerms';
import { couponBrandTokens } from '../styles/coupon-tokens';

const { Title, Text } = Typography;

interface CouponDetailsDrawerProps {
  couponCode?: string;
  open: boolean;
  onClose: () => void;
  onApply: (code: string) => void;
  isApplied?: boolean;
  isApplying?: boolean;
}

type DetailItem = {
  label: string;
  value: string;
  style?: React.CSSProperties;
} & (
  | { strong: true }
  | { type: 'secondary' | 'success' | 'warning' | 'danger' }
);

function CouponDetailsDrawer(props: CouponDetailsDrawerProps) {
  // Props destructuring
  const {
    couponCode,
    open,
    onClose,
    onApply,
    isApplied = false,
    isApplying = false,
  } = props;

  // React Query hooks
  const { data, isLoading, error } = useGetCoupon(
    { code: couponCode || '' },
    { enabled: open && !!couponCode }
  );

  // Defined functions
  function handleApply(coupon: Coupon) {
    onApply(coupon.code);
  }

  function getDiscountValueDisplay(coupon: Coupon): string {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    }
    if (coupon.discountType === 'fixed') {
      return `$${coupon.discountValue.toFixed(2)}`;
    }
    return 'Free Shipping';
  }

  function buildDetailItems(coupon: Coupon): DetailItem[] {
    const items: DetailItem[] = [
      {
        label: 'COUPON CODE',
        value: coupon.code,
        strong: true,
      },
      {
        label: 'DISCOUNT TYPE',
        value: coupon.discountType,
        strong: true,
        style: { textTransform: 'capitalize' as const },
      },
      {
        label: 'DISCOUNT VALUE',
        value: getDiscountValueDisplay(coupon),
        strong: true,
        style: { color: '#52c41a', fontSize: 16 },
      },
    ];

    if (coupon.minPurchaseAmount) {
      items.push({
        label: 'MIN PURCHASE',
        value: `$${coupon.minPurchaseAmount.toFixed(2)}`,
        type: 'secondary',
      });
    }

    if (coupon.maxDiscountAmount && coupon.discountType === 'percentage') {
      items.push({
        label: 'MAX DISCOUNT',
        value: `$${coupon.maxDiscountAmount.toFixed(2)}`,
        type: 'secondary',
      });
    }

    items.push({
      label: 'COUPON ID',
      value: `#${coupon.id}`,
      type: 'secondary',
    });

    return items;
  }

  // Handle loading state
  if (isLoading) {
    return (
      <Drawer
        title="Coupon Details"
        placement="right"
        width={600}
        open={open}
        onClose={onClose}
      >
        <CouponDetailsDrawerSkeleton />
      </Drawer>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Drawer
        title="Coupon Details"
        placement="right"
        width={600}
        open={open}
        onClose={onClose}
      >
        <Alert
          message="Error loading coupon"
          description={error.message}
          type="error"
          showIcon
        />
      </Drawer>
    );
  }

  // Extract coupon data from API response
  const coupon = (data as ApiResponse<Coupon> | null)?.data;

  // Handle case where coupon is not found
  if (!coupon) {
    return (
      <Drawer
        title="Coupon Details"
        placement="right"
        width={600}
        open={open}
        onClose={onClose}
      >
        <Alert
          message="Coupon not found"
          description="The requested coupon could not be loaded."
          type="warning"
          showIcon
        />
      </Drawer>
    );
  }

  // Derived state
  const detailItems = buildDetailItems(coupon);

  // Render
  return (
    <Drawer
      title={
        <Space direction="vertical" size={0}>
          <Title level={4} style={{ margin: 0 }}>
            Coupon Details
          </Title>
          <Text type="secondary">View and apply coupon to your order</Text>
        </Space>
      }
      placement="right"
      width={600}
      open={open}
      onClose={onClose}
      footer={
        <Button
          type="primary"
          size="large"
          icon={isApplied ? <CheckCircleFilled /> : <CheckOutlined />}
          onClick={() => handleApply(coupon)}
          disabled={isApplied || isApplying}
          loading={isApplying}
          block
        >
          {isApplied ? 'Already Applied' : 'Apply Coupon'}
        </Button>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header Strip */}
        <Space
          style={{
            height: 8,
            background: couponBrandTokens.brandPrimary,
            width: '100%',
            borderRadius: 4,
          }}
        />

        {/* Discount Badge */}
        <Flex justify="center">
          <CouponDiscountBadge
            discountType={coupon.discountType}
            discountValue={coupon.discountValue}
            size={120}
          />
        </Flex>

        {/* Coupon Code Card */}
        <CouponCodeCard code={coupon.code} />

        {/* Description */}
        {coupon.description && (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text type="secondary">Description</Text>
            <Text>{coupon.description}</Text>
          </Space>
        )}

        <Divider />

        {/* Details Section */}
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Title level={5}>Details</Title>

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {detailItems.map((item) => {
              const textProps =
                'strong' in item
                  ? { strong: item.strong }
                  : { type: item.type };

              return (
                <CouponDetailItem key={item.label} label={item.label}>
                  <Text {...textProps} style={item.style}>
                    {item.value}
                  </Text>
                </CouponDetailItem>
              );
            })}
          </Space>
        </Space>

        {/* Terms & Conditions */}
        <CouponTerms coupon={coupon} />
      </Space>
    </Drawer>
  );
}

export default CouponDetailsDrawer;
