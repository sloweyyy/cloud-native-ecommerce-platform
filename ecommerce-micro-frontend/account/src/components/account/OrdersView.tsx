import React, { useMemo } from 'react';
import { Typography, Card, Button, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { OrdersViewProps, OrderItem } from './types';

const { Title, Text } = Typography;

// Mock orders data - in real app, this would come from API
const MOCK_ORDERS: OrderItem[] = [
  {
    id: '1001',
    date: '2024-01-15',
    total: 299.97,
    status: 'delivered',
    items: 3,
  },
  {
    id: '1002',
    date: '2024-01-20',
    total: 149.99,
    status: 'shipped',
    items: 2,
  },
  {
    id: '1003',
    date: '2024-01-25',
    total: 79.99,
    status: 'processing',
    items: 1,
  },
];

const STATUS_COLORS: Record<OrderItem['status'], string> = {
  delivered: 'green',
  shipped: 'blue',
  processing: 'orange',
  cancelled: 'red',
};

/**
 * OrdersView Component
 *
 * Displays order history in a table format.
 */
export const OrdersView: React.FC<OrdersViewProps> = ({
  onNavigate,
  onError,
}) => {
  const handleViewOrder = (orderId: string) => {
    try {
      onNavigate?.(`/account/orders/${orderId}`);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const columns = useMemo<ColumnsType<OrderItem>>(
    () => [
      {
        title: 'Order ID',
        dataIndex: 'id',
        key: 'id',
        render: (id: string) => <Text strong>#{id}</Text>,
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
      },
      {
        title: 'Items',
        dataIndex: 'items',
        key: 'items',
      },
      {
        title: 'Total',
        dataIndex: 'total',
        key: 'total',
        render: (total: number) => `$${total.toFixed(2)}`,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: OrderItem['status']) => (
          <Tag color={STATUS_COLORS[status]}>{status.toUpperCase()}</Tag>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          <Button type="link" onClick={() => handleViewOrder(record.id)}>
            View Details
          </Button>
        ),
      },
    ],
    [onNavigate, onError]
  );

  return (
    <Card>
      <Title level={3}>Order History</Title>
      <Table
        dataSource={MOCK_ORDERS}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default OrdersView;

