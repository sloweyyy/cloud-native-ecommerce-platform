import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Space, Typography, Row, Col, theme } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { StatsCards } from '../components/shared';
import QuickActions from '../components/Dashboard/QuickActions';
import RecentActivity from '../components/Dashboard/RecentActivity';
import { useDashboardData } from '../components/Dashboard/useDashboardData';

const { Title, Text } = Typography;

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { statistics, recentActivities, isLoadingActivities } =
    useDashboardData();

  function handleNavigateToProducts() {
    navigate({ to: '/products' });
  }

  function handleNavigateToOrders() {
    navigate({ to: '/orders' });
  }

  function handleCreateProduct() {
    navigate({ to: '/products/new' });
  }

  function handleViewAllActivities() {
    navigate({ to: '/activities' });
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Title level={3} style={{ marginBottom: 0 }}>
          Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          Monitor your e-commerce platform performance and manage your business
          efficiently
        </Text>
      </Space>

      <StatsCards statistics={statistics} />

      <Row gutter={[token.sizeUnit * 2, token.sizeUnit * 2]}>
        <Col xs={24} lg={16}>
          <QuickActions
            onCreateProduct={handleCreateProduct}
            onManageProducts={handleNavigateToProducts}
            onViewOrders={handleNavigateToOrders}
            onViewReports={handleNavigateToProducts}
          />
        </Col>
        <Col xs={24} lg={8}>
          <RecentActivity
            activities={recentActivities}
            isLoading={isLoadingActivities}
            onViewAll={handleViewAllActivities}
            onActivityClick={handleViewAllActivities}
          />
        </Col>
      </Row>
    </Space>
  );
}

export default React.memo(Dashboard);
