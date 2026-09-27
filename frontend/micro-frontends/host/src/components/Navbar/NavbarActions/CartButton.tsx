import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined } from '@ant-design/icons';
import CartPreview, { CartItem } from '../../CartPreview/CartPreview';
import { NavbarActionButton } from './NavbarActionButton';

interface CartButtonProps {
  /** Number of items in cart */
  count?: number;
  /** Cart items for preview */
  items?: CartItem[];
  /** Loading state for cart preview */
  isLoading?: boolean;
}

/**
 * Cart button component for the navbar
 * Displays shopping cart icon with item count and hover preview
 */
export const CartButton: React.FC<CartButtonProps> = ({
  count = 0,
  items = [],
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [showCartPreview, setShowCartPreview] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowCartPreview(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setShowCartPreview(false);
    }, 300);
  }, []);

  const handleClick = useCallback(() => {
    navigate('/checkout');
  }, [navigate]);

  return (
    <NavbarActionButton
      icon={<ShoppingCartOutlined />}
      label="Cart"
      onClick={handleClick}
      ariaLabel={`Shopping cart with ${count} items`}
      badgeCount={count}
      showZeroBadge={false}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CartPreview
        visible={showCartPreview}
        items={items}
        isLoading={isLoading}
      />
    </NavbarActionButton>
  );
};

export default CartButton;
