import React, { useMemo } from 'react';
import { Typography, Card, Button, Table, Tag, Space, Skeleton } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { OrdersViewProps } from '../types';
import type { Order } from '../../services/orders';

const { Title, Text } = Typography;

const STATUS_COLORS: Record<string, string> = {
  delivered: 'green',
  shipped: 'blue',
  processing: 'orange',
  pending: 'yellow',
  cancelled: 'red',
};

function OrdersView(props: OrdersViewProps) {
  const { orders, isLoading, onNavigate, onError } = props;

  function handleViewOrder(orderId: number) {
    try {
      onNavigate?.(`/account/orders/${orderId}`);
    } catch (error) {
      onError?.(error as Error);
    }
  }

  const columns = useMemo<ColumnsType<Order>>(
    () => [
      {
        title: 'Order ID',
        dataIndex: 'id',
        key: 'id',
        render: (id: number) => <Text strong>#{id}</Text>,
      },
      {
        title: 'Date',
        dataIndex: 'orderDate',
        key: 'orderDate',
        render: (date: string) => {
          if (!date) {
            return 'N/A';
          }
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
        render: (items: number | undefined) => items || 0,
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
        render: (status: string | null | undefined) => {
          const normalizedStatus = (status || 'pending').toLowerCase();
          return (
            <Tag color={STATUS_COLORS[normalizedStatus] || 'default'}>
              {normalizedStatus.toUpperCase()}
            </Tag>
          );
        },
      },
      {
        title: 'Action',
        key: 'action',
        render: (_: unknown, record: Order) => (
          <Button type="link" onClick={() => handleViewOrder(record.id)}>
            View Details
          </Button>
        ),
      },
    ],
    [onNavigate, onError]
  );

  // Early return for loading state
  if (isLoading) {
    return (
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={3}>Order History</Title>
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
        </Space>
      </Card>
    );
  }

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Title level={3}>Order History</Title>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: 'No orders found',
          }}
        />
      </Space>
    </Card>
  );
}

export default React.memo(OrdersView);
