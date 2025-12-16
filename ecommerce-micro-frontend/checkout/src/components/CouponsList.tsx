import React, { useState } from 'react';
import { Space, Empty } from 'antd';
import { Coupon } from '../services/coupon/types';
import CouponFilterBar from './CouponFilterBar';
import CouponCard from './CouponCard';
import { useFilteredCoupons } from '../hooks/useFilteredCoupons';

interface CouponsListProps {
  coupons: Coupon[];
  onApply: (code: string) => void;
  onViewDetails: (coupon: Coupon) => void;
}

function CouponsList(props: CouponsListProps) {
  // Props destructuring
  const { coupons, onApply, onViewDetails } = props;

  // State
  const [searchTerm, setSearchTerm] = useState('');

  // Derived state
  const filteredCoupons = useFilteredCoupons(coupons, searchTerm);
  const isEmpty = !filteredCoupons || filteredCoupons.length === 0;

  // Defined functions
  function handleSearchChange(value: string) {
    setSearchTerm(value);
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <CouponFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      {isEmpty ? (
        <Empty description="No coupons found" />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          {filteredCoupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onApply={onApply}
              onViewDetails={onViewDetails}
            />
          ))}
        </Space>
      )}
    </Space>
  );
}

export default CouponsList;
