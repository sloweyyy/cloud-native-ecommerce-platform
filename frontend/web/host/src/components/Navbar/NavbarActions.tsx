import React from 'react';
import { Space } from 'antd';
import {
  CartButton,
  UserMenuButton,
  CartItem,
} from './NavbarActions/index';

interface NavbarActionsProps {
  /** Number of items in the basket */
  basketCount?: number;
  /** Cart items for preview */
  cartItems?: CartItem[];
  /** Loading state for cart data */
  isLoading?: boolean;
}

/**
 * NavbarActions Component
 *
 * Container for all navbar action buttons including:
 * - Notifications (authenticated users only)
 * - Cart with preview
 * - User menu with login/logout
 *
 * Uses isolated, reusable button components from ./NavbarActions/
 */
function NavbarActions({
  basketCount = 0,
  cartItems = [],
  isLoading = false,
}: NavbarActionsProps) {
  return (
    <Space size="large">
      {/* Cart with preview */}
      <CartButton
        count={basketCount}
        items={cartItems}
        isLoading={isLoading}
      />

      {/* User menu with login/logout */}
      <UserMenuButton />
    </Space>
  );
}

export default NavbarActions;
