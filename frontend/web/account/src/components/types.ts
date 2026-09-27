import type { AuthUser } from '@ecommerce-platform/auth-provider';
import type { Order } from '../services/orders';

/**
 * Common props for account view components
 */
export interface AccountViewProps {
  onNavigate?: (path: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Props for ProfileView component
 * Uses AuthUser from Azure AD B2C
 */
export interface ProfileViewProps extends AccountViewProps {
  user: AuthUser;
  isLoading?: boolean;
}

/**
 * Props for OrdersView component
 */
export interface OrdersViewProps extends AccountViewProps {
  orders: Order[];
  isLoading?: boolean;
}

