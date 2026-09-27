import React from 'react';
import { Typography, Card, Descriptions, Space, Avatar, Flex } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { ProfileViewProps } from '../types';

const { Title, Text } = Typography;

function ProfileView(props: ProfileViewProps) {
  const { user } = props;

  function getDisplayName(): string {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.username || user.displayName || user.email || 'Guest User';
  }

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Flex vertical align="center" gap={8}>
          <Avatar size={100} icon={<UserOutlined />} />
          <Title level={3} style={{ margin: 0 }}>
            {getDisplayName()}
          </Title>
        </Flex>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="Display Name">
            {user.displayName || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {user.email || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Username">
            {user.username || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="First Name">
            {user.firstName || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Last Name">
            {user.lastName || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="User ID">
            {user.id || 'N/A'}
          </Descriptions.Item>
        </Descriptions>

        <Text type="secondary" style={{ textAlign: 'center' }}>
          Profile information is managed through Azure AD B2C. Contact your
          administrator to update your profile.
        </Text>
      </Space>
    </Card>
  );
}

export default React.memo(ProfileView);
