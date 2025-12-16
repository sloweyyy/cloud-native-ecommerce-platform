import React from 'react';
import { Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

interface CouponFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

/**
 * Component for filtering coupons by search term
 * Simplified for basic coupon structure
 */
function CouponFilterBar(props: CouponFilterBarProps) {
  // Props destructuring
  const { searchTerm, onSearchChange } = props;

  // Defined functions
  function handleSearch(value: string) {
    onSearchChange(value);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onSearchChange(e.target.value);
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Search
        placeholder="Search by product name or description..."
        prefix={<SearchOutlined />}
        allowClear
        value={searchTerm}
        onChange={handleChange}
        onSearch={handleSearch}
      />
    </Space>
  );
}

export default CouponFilterBar;
