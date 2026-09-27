import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Typography, Image, Flex } from 'antd';
import { brands } from '../../data/brands';

const { Title } = Typography;

function FeaturedBrands() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBrandClick = (link: string) => {
    navigate(link);
  };

  return (
    <div style={{ margin: '48px 0' }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Title
          level={2}
          style={{
            fontSize: '2em',
            fontWeight: 700,
            color: '#1e293b',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {t('homepage.featuredBrands.title')}
        </Title>
      </div>
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '16px 0',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Flex
          gap={16}
          style={{
            minWidth: 'min-content',
            padding: '0 8px',
          }}
        >
          {brands.map((brand) => (
            <Card
              key={brand.id}
              hoverable
              onClick={() => handleBrandClick(brand.link)}
              style={{
                flex: '0 0 160px',
                borderRadius: 12,
                border: '1px solid #f1f5f9',
                background: 'white',
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              styles={{
                body: {
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                  background: 'white',
                },
              }}
            >
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                preview={false}
                loading="lazy"
                fallback={brand.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: 80,
                  objectFit: 'contain',
                  filter: 'grayscale(20%)',
                  transition: 'filter 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'grayscale(0%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'grayscale(20%)';
                }}
              />
            </Card>
          ))}
        </Flex>
      </div>
    </div>
  );
}

export default FeaturedBrands;

