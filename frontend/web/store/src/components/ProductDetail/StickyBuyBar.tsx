import React, { useEffect, useState, useMemo } from 'react';
import { Button, Space, Typography, Flex } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../helpers/formatUtils';
import styles from './StickyBuyBar.module.less';

const { Text } = Typography;

type StickyBuyBarProps = {
  price: number;
  onAddToCart: () => void;
  canAddToCart: boolean;
  isInStock: boolean;
};

function StickyBuyBar(props: StickyBuyBarProps) {
  const { price, onAddToCart, canAddToCart, isInStock } = props;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function handleScroll() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        const scrollY = window.scrollY;
        const threshold = 400;
        setIsVisible(scrollY > threshold);
      }, 100);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const buttonText = useMemo(() => {
    if (isInStock) {
      return 'Add to Cart';
    }
    return 'Out of Stock';
  }, [isInStock]);

  if (!isVisible) {
    return null;
  }

  return (
    <Flex
      className={styles.stickyBar}
      justify="space-between"
      align="center"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#ffffff',
        borderTop: '1px solid #e8e8e8',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        padding: '12px 16px',
      }}
    >
      <Flex
        justify="space-between"
        align="center"
        style={{
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <Space direction="vertical" size={0}>
          <Text className={styles.priceLabel}>Price</Text>
          <Text className={styles.price}>{formatCurrency(price)}</Text>
        </Space>
        <Button
          type="primary"
          size="large"
          icon={<ShoppingCartOutlined />}
          onClick={onAddToCart}
          disabled={!canAddToCart}
          className={styles.addToCartButton}
        >
          {buttonText}
        </Button>
      </Flex>
    </Flex>
  );
}

export default StickyBuyBar;
