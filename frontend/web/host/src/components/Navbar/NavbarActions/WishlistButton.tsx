import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartOutlined } from '@ant-design/icons';
import { NavbarActionButton } from './NavbarActionButton';

interface WishlistButtonProps {
  /** Number of items in wishlist (optional, shows badge if > 0) */
  count?: number;
}

/**
 * Wishlist button component for the navbar
 * Displays heart icon for accessing user's wishlist with optional item count badge
 */
export const WishlistButton: React.FC<WishlistButtonProps> = ({ count }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/wishlist');
  };

  return (
    <NavbarActionButton
      icon={<HeartOutlined />}
      label="Wishlist"
      onClick={handleClick}
      ariaLabel="Wishlist"
      badgeCount={count}
      showZeroBadge={false}
    />
  );
};

export default WishlistButton;
