import React from 'react';
import { Typography, Space } from 'antd';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import type { AuthUser } from '@ecommerce-platform/auth-provider';
import { useGetOrders } from '../services/orders/hooks';
import { OrdersView } from '../components/OrdersView';

const { Title, Text } = Typography;

type OrdersPageProps = {
  config?: AppInjectorProps['config'];
};

/**
 * OrdersPage - Container Component
 *
 * Handles data fetching and state management for orders.
 * Follows Container/Presentational pattern:
 * - Container (this component): Manages state, data fetching, and business logic
 * - Presentational (OrdersView): Pure presentation, receives data via props
 */
function OrdersPage(props: OrdersPageProps) {
  const { config } = props;
  const { appContext, onNavigate, onError } = config || {};
  const contextUser = appContext?.user as AuthUser | undefined;

  console.log('[OrdersPage] Config:', config);
  console.log('[OrdersPage] AppContext:', appContext);
  console.log('[OrdersPage] Context user:', contextUser);

  const { data: ordersData, isLoading } = useGetOrders(
    undefined,
    { enabled: !!contextUser, user: contextUser }
  );

  console.log('[OrdersPage] Orders data:', ordersData);
  console.log('[OrdersPage] Is loading:', isLoading);

  const orders = ordersData?.data || [];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Title level={2}>Order History</Title>
      <Text type="secondary">
        View your past orders and track their status
      </Text>
      <OrdersView
        orders={orders}
        isLoading={isLoading}
        onNavigate={onNavigate}
        onError={onError}
      />
    </Space>
  );
}

export default OrdersPage;

