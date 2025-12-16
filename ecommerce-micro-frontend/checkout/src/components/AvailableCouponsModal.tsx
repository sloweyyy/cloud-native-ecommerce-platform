import React, { useState } from 'react';
import { Modal, Button, Empty, Alert } from 'antd';
import { useListCoupons } from '../services/coupon/hooks';
import { Coupon } from '../services/coupon/types';
import { ApiResponse } from '../services/types';
import CouponDetailsDrawer from './CouponDetailsDrawer';
import CouponsList from './CouponsList';
import AvailableCouponsModalTitle from './AvailableCouponsModalTitle';
import { useCouponsData } from '../hooks/useCouponsData';

interface AvailableCouponsModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyCoupon: (code: string) => void;
}

/**
 * Modal to display and manage available coupons
 * Updated for new coupon schema
 */
function AvailableCouponsModal(props: AvailableCouponsModalProps) {
  // Props destructuring
  const { visible, onClose, onApplyCoupon } = props;

  // React Query hooks
  const { data, isLoading, error } = useListCoupons();

  // State
  const [selectedCouponCode, setSelectedCouponCode] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Derived state - unwrap API response
  const rawCoupons = (data as ApiResponse<Coupon[]> | null)?.data;

  // Custom hooks
  const couponsData = useCouponsData(rawCoupons, isLoading, error);

  // Defined functions
  function handleApplyCoupon(code: string) {
    onApplyCoupon(code);
    onClose();
  }

  function handleViewDetails(coupon: Coupon) {
    setSelectedCouponCode(coupon.code);
    setIsDrawerOpen(true);
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false);
    setSelectedCouponCode(null);
  }

  // Early return: error state
  if (couponsData.state === 'error') {
    return (
      <Modal
        title="Available Coupons"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
      >
        <Alert
          message="Error loading coupons"
          description={couponsData.message}
          type="error"
          showIcon
        />
      </Modal>
    );
  }

  // Early return: empty state
  if (couponsData.state === 'empty') {
    return (
      <Modal
        title="Available Coupons"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
      >
        <Empty description="No coupons available at this time" />
      </Modal>
    );
  }

  // Render: normal state
  const coupons = couponsData.state === 'success' ? couponsData.data : [];

  return (
    <>
      <Modal
        title={<AvailableCouponsModalTitle count={coupons.length} />}
        open={visible}
        onCancel={onClose}
        width={800}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
        loading={isLoading}
      >
        <CouponsList
          coupons={coupons}
          onApply={handleApplyCoupon}
          onViewDetails={handleViewDetails}
        />
      </Modal>

      <CouponDetailsDrawer
        couponCode={selectedCouponCode || undefined}
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        onApply={handleApplyCoupon}
        isApplied={false}
        isApplying={false}
      />
    </>
  );
}

export default AvailableCouponsModal;
