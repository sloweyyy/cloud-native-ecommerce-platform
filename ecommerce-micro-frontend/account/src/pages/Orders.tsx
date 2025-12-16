import React from 'react';
import { Typography, Card, Table, Button, Tag, Space } from 'antd';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import { useGetOrders } from '../services/orders/hooks';

const { Title, Text } = Typography;

type OrdersPageProps = {
  config?: AppInjectorProps['config'];
};

const OrdersPage: React.FC<OrdersPageProps> = ({ config }) => {
  const { appContext, onNavigate, onError } = config || {};
  const { user } = appContext || {};

  const { data: ordersData, isLoading } = useGetOrders(
    undefined,
    { enabled: !!user }
  );

  const orders = ordersData?.data || [];

  const handleViewOrder = (orderId: string | number) => {
    try {
      if (onNavigate) {
        onNavigate(`/account/orders/${orderId}`);
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string | number) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => {
        if (!date) return 'N/A';
        try {
          return new Date(date).toLocaleDateString();
        } catch {
          return date;
        }
      },
    },
    {
      title: 'Items',
      dataIndex: 'totalItems',
      key: 'totalItems',
      render: (items: number) => items || 0,
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (total: number) => `$${total?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          delivered: 'green',
          shipped: 'blue',
          processing: 'orange',
          pending: 'yellow',
          cancelled: 'red',
        };
        const normalizedStatus = (status || 'pending').toLowerCase();
        return (
          <Tag color={colors[normalizedStatus] || 'default'}>
            {normalizedStatus.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: { id: string | number }) => (
        <Button type="link" onClick={() => handleViewOrder(record.id)}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Order History</Title>
      <Text
        type="secondary"
        style={{ display: 'block', marginBottom: '24px' }}
      >
        View your past orders and track their status
      </Text>

      <Card>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: 'No orders found',
          }}
        />
      </Card>
    </div>
  );
};

export default OrdersPage;

