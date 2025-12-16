import React, { useState } from 'react';
import {
  Typography,
  Card,
  Button,
  Switch,
  Space,
  message,
  Flex,
  Divider,
} from 'antd';
import type { SettingsViewProps } from './types';

const { Title, Text } = Typography;

interface SettingItemProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * SettingItem Component
 *
 * A single setting toggle item.
 */
const SettingItem: React.FC<SettingItemProps> = ({
  title,
  description,
  checked,
  onChange,
}) => (
  <Flex justify="space-between" align="center">
    <Flex vertical gap={4}>
      <Text strong>{title}</Text>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {description}
      </Text>
    </Flex>
    <Switch checked={checked} onChange={onChange} />
  </Flex>
);

/**
 * SettingsView Component
 *
 * Account settings with notification toggles and account actions.
 */
export const SettingsView: React.FC<SettingsViewProps> = ({
  onLogout,
  onNavigate,
  onError,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const handleToggleNotifications = (checked: boolean) => {
    setNotificationsEnabled(checked);
    message.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleToggleEmailUpdates = (checked: boolean) => {
    setEmailUpdates(checked);
    message.success(`Email updates ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleChangePassword = () => {
    try {
      message.info('Change password functionality coming soon');
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleLogout = async () => {
    try {
      await onLogout();
      message.success('Logged out successfully');
      onNavigate?.('/login');
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <Card>
      <Title level={3}>Account Settings</Title>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <section>
          <Title level={5}>Notifications</Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <SettingItem
              title="Push Notifications"
              description="Receive notifications about orders and promotions"
              checked={notificationsEnabled}
              onChange={handleToggleNotifications}
            />
            <SettingItem
              title="Email Updates"
              description="Receive email updates about your orders"
              checked={emailUpdates}
              onChange={handleToggleEmailUpdates}
            />
          </Space>
        </section>

        <Divider />

        <section>
          <Title level={5}>Account Actions</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block onClick={handleChangePassword}>
              Change Password
            </Button>
            <Button danger block onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </section>
      </Space>
    </Card>
  );
};

export default SettingsView;

