import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Typography, Row, Col, Flex } from 'antd';
import {
  CheckCircleOutlined,
  TruckOutlined,
  SafetyOutlined,
  UndoOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

function TrustBadges() {
  const { t } = useTranslation();

  const badges = [
    {
      id: 'authentic',
      icon: <CheckCircleOutlined />,
      text: t('homepage.trustBadges.authentic'),
    },
    {
      id: 'freeShipping',
      icon: <TruckOutlined />,
      text: t('homepage.trustBadges.freeShipping'),
    },
    {
      id: 'refund',
      icon: <SafetyOutlined />,
      text: t('homepage.trustBadges.refund'),
    },
    {
      id: 'return',
      icon: <UndoOutlined />,
      text: t('homepage.trustBadges.return'),
    },
    {
      id: 'fastDelivery',
      icon: <ThunderboltOutlined />,
      text: t('homepage.trustBadges.fastDelivery'),
    },
  ];

  return (
    <Row
      gutter={[16, 16]}
      justify="center"
      style={{ margin: '48px 0' }}
    >
      {badges.map((badge) => (
        <Col xs={12} sm={12} md={8} lg={4} xl={4} key={badge.id}>
          <Card
            hoverable
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              background: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            styles={{
              body: {
                padding: 8,
              },
            }}
          >
            <Flex
              vertical
              align="center"
              gap={12}
              style={{
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '2.5em',
                  color: '#3048a5',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {badge.icon}
              </div>
              <Text
                style={{
                  fontSize: '0.9em',
                  fontWeight: 600,
                  color: '#1e293b',
                  lineHeight: 1.4,
                }}
              >
                {badge.text}
              </Text>
            </Flex>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default TrustBadges;

