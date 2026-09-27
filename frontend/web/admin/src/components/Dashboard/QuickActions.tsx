import React from 'react';
import { Card, Row, Col, Button, Typography, theme } from 'antd';
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { getIcon } from '../shared/utils/iconUtils';

const { Text } = Typography;

type QuickActionsProps = {
  onCreateProduct: () => void;
  onManageProducts: () => void;
  onViewOrders: () => void;
  onViewReports: () => void;
};

function QuickActions(props: QuickActionsProps) {
  const { onCreateProduct, onManageProducts, onViewOrders, onViewReports } =
    props;
  const { token } = theme.useToken();

  return (
    <Card
      title={
        <Text strong style={{ fontSize: token.fontSizeLG }}>
          Quick Actions
        </Text>
      }
      bodyStyle={{ padding: token.sizeUnit * 4 }}
    >
      <Row gutter={[token.sizeUnit * 2, token.sizeUnit * 2]}>
        <Col xs={24} sm={12}>
          <Button
            type="primary"
            block
            icon={<PlusOutlined />}
            onClick={onCreateProduct}
          >
            Create New Product
          </Button>
        </Col>
        <Col xs={24} sm={12}>
          <Button
            block
            icon={React.createElement(getIcon('products'))}
            onClick={onManageProducts}
          >
            Manage Products
          </Button>
        </Col>
        <Col xs={24} sm={12}>
          <Button
            block
            icon={React.createElement(getIcon('orders'))}
            onClick={onViewOrders}
          >
            View Orders
          </Button>
        </Col>
        <Col xs={24} sm={12}>
          <Button block icon={<FileTextOutlined />} onClick={onViewReports}>
            View Reports
          </Button>
        </Col>
      </Row>
    </Card>
  );
}

export default QuickActions;
