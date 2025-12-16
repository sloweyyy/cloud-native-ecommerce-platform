import React from 'react';
import { Space } from 'antd';
import { useAuth } from '@ecommerce-platform/auth-provider';
import {
  NotificationButton,
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
  /** Callback when removing item from cart */
  onRemoveCartItem?: (id: string) => void;
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
  onRemoveCartItem,
}: NavbarActionsProps) {
  const { isAuthenticated } = useAuth();

  return (
    <Space size="large">
      {/* Notifications - only shown when authenticated */}
      {isAuthenticated && <NotificationButton count={5} />}

      {/* Cart with preview */}
      <CartButton
        count={basketCount}
        items={cartItems}
        isLoading={isLoading}
        onRemoveItem={onRemoveCartItem}
      />

      {/* User menu with login/logout */}
      <UserMenuButton />
    </Space>
  );
}

export default NavbarActions;
