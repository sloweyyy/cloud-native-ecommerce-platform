import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Space, Flex } from 'antd';
import { promotionalBanners } from '../../data/promotionalBanners';

const { Title, Paragraph } = Typography;

function HeroSection() {
  const navigate = useNavigate();
  const heroBanner = promotionalBanners[0];

  function handleShopClick() {
    navigate(heroBanner.link || '/store');
  }

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '85vh',
        paddingTop: 152,
        paddingBottom: 128,
        marginTop: 0,
        backgroundImage: `url(${heroBanner.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Flex
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1,
        }}
      />
      <Space
        direction="vertical"
        size="large"
        align="center"
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: 800,
          padding: '0 16px',
        }}
      >
        <Title
          level={1}
          style={{
            color: '#ffffff',
            fontSize: '3rem',
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Redefine Your <br /> Everyday Style.
        </Title>
        <Paragraph
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.125rem',
            margin: 0,
            maxWidth: 600,
          }}
        >
          Discover the latest trends in fashion and accessories. Curated
          collections for the modern aesthetic.
        </Paragraph>
        <Button
          type="primary"
          size="large"
          onClick={handleShopClick}
          style={{
            backgroundColor: '#ffffff',
            color: '#1e293b',
            borderColor: '#ffffff',
            height: 'auto',
            padding: '16px 32px',
            fontSize: '1rem',
            fontWeight: 700,
          }}
        >
          Shop Collection
        </Button>
      </Space>
    </Flex>
  );
}

export default HeroSection;
