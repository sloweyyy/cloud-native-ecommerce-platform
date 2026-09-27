import React from 'react';
import { Typography, Row, Col, Flex, Space } from 'antd';
import {
  TruckOutlined,
  UndoOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { themeConfig } from '../../../../config/theme';

const { Title, Text } = Typography;

function FeaturesSection() {

  const features = [
    {
      id: 'freeShipping',
      icon: <TruckOutlined />,
      title: 'Free Shipping',
      description: 'On all orders over $50',
    },
    {
      id: 'easyReturns',
      icon: <UndoOutlined />,
      title: 'Easy Returns',
      description: '30-day money back guarantee',
    },
    {
      id: 'securePayment',
      icon: <SafetyOutlined />,
      title: 'Secure Payment',
      description: '100% secure checkout',
    },
    {
      id: 'support',
      icon: <CustomerServiceOutlined />,
      title: '24/7 Support',
      description: 'Dedicated support team',
    },
  ];

  return (
    <Space
      direction="vertical"
      size="large"
      style={{
        width: '100%',
        padding: '64px 0',
        backgroundColor: themeConfig.token?.colorBgContainer || '#ffffff',
        borderTop: `1px solid ${themeConfig.token?.colorBorderSecondary || '#f1f5f9'}`,
        borderBottom: `1px solid ${themeConfig.token?.colorBorderSecondary || '#f1f5f9'}`,
      }}
    >
      <Row
        gutter={[32, 32]}
        justify="center"
        style={{
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 16px',
        }}
      >
        {features.map((feature) => (
          <Col xs={24} sm={12} md={6} key={feature.id}>
            <Flex
              vertical
              align="center"
              style={{
                textAlign: 'center',
                padding: 16,
              }}
            >
              <Flex
                justify="center"
                align="center"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: (themeConfig.token?.colorPrimary || '#667eea') + '15',
                  color: themeConfig.token?.colorPrimary || '#667eea',
                  borderRadius: '50%',
                  fontSize: '1.25rem',
                  marginBottom: 16,
                }}
              >
                {feature.icon}
              </Flex>
              <Title
                level={4}
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: themeConfig.token?.colorText || '#1e293b',
                  margin: '0 0 8px 0',
                }}
              >
                {feature.title}
              </Title>
              <Text
                style={{
                  fontSize: '0.875rem',
                  color: themeConfig.token?.colorTextTertiary || '#64748b',
                }}
              >
                {feature.description}
              </Text>
            </Flex>
          </Col>
        ))}
      </Row>
    </Space>
  );
}

export default FeaturesSection;

