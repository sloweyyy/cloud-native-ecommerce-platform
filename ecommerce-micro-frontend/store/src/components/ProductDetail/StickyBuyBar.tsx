import React, { useEffect, useState } from 'react';
import { Button, Space } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../helpers/formatUtils';
import styles from './StickyBuyBar.module.less';

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
    let timeoutId: NodeJS.Timeout;

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

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.stickyBar}>
      <div className={styles.content}>
        <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <div className={styles.priceLabel}>Price</div>
            <div className={styles.price}>{formatCurrency(price)}</div>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={onAddToCart}
            disabled={!canAddToCart}
            className={styles.addToCartButton}
          >
            {isInStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default StickyBuyBar;




