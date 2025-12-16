import React from 'react';
import {
  Typography,
  Card,
  Descriptions,
  Button,
  Space,
  Avatar,
  message,
  Flex,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { ProfileViewProps } from './types';

const { Title } = Typography;

/**
 * ProfileView Component
 *
 * Displays user profile information with edit functionality.
 */
export const ProfileView: React.FC<ProfileViewProps> = ({ user, onError }) => {
  const handleEditProfile = () => {
    try {
      message.info('Edit profile functionality coming soon');
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Flex vertical align="center" gap={8}>
          <Avatar size={100} icon={<UserOutlined />} />
          <Title level={3} style={{ margin: 0 }}>
            {user.displayName}
          </Title>
        </Flex>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="Display Name">
            {user.displayName}
          </Descriptions.Item>
          <Descriptions.Item label="Username">
            {user.username || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {user.email || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="First Name">
            {user.firstName || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Last Name">
            {user.lastName || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
        </Descriptions>

        <Button type="primary" onClick={handleEditProfile} block>
          Edit Profile
        </Button>
      </Space>
    </Card>
  );
};

export default ProfileView;
