import React from 'react';
import { Space, Typography, Button, Row, Col, Spin } from 'antd';
import { ReloadOutlined, ExportOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

type ActivitiesHeaderProps = {
  viewMode: 'table' | 'statistics';
  isLoading: boolean;
  isRefreshDisabled: boolean;
  onViewModeChange: (mode: 'table' | 'statistics') => void;
  onExport: () => void;
  onRefresh: () => void;
};

function ActivitiesHeader(props: ActivitiesHeaderProps) {
  const {
    viewMode,
    isLoading,
    isRefreshDisabled,
    onViewModeChange,
    onExport,
    onRefresh,
  } = props;

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Space direction="vertical" size="small">
            <Title level={3} style={{ marginBottom: 0 }}>
              Activities
            </Title>
            <Text type="secondary">
              Audit trail, debugging, and system monitoring
            </Text>
          </Space>
        </Col>
        <Col>
          <Space>
            {viewMode === 'table' && (
              <Button type="primary" onClick={() => onViewModeChange('table')}>
                Table View
              </Button>
            )}
            {viewMode !== 'table' && (
              <Button onClick={() => onViewModeChange('table')}>
                Table View
              </Button>
            )}
            {viewMode === 'statistics' && (
              <Button
                type="primary"
                onClick={() => onViewModeChange('statistics')}
              >
                Statistics
              </Button>
            )}
            {viewMode !== 'statistics' && (
              <Button onClick={() => onViewModeChange('statistics')}>
                Statistics
              </Button>
            )}
            <Button icon={<ExportOutlined />} onClick={onExport}>
              Export
            </Button>
            {isLoading && (
              <Button
                icon={<Spin size="small" />}
                onClick={onRefresh}
                loading
                disabled
              >
                Refresh
              </Button>
            )}
            {!isLoading && (
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                disabled={isRefreshDisabled}
              >
                Refresh
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    </Space>
  );
}

export default ActivitiesHeader;
