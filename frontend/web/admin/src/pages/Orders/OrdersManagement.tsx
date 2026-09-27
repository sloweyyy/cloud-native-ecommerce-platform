import React, { useState, useMemo, useCallback } from 'react';
import {
  Card,
  Typography,
  Input,
  Space,
  Button,
  Popconfirm,
  Row,
  Col,
  Tooltip,
  theme,
  Select,
  Tag,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useRouteContext } from '@tanstack/react-router';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { useGetAllOrders, useDeleteOrder } from '../../services';
import type { Order } from '../../services/orders';
import {
  DataTable,
  FilterBar,
  EmptyState,
  SkeletonLoader,
  StatusBadge,
  StatsCards,
} from '../../components/shared';

const { Title, Text } = Typography;

type OrdersManagementProps = {
  config?: AppInjectorProps['config'];
};

/**
 * OrdersManagement Component
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility for orders list and management
 */
function OrdersManagement(props: OrdersManagementProps) {
  const { config } = props;
  const { onError } = config || {};

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { token } = theme.useToken();
  const routeContext = useRouteContext({ from: '__root__' });
  const routerUser = routeContext?.auth?.user as { username?: string } | undefined;
  const { user } = useAuth();
  const currentUserName =
    routerUser?.username || user?.username || user?.email || user?.id || '';
  const { data: orders = [], isLoading, refetch } = useGetAllOrders(
    currentUserName || '',
    { enabled: !!currentUserName }
  );
  const { mutate: deleteOrder } = useDeleteOrder();
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    let filtered = orders;

    if (search) {
      filtered = filtered.filter(
        (order: Order) =>
          order.userName?.toLowerCase().includes(search.toLowerCase()) ||
          order.emailAddress?.toLowerCase().includes(search.toLowerCase()) ||
          order.id.toString().includes(search) ||
          `${order.firstName || ''} ${order.lastName || ''}`
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (order: Order) =>
          order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return filtered;
  }, [orders, search, statusFilter]);

  const totalRevenue = useMemo(
    () =>
      filteredOrders.reduce(
        (sum: number, order: Order) => sum + (order.totalPrice || 0),
        0
      ),
    [filteredOrders]
  );

  const averageOrderValue = useMemo(() => {
    if (filteredOrders.length === 0) return 0;
    return totalRevenue / filteredOrders.length;
  }, [filteredOrders, totalRevenue]);

  function getOrderPlural(count: number): string {
    if (count > 1) {
      return 'orders';
    }
    return 'order';
  }

  const handleDelete = useCallback(
    (id: number) => {
      deleteOrder(id, {
        onError: (error) => {
          if (onError) {
            onError(error as Error);
          }
        },
      });
    },
    [deleteOrder, onError]
  );

  function handleRefresh() {
    refetch();
  }

  function handleClearFilters() {
    setSearch('');
    setStatusFilter(undefined);
  }

  function handleBulkDelete() {
    selectedRowKeys.forEach((key) => {
      deleteOrder(key as number);
    });
    setSelectedRowKeys([]);
  }

  const hasActiveFilters = search || statusFilter;

  const filterChips = useMemo(() => {
    const chips = [];
    if (search) {
      chips.push({
        key: 'search',
        label: `Search: ${search}`,
        onRemove: () => setSearch(''),
      });
    }
    if (statusFilter) {
      chips.push({
        key: 'status',
        label: `Status: ${statusFilter}`,
        onRemove: () => setStatusFilter(undefined),
      });
    }
    return chips;
  }, [search, statusFilter]);

  const uniqueStatuses = useMemo(() => {
    if (!orders) return [];
    const statuses = new Set<string>();
    orders.forEach((order: Order) => {
      if (order.status) {
        statuses.add(order.status);
      }
    });
    return Array.from(statuses).sort();
  }, [orders]);

  // Memoized values
  const columns = useMemo(
    () => [
      {
        title: 'Order ID',
        dataIndex: 'id',
        key: 'id',
        width: '10%',
        sorter: (a: Order, b: Order) => a.id - b.id,
        render: (id: number) => (
          <Text strong style={{ color: token.colorPrimary }}>
            #{id}
          </Text>
        ),
      },
      {
        title: 'Customer',
        key: 'customer',
        width: '25%',
        ellipsis: true,
        render: (_: unknown, record: Order) => {
          const name = `${record.firstName || ''} ${
            record.lastName || ''
          }`.trim();
          return (
            <Space direction="vertical" size={2}>
              <Text strong>{name || record.emailAddress || 'Guest'}</Text>
              {record.emailAddress && (
                <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  {record.emailAddress}
                </Text>
              )}
            </Space>
          );
        },
      },
      {
        title: 'User',
        dataIndex: 'userName',
        key: 'userName',
        width: '15%',
        ellipsis: true,
        render: (userName: string) => {
          if (userName) {
            return (
              <Tag icon={<UserOutlined />} color="blue">
                {userName}
              </Tag>
            );
          }
          return <Tag>Guest</Tag>;
        },
      },
      {
        title: 'Total Amount',
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        width: '12%',
        align: 'right' as const,
        sorter: (a: Order, b: Order) =>
          (a.totalPrice || 0) - (b.totalPrice || 0),
        render: (price: number) => {
          if (price) {
            return (
              <Text strong style={{ color: token.colorSuccess }}>
                ${price.toFixed(2)}
              </Text>
            );
          }
          return <Tag>N/A</Tag>;
        },
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: '13%',
        filters: uniqueStatuses.map((status) => ({
          text: status,
          value: status,
        })),
        onFilter: (
          value: string | number | bigint | boolean,
          record: Order
        ) => {
          return record.status === String(value);
        },
        render: (status: string | null | undefined) => (
          <StatusBadge status={status || 'Pending'} showIcon />
        ),
      },
      {
        title: 'Date',
        dataIndex: 'orderDate',
        key: 'orderDate',
        width: '15%',
        render: (date: string | null | undefined) => {
          if (!date) return <Tag>N/A</Tag>;
          try {
            return (
              <Text type="secondary">
                {new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            );
          } catch {
            return <Tag>N/A</Tag>;
          }
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        width: '10%',
        fixed: 'right' as const,
        render: (_: unknown, record: Order) => (
          <Popconfirm
            title="Delete Order"
            description={
              <Space direction="vertical" size="small">
                <Text>Are you sure you want to delete order #{record.id}?</Text>
                <Text type="danger" strong>
                  This action cannot be undone.
                </Text>
              </Space>
            }
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        ),
      },
    ],
    [token, handleDelete, uniqueStatuses]
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header Section */}
      <Row justify="space-between" align="middle">
        <Col>
          <Space direction="vertical" size={2}>
            <Title level={3} style={{ marginBottom: 0, fontWeight: 600 }}>
              Orders
            </Title>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              View and manage customer orders
            </Text>
          </Space>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <StatsCards
        statistics={[
          {
            title: 'Total Orders',
            value: filteredOrders.length,
            iconType: 'orders',
          },
          {
            title: 'Total Revenue',
            value: totalRevenue,
            iconType: 'revenue',
            precision: 2,
          },
          {
            title: 'Average Order Value',
            value: averageOrderValue,
            prefix: '$',
            precision: 2,
          },
        ]}
        colSpan={{ xs: 24, sm: 8 }}
      />

      {/* Search and Filters */}
      <Card bodyStyle={{ padding: token.sizeUnit * 3 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[token.sizeUnit * 2, token.sizeUnit * 2]}>
            <Col xs={24} sm={12} md={8}>
              <Input.Search
                placeholder="Search by order ID, customer name, or email..."
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={setSearch}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Filter by Status"
                allowClear
                style={{ width: '100%' }}
                onChange={(value) => setStatusFilter(value)}
                value={statusFilter}
                options={uniqueStatuses.map((status) => ({
                  label: status,
                  value: status,
                }))}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Button onClick={handleClearFilters} style={{ width: '100%' }}>
                Clear Filters
              </Button>
            </Col>
          </Row>

          {/* Filter Chips */}
          {filterChips.length > 0 && (
            <FilterBar chips={filterChips} onClearAll={handleClearFilters} />
          )}

          {/* Bulk Actions */}
          {selectedRowKeys.length > 0 && (
            <Card
              bodyStyle={{
                padding: token.sizeUnit * 2,
                background: token.colorPrimaryBg,
                borderRadius: token.borderRadius,
              }}
            >
              <Space>
                <Text strong>
                  {selectedRowKeys.length}{' '}
                  {getOrderPlural(selectedRowKeys.length)} selected
                </Text>
                <Popconfirm
                  title={`Delete ${selectedRowKeys.length} ${getOrderPlural(
                    selectedRowKeys.length
                  )}?`}
                  description="This action cannot be undone."
                  onConfirm={handleBulkDelete}
                  okText="Yes, Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete Selected
                  </Button>
                </Popconfirm>
                <Button onClick={() => setSelectedRowKeys([])}>
                  Clear Selection
                </Button>
              </Space>
            </Card>
          )}
        </Space>
      </Card>

      {/* Orders Table */}
      <Card bodyStyle={{ padding: 0 }}>
        {isLoading ? (
          <SkeletonLoader rows={5} />
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: token.sizeUnit * 8 }}>
            <EmptyState
              title="No orders found"
              description={
                hasActiveFilters
                  ? "Try adjusting your filters to find what you're looking for"
                  : 'No orders have been placed yet'
              }
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            loading={isLoading}
            stickyHeader
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            pagination={{
              pageSize: 10,
            }}
          />
        )}
      </Card>
    </Space>
  );
}

export default React.memo(OrdersManagement);
