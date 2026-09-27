import React from 'react';
import { Space } from 'antd';
import {
  CartButton,
  UserMenuButton,
  CartItem,
} from './NavbarActions/index';
import { useNavigate } from '../../utils/navigation-handler';

interface NavbarActionsProps {
  /** Number of items in the basket */
  basketCount?: number;
  /** Cart items for preview */
  cartItems?: CartItem[];
  /** Loading state for cart data */
  isLoading?: boolean;
  /** Callback when removing item from cart */
  onRemoveCartItem?: (id: string) => void;
  /** Current app name for navigation fallback */
  appName?: string;
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
  appName,
}: NavbarActionsProps) {
  return (
    <Space size="large">
      {/* Cart with preview */}
      <CartButton
        count={basketCount}
        items={cartItems}
        isLoading={isLoading}
        onRemoveItem={onRemoveCartItem}
        appName={appName}
      />

      {/* User menu with login/logout */}
      <UserMenuButton appName={appName} />
    </Space>
  );
}

export default NavbarActions;

