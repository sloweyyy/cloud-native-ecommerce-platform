import React, { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Space,
  Card,
  Typography,
  Input,
  Select,
  Popconfirm,
  Image,
  Tag,
  Row,
  Col,
  Tooltip,
  theme,
  message,
  Flex,
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import {
  useGetAllProducts,
  useDeleteProduct,
  useGetAllBrands,
  useGetAllTypes,
} from '../../services';
import type { Product } from '../../services/products';
import {
  DataTable,
  FilterBar,
  EmptyState,
  SkeletonLoader,
} from '../../components/shared';

const { Title, Text } = Typography;

type ProductsManagementProps = {
  config?: AppInjectorProps['config'];
};

function ProductsManagement(props: ProductsManagementProps) {
  const { config } = props;
  const { onError } = config || {};

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const navigate = useNavigate();
  const { token } = theme.useToken();
  const {
    data: productsData,
    isLoading,
    refetch,
  } = useGetAllProducts({
    pageIndex,
    pageSize,
    search: search || undefined,
    brandId: brandFilter,
    typeId: typeFilter,
  });
  const { data: brands } = useGetAllBrands();
  const { data: types } = useGetAllTypes();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const products = useMemo(
    () => productsData?.data || [],
    [productsData?.data]
  );
  const total = useMemo(() => productsData?.count || 0, [productsData?.count]);
  const hasActiveFilters = useMemo(
    () => !!(brandFilter || typeFilter || search),
    [brandFilter, typeFilter, search]
  );

  function getProductPlural(count: number): string {
    if (count > 1) {
      return 'products';
    }
    return 'product';
  }

  function handleCreate() {
    navigate({ to: '/products/new' });
  }

  const handleEdit = useCallback(
    (product: Product) => {
      navigate({ to: `/products/${product.id}/edit` });
    },
    [navigate]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteProduct(id, {
        onSuccess: () => {
          message.success('Product deleted successfully');
          refetch();
        },
        onError: (error) => {
          if (onError) {
            onError(error as Error);
          } else {
            message.error(
              error?.message || 'Failed to delete product. Please try again.'
            );
          }
        },
      });
    },
    [deleteProduct, refetch, onError]
  );

  function handleRefresh() {
    refetch();
  }

  function handleClearFilters() {
    setSearch('');
    setBrandFilter(undefined);
    setTypeFilter(undefined);
    setPageIndex(1);
  }

  function handleBulkDelete() {
    const count = selectedRowKeys.length;
    let successCount = 0;
    let errorCount = 0;

    selectedRowKeys.forEach((key, index) => {
      deleteProduct(key as string, {
        onSuccess: () => {
          successCount++;
          if (index === count - 1) {
            if (errorCount === 0) {
              message.success(
                `Successfully deleted ${count} ${getProductPlural(count)}`
              );
            } else {
              message.warning(
                `Deleted ${successCount} ${getProductPlural(
                  successCount
                )}, ${errorCount} failed`
              );
            }
            refetch();
            setSelectedRowKeys([]);
          }
        },
        onError: (error) => {
          errorCount++;
          if (onError && index === count - 1) {
            onError(error as Error);
          }
          if (index === count - 1) {
            if (successCount === 0) {
              if (!onError) {
                message.error(`Failed to delete ${getProductPlural(count)}`);
              }
            } else {
              message.warning(
                `Deleted ${successCount} ${getProductPlural(
                  successCount
                )}, ${errorCount} failed`
              );
            }
            refetch();
            setSelectedRowKeys([]);
          }
        },
      });
    });
  }

  const filterChips = useMemo(() => {
    const chips = [];
    if (search) {
      chips.push({
        key: 'search',
        label: `Search: ${search}`,
        onRemove: () => {
          setSearch('');
          setPageIndex(1);
        },
      });
    }
    if (brandFilter) {
      const brand = brands?.find((b) => b.id === brandFilter);
      chips.push({
        key: 'brand',
        label: `Brand: ${brand?.name || brandFilter}`,
        onRemove: () => {
          setBrandFilter(undefined);
          setPageIndex(1);
        },
      });
    }
    if (typeFilter) {
      const type = types?.find((t) => t.id === typeFilter);
      chips.push({
        key: 'type',
        label: `Type: ${type?.name || typeFilter}`,
        onRemove: () => {
          setTypeFilter(undefined);
          setPageIndex(1);
        },
      });
    }
    return chips;
  }, [search, brandFilter, typeFilter, brands, types]);

  const columns = useMemo<TableColumnsType<Product>>(
    () => [
      {
        title: 'Image',
        dataIndex: 'imageFile',
        key: 'image',
        width: 100,
        fixed: 'left' as const,
        render: (imageFile: string) => {
          if (!imageFile) {
            return (
              <Space
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: token.borderRadius,
                  background: token.colorFillTertiary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  No Image
                </Text>
              </Space>
            );
          }
          return (
            <Image
              src={imageFile}
              alt="Product"
              width={60}
              height={60}
              style={{
                objectFit: 'cover',
                borderRadius: token.borderRadius,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
              preview={{
                mask: <EyeOutlined style={{ fontSize: 16, color: '#fff' }} />,
              }}
            />
          );
        },
      },
      {
        title: 'Product Name',
        dataIndex: 'name',
        key: 'name',
        width: '35%',
        sorter: true,
        ellipsis: true,
        render: (name: string) => <Text strong>{name}</Text>,
      },
      {
        title: 'Brand',
        dataIndex: ['brands', 'name'],
        key: 'brand',
        width: '15%',
        ellipsis: true,
        render: (brand: string) => {
          if (!brand) {
            return <Tag>N/A</Tag>;
          }
          return <Tag color="blue">{brand}</Tag>;
        },
      },
      {
        title: 'Type',
        dataIndex: ['types', 'name'],
        key: 'type',
        width: '15%',
        ellipsis: true,
        render: (type: string) => {
          if (!type) {
            return <Tag>N/A</Tag>;
          }
          return <Tag color="purple">{type}</Tag>;
        },
      },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        width: '15%',
        sorter: true,
        align: 'right' as const,
        render: (price: number) => (
          <Text strong style={{ color: token.colorSuccess }}>
            ${price.toFixed(2)}
          </Text>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 150,
        fixed: 'right' as const,
        render: (_: unknown, record: Product) => (
          <Space size="small">
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                size="small"
              />
            </Tooltip>
            <Popconfirm
              title="Delete Product"
              description={
                <Space direction="vertical" size="small">
                  <Text>Are you sure you want to delete this product?</Text>
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
                  loading={isDeleting}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleEdit, handleDelete, token, isDeleting]
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Space direction="vertical" size={2}>
            <Title level={3} style={{ marginBottom: 0, fontWeight: 600 }}>
              Products
            </Title>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Manage your product catalog, inventory, and pricing
            </Text>
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            aria-label="Create new product"
          >
            Create Product
          </Button>
        </Col>
      </Row>

      <Card bodyStyle={{ padding: token.sizeUnit * 3 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[token.sizeUnit * 2, token.sizeUnit * 2]}>
            <Col xs={24} sm={12} md={8}>
              <Input.Search
                placeholder="Search products by name, SKU..."
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={(value) => {
                  setSearch(value);
                  setPageIndex(1);
                }}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Filter by Brand"
                allowClear
                style={{ width: '100%' }}
                onChange={(value) => {
                  setBrandFilter(value);
                  setPageIndex(1);
                }}
                value={brandFilter}
                options={brands?.map((brand) => ({
                  label: brand.name,
                  value: brand.id,
                }))}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Filter by Type"
                allowClear
                style={{ width: '100%' }}
                onChange={(value) => {
                  setTypeFilter(value);
                  setPageIndex(1);
                }}
                value={typeFilter}
                options={types?.map((type) => ({
                  label: type.name,
                  value: type.id,
                }))}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                style={{ width: '100%' }}
              >
                Refresh
              </Button>
            </Col>
          </Row>

          {filterChips.length > 0 && (
            <FilterBar chips={filterChips} onClearAll={handleClearFilters} />
          )}

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
                  {getProductPlural(selectedRowKeys.length)} selected
                </Text>
                <Popconfirm
                  title={`Delete ${selectedRowKeys.length} ${getProductPlural(
                    selectedRowKeys.length
                  )}?`}
                  description="This action cannot be undone."
                  onConfirm={handleBulkDelete}
                  okText="Yes, Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<DeleteOutlined />} loading={isDeleting}>
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

      <Card bodyStyle={{ padding: 0 }}>
        {isLoading && <SkeletonLoader rows={5} />}
        {!isLoading && products.length === 0 && (
          <Flex justify="center" style={{ padding: token.sizeUnit * 8 }}>
            <EmptyState
              title="No products found"
              description={
                hasActiveFilters
                  ? "Try adjusting your filters to find what you're looking for"
                  : 'Get started by creating your first product'
              }
              action={
                !hasActiveFilters
                  ? {
                      label: 'Create Product',
                      icon: <PlusOutlined />,
                      onClick: handleCreate,
                    }
                  : undefined
              }
            />
          </Flex>
        )}
        {!isLoading && products.length > 0 && (
          <DataTable
            columns={columns}
            dataSource={products}
            rowKey="id"
            loading={isLoading}
            stickyHeader
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            pagination={{
              current: pageIndex,
              pageSize,
              total,
              onChange: (page, size) => {
                setPageIndex(page);
                setPageSize(size);
              },
            }}
          />
        )}
      </Card>
    </Space>
  );
}

export default React.memo(ProductsManagement);
