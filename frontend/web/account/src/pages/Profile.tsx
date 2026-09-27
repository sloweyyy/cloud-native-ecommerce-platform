import React from 'react';
import { Typography, Space, Card } from 'antd';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import type { AuthUser } from '@ecommerce-platform/auth-provider';
import { ProfileView } from '../components/ProfileView';

const { Title, Text } = Typography;

type ProfilePageProps = {
  config?: AppInjectorProps['config'];
};

/**
 * ProfilePage - Container Component
 *
 * Displays user profile information from Azure AD B2C.
 * No API calls needed - user data comes directly from authentication context.
 */
function ProfilePage(props: ProfilePageProps) {
  const { config } = props;
  const { appContext, onNavigate, onError } = config || {};
  const user = appContext?.user as AuthUser | undefined;

  console.log('[ProfilePage] User from Azure AD B2C:', user);

  // Early return if no user data
  if (!user) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
        <Title level={2}>My Profile</Title>
        <Card>
          <Text type="secondary">No user profile found. Please log in.</Text>
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Title level={2}>My Profile</Title>
      <Text type="secondary">
        View your profile information from Azure AD B2C
      </Text>
      <ProfileView
        user={user}
        isLoading={false}
        onNavigate={onNavigate}
        onError={onError}
      />
    </Space>
  );
}

export default ProfilePage;

