import React, { useMemo } from 'react';
import { Typography, Card, Descriptions, Button, Space, Avatar, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import { useGetUserProfile } from '../services/user/hooks';

const { Title, Text } = Typography;

type ProfilePageProps = {
  config?: AppInjectorProps['config'];
};

function ProfilePage(props: ProfilePageProps) {
  const { config } = props;
  const { appContext, onNavigate, onError } = config || {};
  const { user: contextUser } = appContext || {};

  const { data: profileData, isLoading } = useGetUserProfile(
    undefined,
    { enabled: !!contextUser }
  );

  const apiUser = useMemo(() => profileData?.data, [profileData?.data]);
  const user = useMemo(() => apiUser || contextUser, [apiUser, contextUser]);

  const roleColor = useMemo(() => {
    if (user?.role === 'admin') {
      return 'red';
    }
    return 'blue';
  }, [user?.role]);

  function getDisplayName(): string {
    if (apiUser) {
      const fullName = `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim();
      if (fullName) return fullName;
      if (apiUser.userName) return apiUser.userName;
      return 'Guest User';
    }
    if (contextUser) {
      const displayName = (contextUser as { displayName?: string }).displayName;
      if (displayName) return displayName;
      const fullName = `${contextUser.firstName || ''} ${contextUser.lastName || ''}`.trim();
      if (fullName) return fullName;
      const username = (contextUser as { username?: string }).username;
      if (username) return username;
      return 'Guest User';
    }
    return 'Guest User';
  }

  function handleEditProfile() {
    try {
      if (onNavigate) {
        onNavigate('/account/profile/edit');
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  }

  if (isLoading) {
    return (
      <Card loading>
        <Title level={2}>My Profile</Title>
      </Card>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>My Profile</Title>
      <Text type="secondary">
        View and manage your profile information
      </Text>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Avatar
              size={100}
              icon={<UserOutlined />}
              src={user?.avatar}
            />
            <Title level={3} style={{ margin: 0 }}>
              {getDisplayName()}
            </Title>
            <Text type="secondary">{user?.role || 'guest'}</Text>
          </Space>

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
              <Tag color={roleColor}>
                {user?.role || 'guest'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Button type="primary" onClick={handleEditProfile} block>
            Edit Profile
          </Button>
        </Space>
      </Card>
    </Space>
  );
}

export default React.memo(ProfilePage);
