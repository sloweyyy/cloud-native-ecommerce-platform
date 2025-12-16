import React from 'react';
import { Flex, Space, Typography, Button } from 'antd';
import { PhoneOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { PROMO_MESSAGES, CONTACT_INFO } from '../../constants/navbar';
import { brandGradient } from '../../config/theme';

const { Text } = Typography;

const TopBar: React.FC = () => {
  const handleLiveChat = () => {
    // TODO: Implement live chat functionality
    console.info('Live chat feature coming soon');
  };

  return (
    <Flex
      style={{
        background: brandGradient.start,
        color: '#ffffff',
        padding: '10px 0',
        fontSize: 13,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1001,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      justify="space-between"
      align="center"
    >
      <Flex
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 32px',
          width: '100%',
        }}
        justify="space-between"
        align="center"
      >
        <Space split={<span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>}>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 400,
              letterSpacing: '0.3px',
            }}
          >
            {PROMO_MESSAGES.freeShipping}
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 400,
              letterSpacing: '0.3px',
            }}
          >
            {PROMO_MESSAGES.flashSale}
          </Text>
        </Space>
        <Space split={<span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>}>
          <Button
            type="text"
            href={CONTACT_INFO.phoneLink}
            icon={<PhoneOutlined />}
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              padding: '4px 8px',
            }}
          >
            Hotline: {CONTACT_INFO.phone}
          </Button>
          <Button
            type="text"
            icon={<CustomerServiceOutlined />}
            onClick={handleLiveChat}
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              padding: '4px 8px',
            }}
          >
            Live Chat
          </Button>
        </Space>
      </Flex>
    </Flex>
  );
};

export default TopBar;
