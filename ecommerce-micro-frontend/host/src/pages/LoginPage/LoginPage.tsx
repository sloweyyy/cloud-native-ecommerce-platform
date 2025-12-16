import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Typography, Button, Spin, Space, Flex, Result } from 'antd';
import { LoginOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { brandGradient } from '../../config/theme';

const { Title, Text } = Typography;

/**
 * Login Page Component
 *
 * Handles user authentication via Azure AD B2C using MSAL.
 * Redirects to Azure B2C login page when user clicks sign in.
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error } = useAuth();

  // Get the return URL from state or default to home
  const from = (location.state as { from?: string })?.from || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{
          minHeight: '100vh',
          background: brandGradient.start,
        }}
      >
        <Space direction="vertical" align="center">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#fff' }} spin />} />
          <Text style={{ color: '#fff', fontSize: 16 }}>Checking authentication...</Text>
        </Space>
      </Flex>
    );
  }

  // Show error state
  if (error) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{
          minHeight: '100vh',
          background: brandGradient.start,
          padding: '48px 32px',
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: 500,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 32,
            boxShadow: '0 25px 80px rgba(15, 23, 42, 0.35)',
            padding: '40px',
          }}
          styles={{ body: { padding: 0 } }}
        >
          <Result
            status="error"
            title="Authentication Error"
            subTitle={error.message || 'An error occurred during authentication'}
            extra={[
              <Button type="primary" key="retry" onClick={handleLogin}>
                Try Again
              </Button>,
              <Button key="home" onClick={() => navigate('/')}>
                Go Home
              </Button>,
            ]}
          />
        </Card>
      </Flex>
    );
    }

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        minHeight: '100vh',
        height: '100vh',
        background: brandGradient.start,
        margin: 0,
        padding: '48px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 32,
          boxShadow:
            '0 25px 80px rgba(15, 23, 42, 0.35), 0 10px 30px rgba(102, 126, 234, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          padding: '56px 48px',
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(20px)',
        }}
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative' }}>
          <Title
            level={2}
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: brandGradient.start,
              marginBottom: 12,
              position: 'relative',
              letterSpacing: '-0.5px',
            }}
          >
            Welcome
          </Title>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 400 }}>
            Sign in with your account to continue
          </Text>
        </div>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Button
              type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={handleLogin}
              block
              style={{
                height: 56,
                borderRadius: 16,
                background: brandGradient.start,
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
              }}
            >
            Sign In with Azure AD
            </Button>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              You will be redirected to Microsoft login page
            </Text>
          </div>
        </Space>
      </Card>
    </Flex>
  );
};

export default LoginPage;
