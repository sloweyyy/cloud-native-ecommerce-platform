import React, { useRef, useState } from 'react';
import { Input, Button, Space, message, type InputRef } from 'antd';
import { TagFilled, CheckOutlined } from '@ant-design/icons';

interface CouponInputProps {
  onApplyCoupon: (code: string) => void;
}

function CouponInput(props: CouponInputProps) {
  // Props destructuring
  const { onApplyCoupon } = props;

  // Refs
  const inputRef = useRef<InputRef>(null);

  // State
  const [couponCode, setCouponCode] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Defined functions
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCouponCode(e.target.value);
    if (hasError) {
      setHasError(false);
    }
  }

  async function handleApplyCoupon() {
    const trimmedCode = couponCode.trim();

    if (!trimmedCode) {
      setHasError(true);
      message.error('Please enter a coupon code');
      return;
    }

    try {
      setIsApplying(true);
      onApplyCoupon(trimmedCode);
      message.success('Coupon applied successfully!');
      setCouponCode('');
      setHasError(false);
    } catch (error) {
      setHasError(true);
      message.error('Failed to apply coupon');
    } finally {
      setIsApplying(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  }

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input
        ref={inputRef}
        placeholder="Enter coupon code"
        prefix={<TagFilled />}
        value={couponCode}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        status={hasError ? 'error' : undefined}
        disabled={isApplying}
      />
      <Button
        type="primary"
        icon={<CheckOutlined />}
        onClick={handleApplyCoupon}
        loading={isApplying}
        disabled={!couponCode.trim()}
      >
        Apply
      </Button>
    </Space.Compact>
  );
}

export default CouponInput;
