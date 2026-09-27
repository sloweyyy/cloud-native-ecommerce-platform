import React, { useMemo, useCallback } from 'react';
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Space,
  Row,
  Col,
  Tabs,
  Tag,
  theme,
  message,
  Flex,
} from 'antd';
import {
  PlusOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import {
  useGetAllBrands,
  useCreateBrand,
  useGetAllTypes,
  useCreateType,
} from '../../services';
import { DataTable, EmptyState, SkeletonLoader } from '../../components/shared';

const { Title, Text } = Typography;

const CONFIG = {
  COLUMNS: {
    ID_WIDTH: '30%',
    NAME_WIDTH: '70%',
  },
  VALIDATION: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  SPACING: {
    FORM_PADDING_MULTIPLIER: 3,
    GUTTER_MULTIPLIER: 2,
    EMPTY_STATE_PADDING_MULTIPLIER: 8,
  },
  COLORS: {
    BRAND_TAG: 'blue',
    TYPE_TAG: 'purple',
  },
  ID_DISPLAY_LENGTH: 8,
  PLACEHOLDERS: {
    BRAND: 'Enter brand name (e.g., Apple, Samsung)',
    TYPE: 'Enter type name (e.g., Electronics, Clothing)',
  },
  MESSAGES: {
    BRAND_CREATED: (name: string) => `Brand "${name}" created successfully`,
    TYPE_CREATED: (name: string) => `Type "${name}" created successfully`,
    BRAND_ERROR: 'Failed to create brand',
    TYPE_ERROR: 'Failed to create type',
    BRAND_REQUIRED: 'Brand name is required',
    TYPE_REQUIRED: 'Type name is required',
    MIN_LENGTH: 'must be at least 2 characters',
    MAX_LENGTH: 'must not exceed 100 characters',
  },
  EMPTY_STATES: {
    BRAND_TITLE: 'No brands yet',
    BRAND_DESCRIPTION: 'Create your first brand to get started',
    TYPE_TITLE: 'No types yet',
    TYPE_DESCRIPTION: 'Create your first type to get started',
  },
} as const;

type BrandsTypesManagementProps = {
  config?: AppInjectorProps['config'];
};

function BrandsTypesManagement(props: BrandsTypesManagementProps) {
  const { config } = props;
  const { onError } = config || {};

  const [brandForm] = Form.useForm();
  const [typeForm] = Form.useForm();

  const { token } = theme.useToken();
  const {
    data: brands = [],
    isLoading: isLoadingBrands,
    refetch: refetchBrands,
  } = useGetAllBrands();
  const { mutate: createBrand, isPending: isCreatingBrand } = useCreateBrand();
  const {
    data: types = [],
    isLoading: isLoadingTypes,
    refetch: refetchTypes,
  } = useGetAllTypes();
  const { mutate: createType, isPending: isCreatingType } = useCreateType();
  const handleCreateBrand = useCallback(
    (values: { name: string }) => {
      createBrand(values, {
        onSuccess: () => {
          brandForm.resetFields();
          refetchBrands();
          message.success(CONFIG.MESSAGES.BRAND_CREATED(values.name));
        },
        onError: (error) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : CONFIG.MESSAGES.BRAND_ERROR;
          if (onError) {
            onError(error as Error);
          } else {
            message.error(errorMessage);
          }
        },
      });
    },
    [createBrand, brandForm, refetchBrands, onError]
  );

  const handleCreateType = useCallback(
    (values: { name: string }) => {
      createType(values, {
        onSuccess: () => {
          typeForm.resetFields();
          refetchTypes();
          message.success(CONFIG.MESSAGES.TYPE_CREATED(values.name));
        },
        onError: (error) => {
          const errorMessage =
            error instanceof Error ? error.message : CONFIG.MESSAGES.TYPE_ERROR;
          if (onError) {
            onError(error as Error);
          } else {
            message.error(errorMessage);
          }
        },
      });
    },
    [createType, typeForm, refetchTypes, onError]
  );

  const brandColumns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: CONFIG.COLUMNS.ID_WIDTH,
        render: (id: string) => (
          <Text type="secondary" style={{ fontFamily: 'monospace' }}>
            {id.slice(-CONFIG.ID_DISPLAY_LENGTH)}
          </Text>
        ),
      },
      {
        title: 'Brand Name',
        dataIndex: 'name',
        key: 'name',
        width: CONFIG.COLUMNS.NAME_WIDTH,
        ellipsis: true,
        render: (name: string) => (
          <Tag color={CONFIG.COLORS.BRAND_TAG}>{name}</Tag>
        ),
      },
    ],
    []
  );

  const typeColumns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: CONFIG.COLUMNS.ID_WIDTH,
        render: (id: string) => (
          <Text type="secondary" style={{ fontFamily: 'monospace' }}>
            {id.slice(-CONFIG.ID_DISPLAY_LENGTH)}
          </Text>
        ),
      },
      {
        title: 'Type Name',
        dataIndex: 'name',
        key: 'name',
        width: CONFIG.COLUMNS.NAME_WIDTH,
        ellipsis: true,
        render: (name: string) => (
          <Tag color={CONFIG.COLORS.TYPE_TAG}>{name}</Tag>
        ),
      },
    ],
    []
  );

  const tabItems = useMemo(
    () => [
      {
        key: 'brands',
        label: (
          <Space>
            <ShoppingOutlined />
            <Text strong>Brands</Text>
            {brands.length > 0 && (
              <Tag color={CONFIG.COLORS.BRAND_TAG}>{brands.length}</Tag>
            )}
          </Space>
        ),
        children: (
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card
                title={
                  <Text strong style={{ fontSize: token.fontSizeLG }}>
                    Create New Brand
                  </Text>
                }
                bodyStyle={{
                  padding:
                    token.sizeUnit * CONFIG.SPACING.FORM_PADDING_MULTIPLIER,
                  background: token.colorFillTertiary,
                }}
              >
                <Form
                  form={brandForm}
                  onFinish={handleCreateBrand}
                  layout="vertical"
                >
                  <Row
                    gutter={token.sizeUnit * CONFIG.SPACING.GUTTER_MULTIPLIER}
                  >
                    <Col xs={24} sm={16} md={18}>
                      <Form.Item
                        name="name"
                        label={<Text strong>Brand Name</Text>}
                        rules={[
                          {
                            required: true,
                            message: CONFIG.MESSAGES.BRAND_REQUIRED,
                          },
                          {
                            min: CONFIG.VALIDATION.MIN_LENGTH,
                            message: `Brand name ${CONFIG.MESSAGES.MIN_LENGTH}`,
                          },
                          {
                            max: CONFIG.VALIDATION.MAX_LENGTH,
                            message: `Brand name ${CONFIG.MESSAGES.MAX_LENGTH}`,
                          },
                        ]}
                        hasFeedback
                      >
                        <Input placeholder={CONFIG.PLACEHOLDERS.BRAND} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                      <Form.Item label={<Space />} style={{ marginBottom: 0 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<PlusOutlined />}
                          loading={isCreatingBrand}
                          block
                        >
                          Add Brand
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>

              <Card bodyStyle={{ padding: 0 }}>
                {isLoadingBrands && (
                  <Flex
                    justify="center"
                    style={{
                      padding:
                        token.sizeUnit *
                        CONFIG.SPACING.EMPTY_STATE_PADDING_MULTIPLIER,
                    }}
                  >
                    <SkeletonLoader />
                  </Flex>
                )}
                {!isLoadingBrands && brands.length === 0 && (
                  <Flex
                    justify="center"
                    style={{
                      padding:
                        token.sizeUnit *
                        CONFIG.SPACING.EMPTY_STATE_PADDING_MULTIPLIER,
                    }}
                  >
                    <EmptyState
                      title={CONFIG.EMPTY_STATES.BRAND_TITLE}
                      description={CONFIG.EMPTY_STATES.BRAND_DESCRIPTION}
                    />
                  </Flex>
                )}
                {!isLoadingBrands && brands.length > 0 && (
                  <DataTable
                    columns={brandColumns}
                    dataSource={brands}
                    rowKey="id"
                    stickyHeader
                    pagination={false}
                  />
                )}
              </Card>
            </Space>
          </Card>
        ),
      },
      {
        key: 'types',
        label: (
          <Space>
            <AppstoreOutlined />
            <Text strong>Types</Text>
            {types.length > 0 && (
              <Tag color={CONFIG.COLORS.TYPE_TAG}>{types.length}</Tag>
            )}
          </Space>
        ),
        children: (
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card
                title={
                  <Text strong style={{ fontSize: token.fontSizeLG }}>
                    Create New Type
                  </Text>
                }
                bodyStyle={{
                  padding:
                    token.sizeUnit * CONFIG.SPACING.FORM_PADDING_MULTIPLIER,
                  background: token.colorFillTertiary,
                }}
              >
                <Form
                  form={typeForm}
                  onFinish={handleCreateType}
                  layout="vertical"
                >
                  <Row
                    gutter={token.sizeUnit * CONFIG.SPACING.GUTTER_MULTIPLIER}
                  >
                    <Col xs={24} sm={16} md={18}>
                      <Form.Item
                        name="name"
                        label={<Text strong>Type Name</Text>}
                        rules={[
                          {
                            required: true,
                            message: CONFIG.MESSAGES.TYPE_REQUIRED,
                          },
                          {
                            min: CONFIG.VALIDATION.MIN_LENGTH,
                            message: `Type name ${CONFIG.MESSAGES.MIN_LENGTH}`,
                          },
                          {
                            max: CONFIG.VALIDATION.MAX_LENGTH,
                            message: `Type name ${CONFIG.MESSAGES.MAX_LENGTH}`,
                          },
                        ]}
                        hasFeedback
                      >
                        <Input placeholder={CONFIG.PLACEHOLDERS.TYPE} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                      <Form.Item label={<Space />} style={{ marginBottom: 0 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<PlusOutlined />}
                          loading={isCreatingType}
                          block
                        >
                          Add Type
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>

              <Card bodyStyle={{ padding: 0 }}>
                {isLoadingTypes && (
                  <Flex
                    justify="center"
                    style={{
                      padding:
                        token.sizeUnit *
                        CONFIG.SPACING.EMPTY_STATE_PADDING_MULTIPLIER,
                    }}
                  >
                    <SkeletonLoader />
                  </Flex>
                )}
                {!isLoadingTypes && types.length === 0 && (
                  <Flex
                    justify="center"
                    style={{
                      padding:
                        token.sizeUnit *
                        CONFIG.SPACING.EMPTY_STATE_PADDING_MULTIPLIER,
                    }}
                  >
                    <EmptyState
                      title={CONFIG.EMPTY_STATES.TYPE_TITLE}
                      description={CONFIG.EMPTY_STATES.TYPE_DESCRIPTION}
                    />
                  </Flex>
                )}
                {!isLoadingTypes && types.length > 0 && (
                  <DataTable
                    columns={typeColumns}
                    dataSource={types}
                    rowKey="id"
                    stickyHeader
                    pagination={false}
                  />
                )}
              </Card>
            </Space>
          </Card>
        ),
      },
    ],
    [
      brands,
      types,
      token,
      brandColumns,
      typeColumns,
      handleCreateBrand,
      handleCreateType,
      isCreatingBrand,
      isCreatingType,
      isLoadingBrands,
      isLoadingTypes,
      brandForm,
      typeForm,
    ]
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space direction="vertical" size={2}>
        <Title level={3} style={{ marginBottom: 0, fontWeight: 600 }}>
          Brands & Types
        </Title>
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          Manage product brands and categories
        </Text>
      </Space>

      <Tabs items={tabItems} />
    </Space>
  );
}

export default React.memo(BrandsTypesManagement);
