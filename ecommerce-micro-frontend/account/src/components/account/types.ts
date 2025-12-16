import type { AuthUser } from '@ecommerce-platform/auth-provider';

/**
 * Common props for account view components
 */
export interface AccountViewProps {
  onNavigate?: (path: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Props for ProfileView component
 */
export interface ProfileViewProps extends AccountViewProps {
  user: AuthUser;
}

/**
 * Props for OrdersView component
 */
export type OrdersViewProps = AccountViewProps;

/**
 * Props for SettingsView component
 */
export interface SettingsViewProps extends AccountViewProps {
  onLogout: () => Promise<void>;
}

/**
 * Order item type
 */
export interface OrderItem {
  id: string;
  date: string;
  total: number;
  status: 'delivered' | 'shipped' | 'processing' | 'cancelled';
  items: number;
}

