import React from 'react';
import { InputNumber } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './QuantitySelector.module.less';

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
};

function QuantitySelector(props: QuantitySelectorProps) {
  const { value, onChange, min = 1, max, disabled = false } = props;

  function handleDecrease() {
    if (value > min) {
      onChange(value - 1);
    }
  }

  function handleIncrease() {
    if (!max || value < max) {
      onChange(value + 1);
    }
  }

  function handleChange(newValue: number | null) {
    if (newValue === null) {
      return;
    }
    if (newValue < min) {
      onChange(min);
      return;
    }
    if (max && newValue > max) {
      onChange(max);
      return;
    }
    onChange(newValue);
  }

  return (
    <div className={styles.container}>
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        className={styles.button}
        aria-label="Decrease quantity"
      >
        <MinusOutlined />
      </button>
      <InputNumber
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        disabled={disabled}
        className={styles.input}
        controls={false}
      />
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || (max !== undefined && value >= max)}
        className={styles.button}
        aria-label="Increase quantity"
      >
        <PlusOutlined />
      </button>
    </div>
  );
}

export default QuantitySelector;




