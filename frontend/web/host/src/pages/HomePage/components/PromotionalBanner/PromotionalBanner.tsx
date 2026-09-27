import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel, Typography, Image } from 'antd';
import { promotionalBanners } from '../../data/promotionalBanners';

const { Title, Text } = Typography;

function PromotionalBanner() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        margin: '0 0 32px 0',
        overflow: 'hidden',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.1)',
        height: 400,
        backgroundColor: '#14192e',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(15, 23, 42, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.1)';
      }}
    >
      <Carousel autoplay>
        {promotionalBanners.map((banner) => (
          <div key={banner.id}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 400,
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => banner.link && navigate(banner.link)}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  zIndex: 1,
                }}
              />
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                preview={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '10%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  zIndex: 2,
                }}
              >
                <Title
                  level={1}
                  style={{
                    color: 'white',
                    margin: 0,
                    fontSize: '3em',
                    fontWeight: 800,
                    marginBottom: 8,
                    textShadow: '2px 2px 6px rgba(0, 0, 0, 0.6)',
                    textTransform: 'uppercase',
                  }}
                >
                  {banner.title}
                </Title>
                <Text
                  style={{
                    color: 'white',
                    fontSize: '1.5em',
                    fontWeight: 500,
                    textShadow: '1px 1px 4px rgba(0, 0, 0, 0.7)',
                  }}
                >
                  {banner.subtitle}
                </Text>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default PromotionalBanner;
