import React from 'react';
import { Typography, Card, Descriptions, Button, Space, Avatar, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import { useGetUserProfile } from '../services/user/hooks';

const { Title, Text } = Typography;

type ProfilePageProps = {
  config?: AppInjectorProps['config'];
};

const ProfilePage: React.FC<ProfilePageProps> = ({ config }) => {
  const { appContext, onNavigate, onError } = config || {};
  const { user: contextUser } = appContext || {};

  // Fetch user profile from API
  const { data: profileData, isLoading } = useGetUserProfile(
    undefined,
    { enabled: !!contextUser }
  );

  // Use API data if available, fallback to context user
  const apiUser = profileData?.data;
  const user = apiUser || contextUser;

  // Helper to get display name (handles Azure AD B2C format)
  const getDisplayName = (): string => {
    if (apiUser) {
      const fullName = `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim();
      return fullName || apiUser.userName || 'Guest User';
    }
    if (contextUser) {
      // Handle context user (may have displayName from MSAL)
      const displayName = (contextUser as { displayName?: string }).displayName;
      if (displayName) return displayName;
      const fullName = `${contextUser.firstName || ''} ${contextUser.lastName || ''}`.trim();
      return fullName || (contextUser as { username?: string }).username || 'Guest User';
    }
    return 'Guest User';
  };

  const handleEditProfile = () => {
    try {
      if (onNavigate) {
        onNavigate('/account/profile/edit');
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <Card loading={true}>
          <Title level={2}>My Profile</Title>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>My Profile</Title>
      <Text
        type="secondary"
        style={{ display: 'block', marginBottom: '24px' }}
      >
        View and manage your profile information
      </Text>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Avatar
              size={100}
              icon={<UserOutlined />}
              src={user?.avatar}
              style={{ marginBottom: 16 }}
            />
            <Title level={3} style={{ margin: 0 }}>
              {getDisplayName()}
            </Title>
            <Text type="secondary">{user?.role || 'guest'}</Text>
          </div>

          <Descriptions bordered column={1}>
            <Descriptions.Item label="Full Name">
              {getDisplayName()}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {user?.email || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {user?.phone || 'Not provided'}
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag color={user?.role === 'admin' ? 'red' : 'blue'}>
                {user?.role || 'guest'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Button type="primary" onClick={handleEditProfile} block>
            Edit Profile
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default ProfilePage;

