import React, { useState, useRef, useCallback, useEffect } from 'react';

import { Button, Space, Typography, InputNumber, Flex } from 'antd';
import { DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';

import type { BasketItem } from '../../services/basket/schemas';

const { Title, Text } = Typography;

type BasketItemRowProps = {
  item: BasketItem;
  onUpdateQuantity: (item: BasketItem, quantity: number) => void;
  onRemove: (productId: string) => void;
};

function BasketItemRow(props: BasketItemRowProps) {
  const { item, onUpdateQuantity, onRemove } = props;

  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const debouncedUpdate = useCallback(
    (newQuantity: number) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        onUpdateQuantity(item, newQuantity);
      }, 500);
    },
    [item, onUpdateQuantity]
  );

  function handleDecrease() {
    const newQuantity = Math.max(1, localQuantity - 1);
    setLocalQuantity(newQuantity);
    debouncedUpdate(newQuantity);
  }

  function handleIncrease() {
    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    debouncedUpdate(newQuantity);
  }

  function handleChange(value: number | null) {
    const newQuantity = value || 1;
    setLocalQuantity(newQuantity);
    debouncedUpdate(newQuantity);
  }

  function handleRemove() {
    onRemove(item.productId);
  }

  return (
    <Flex
      key={item.productId}
      gap="middle"
      justify="space-between"
      align="center"
      style={{
        width: '100%',
        padding: '16px 0',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <img
        src={item.imageFile || '/placeholder.png'}
        alt={item.productName}
        style={{
          width: 80,
          height: 80,
          objectFit: 'cover',
          borderRadius: 8,
        }}
      />
      <Space direction="vertical" size="small" style={{ flex: 1 }}>
        <Title level={5} style={{ margin: 0 }}>
          {item.productName}
        </Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Qty: {localQuantity}
        </Text>
        {item.discountAmount > 0 && (
          <Space direction="vertical" size={2}>
            <Text
              delete
              type="secondary"
              style={{ fontSize: 12 }}
            >
              ${item.originalPrice.toFixed(2)} each
            </Text>
            <Text
              type="success"
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              -${item.discountAmount.toFixed(2)} discount
            </Text>
            <Text
              style={{ fontSize: 13, fontWeight: 600, color: '#1890ff' }}
            >
              ${item.price.toFixed(2)} each
            </Text>
          </Space>
        )}
      </Space>
      <Space direction="vertical" align="end" size="small">
        <Space size="small">
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={handleDecrease}
            disabled={localQuantity <= 1}
          />
          <InputNumber
            size="small"
            min={1}
            value={localQuantity}
            onChange={handleChange}
            style={{ width: 60 }}
          />
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={handleIncrease}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={handleRemove}
          />
        </Space>
        <Text strong style={{ fontSize: 16 }}>
          ${(item.price * localQuantity).toFixed(2)}
        </Text>
      </Space>
    </Flex>
  );
}

export default React.memo(BasketItemRow);
