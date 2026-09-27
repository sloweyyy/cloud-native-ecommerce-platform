import React, { useState } from 'react';
import { Typography, Card, Switch, Space, Button, message, Flex } from 'antd';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';

const { Title, Text } = Typography;

type SettingsPageProps = {
  config?: AppInjectorProps['config'];
};

function SettingsPage(props: SettingsPageProps) {
  const { config } = props;
  const { onNavigate, onLogout, onError } = config || {};

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

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

  function handleLogout() {
    try {
      if (onLogout) {
        onLogout();
      } else if (onNavigate) {
        onNavigate('/login');
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  }

  function handleToggleNotifications(checked: boolean) {
    setNotificationsEnabled(checked);
    let status = 'disabled';
    if (checked) {
      status = 'enabled';
    }
    message.success(`Notifications ${status}`);
  }

  function handleToggleEmailUpdates(checked: boolean) {
    setEmailUpdates(checked);
    let status = 'disabled';
    if (checked) {
      status = 'enabled';
    }
    message.success(`Email updates ${status}`);
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Account Settings</Title>
      <Text type="secondary">Manage your account preferences and settings</Text>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={5}>Notifications</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Flex justify="space-between" align="center">
                <Space direction="vertical" size={0}>
                  <Text strong>Push Notifications</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Receive notifications about orders and promotions
                  </Text>
                </Space>
                <Switch
                  checked={notificationsEnabled}
                  onChange={handleToggleNotifications}
                />
              </Flex>
              <Flex justify="space-between" align="center">
                <Space direction="vertical" size={0}>
                  <Text strong>Email Updates</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Receive email updates about your orders
                  </Text>
                </Space>
                <Switch
                  checked={emailUpdates}
                  onChange={handleToggleEmailUpdates}
                />
              </Flex>
            </Space>
          </Space>

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={5}>Account Actions</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block onClick={handleEditProfile}>
                Change Password
              </Button>
              <Button danger block onClick={handleLogout}>
                Logout
              </Button>
            </Space>
          </Space>
        </Space>
      </Card>
    </Space>
  );
}

export default React.memo(SettingsPage);
