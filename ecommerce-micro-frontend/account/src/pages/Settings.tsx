import React, { useState } from 'react';
import { Typography, Card, Switch, Space, Button, message } from 'antd';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';

const { Title, Text } = Typography;

type SettingsPageProps = {
  config?: AppInjectorProps['config'];
};

const SettingsPage: React.FC<SettingsPageProps> = ({ config }) => {
  const { onNavigate, onLogout, onError } = config || {};

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

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

  const handleLogout = () => {
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
  };

  const handleToggleNotifications = (checked: boolean) => {
    setNotificationsEnabled(checked);
    message.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleToggleEmailUpdates = (checked: boolean) => {
    setEmailUpdates(checked);
    message.success(`Email updates ${checked ? 'enabled' : 'disabled'}`);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Account Settings</Title>
      <Text
        type="secondary"
        style={{ display: 'block', marginBottom: '24px' }}
      >
        Manage your account preferences and settings
      </Text>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={5}>Notifications</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Text strong>Push Notifications</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Receive notifications about orders and promotions
                  </Text>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onChange={handleToggleNotifications}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Text strong>Email Updates</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Receive email updates about your orders
                  </Text>
                </div>
                <Switch
                  checked={emailUpdates}
                  onChange={handleToggleEmailUpdates}
                />
              </div>
            </Space>
          </div>

          <div>
            <Title level={5}>Account Actions</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block onClick={handleEditProfile}>
                Change Password
              </Button>
              <Button danger block onClick={handleLogout}>
                Logout
              </Button>
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default SettingsPage;

