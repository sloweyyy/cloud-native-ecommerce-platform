import React, { useMemo, useCallback } from 'react';
import { Dropdown, Avatar, Flex, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { NavbarActionButton } from './NavbarActionButton';
import { brandGradient } from '../../../constants/theme';
import { useNavigate } from '../../../utils/navigation-handler';

const { Text, Title } = Typography;

/**
 * Get user initials from display name
 */
const getUserInitials = (displayName?: string): string => {
  if (!displayName) return 'U';
  const names = displayName.trim().split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return displayName.substring(0, 2).toUpperCase();
};

/**
 * Profile header component for authenticated users
 */
interface ProfileHeaderProps {
  displayName: string;
  email?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  displayName,
  email,
}) => (
  <Flex
    vertical
    gap={4}
    style={{
      padding: '16px 20px',
      background: `linear-gradient(135deg, ${brandGradient.start} 0%, ${brandGradient.end} 100%)`,
      borderRadius: '12px 12px 0 0',
      marginTop: -4,
      marginLeft: -4,
      marginRight: -4,
    }}
  >
    <Title
      level={5}
      style={{
        margin: 0,
        color: '#fff',
        fontWeight: 600,
      }}
    >
      {displayName}
    </Title>
    {email && (
      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.85)',
          fontSize: 12,
        }}
      >
        {email}
      </Text>
    )}
  </Flex>
);

/**
 * Authenticated user avatar with initials and brand styling
 */
interface AuthenticatedAvatarProps {
  displayName?: string;
}

const AuthenticatedAvatar: React.FC<AuthenticatedAvatarProps> = ({
  displayName,
}) => (
  <Avatar
    size={28}
    style={{
      background: `linear-gradient(135deg, ${brandGradient.start} 0%, ${brandGradient.end} 100%)`,
      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
      fontWeight: 600,
      fontSize: 11,
    }}
  >
    {getUserInitials(displayName)}
  </Avatar>
);

interface UserMenuButtonProps {
  appName?: string;
}

/**
 * User menu button component for the navbar
 * Displays user avatar with dropdown menu for authenticated/unauthenticated users
 */
export const UserMenuButton: React.FC<UserMenuButtonProps> = ({ appName }) => {
  const navigate = useNavigate(appName);
  const { isAuthenticated, logout: authLogout, user } = useAuth();

  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    await authLogout();
  }, [authLogout]);

  const authenticatedMenuItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'header',
        label: (
          <ProfileHeader
            displayName={user?.displayName || 'User'}
            email={user?.email}
          />
        ),
        style: { padding: 0, cursor: 'default' },
        disabled: true,
      },
      {
        type: 'divider' as const,
        style: { margin: '8px 0' },
      },
      {
        key: 'profile',
        icon: <UserOutlined style={{ fontSize: 16 }} />,
        label: 'My Account',
        onClick: () => navigate('/account'),
      },
      {
        key: 'orders',
        icon: <ShoppingOutlined style={{ fontSize: 16 }} />,
        label: 'My Orders',
        onClick: () => navigate('/account/orders'),
      },
      {
        key: 'settings',
        icon: <SettingOutlined style={{ fontSize: 16 }} />,
        label: 'Settings',
        onClick: () => navigate('/account/settings'),
      },
      {
        type: 'divider' as const,
        style: { margin: '8px 0' },
      },
      {
        key: 'logout',
        icon: <LogoutOutlined style={{ fontSize: 16 }} />,
        label: 'Sign Out',
        danger: true,
        onClick: handleLogout,
      },
    ],
    [navigate, handleLogout, user]
  );

  const guestMenuItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'guest-header',
        label: (
          <Flex
            vertical
            gap={4}
            style={{
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: '12px 12px 0 0',
              marginTop: -4,
              marginLeft: -4,
              marginRight: -4,
            }}
          >
            <Text strong style={{ fontSize: 14 }}>
              Welcome to NextTech
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Sign in for the best experience
            </Text>
          </Flex>
        ),
        style: { padding: 0, cursor: 'default' },
        disabled: true,
      },
      {
        type: 'divider' as const,
        style: { margin: '8px 0' },
      },
      {
        key: 'login',
        icon: <LoginOutlined style={{ fontSize: 16 }} />,
        label: (
          <Text strong style={{ color: brandGradient.start }}>
            Sign In
          </Text>
        ),
        onClick: handleLogin,
      },
      {
        key: 'register',
        icon: <UserAddOutlined style={{ fontSize: 16 }} />,
        label: 'Create Account',
        onClick: () => navigate('/register'),
      },
    ],
    [navigate, handleLogin]
  );

  const menuItems = isAuthenticated ? authenticatedMenuItems : guestMenuItems;

  const displayName = isAuthenticated
    ? user?.displayName || 'Account'
    : 'Sign In';

  const userIcon = isAuthenticated ? (
    <AuthenticatedAvatar displayName={user?.displayName} />
  ) : (
    <Avatar
      size={28}
      icon={<UserOutlined />}
      style={{
        background: '#e2e8f0',
        color: '#64748b',
      }}
    />
  );

  return (
    <Dropdown
      menu={{
        items: menuItems,
        style: {
          minWidth: 220,
          padding: 4,
          borderRadius: 16,
          boxShadow: '0 10px 40px rgba(15, 23, 42, 0.15)',
        },
      }}
      placement="bottomRight"
      trigger={['click']}
      overlayStyle={{ paddingTop: 8 }}
    >
      <div style={{ cursor: 'pointer' }}>
        <NavbarActionButton
          icon={userIcon}
          label={displayName}
          ariaLabel="User menu"
        />
      </div>
    </Dropdown>
  );
};

export default UserMenuButton;

