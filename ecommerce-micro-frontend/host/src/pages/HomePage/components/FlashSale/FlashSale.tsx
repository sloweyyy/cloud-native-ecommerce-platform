import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Badge, Button, Row, Col, Flex, Space, Typography, Statistic } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import { flashSaleProducts } from '../../data/flashSaleProducts';
import { useFlashSaleTimer } from '../../hooks/useFlashSaleTimer';

const { Title, Text } = Typography;
const { Countdown } = Statistic;

function FlashSale() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Flash sale ends in 2 hours from now
  const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const timer = useFlashSaleTimer(endTime);

  const handleProductClick = (link: string) => {
    navigate(link);
  };

  const handleViewAll = () => {
    navigate('/store');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getProductName = (product: typeof flashSaleProducts[0]) => {
    return i18n.language === 'vi' ? product.nameVi : product.name;
  };

  return (
    <div
      style={{
        margin: '48px 0',
        padding: 24,
        background: '#fff5f5',
        borderRadius: 16,
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        style={{ marginBottom: 24 }}
        wrap
        gap={16}
      >
        <Flex align="center" gap={12}>
          <FireOutlined
            style={{
              fontSize: '2em',
              color: '#ff4d4f',
              animation: 'pulse 2s infinite',
            }}
          />
          <Title
            level={2}
            style={{
              fontSize: '2em',
              fontWeight: 700,
              color: '#1e293b',
              margin: 0,
            }}
          >
            {t('homepage.flashSale.title')}
          </Title>
        </Flex>
        <Flex
          align="center"
          gap={12}
          style={{
            background: 'white',
            padding: '12px 20px',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Text style={{ fontSize: '0.9em', color: '#64748b', fontWeight: 500 }}>
            {t('homepage.flashSale.endsIn')}
          </Text>
          <Space size={4}>
            <Flex
              vertical
              align="center"
              style={{
                background: '#ff4d4f',
                color: 'white',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: '1.2em',
                fontWeight: 700,
                minWidth: 50,
                textAlign: 'center',
              }}
            >
              {String(timer.hours).padStart(2, '0')}
              <Text
                style={{
                  fontSize: '0.6em',
                  fontWeight: 400,
                  opacity: 0.9,
                  marginTop: 2,
                }}
              >
                {t('homepage.flashSale.hours')}
              </Text>
            </Flex>
            <Text
              style={{
                fontSize: '1.5em',
                fontWeight: 700,
                color: '#ff4d4f',
                margin: '0 4px',
              }}
            >
              :
            </Text>
            <Flex
              vertical
              align="center"
              style={{
                background: '#ff4d4f',
                color: 'white',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: '1.2em',
                fontWeight: 700,
                minWidth: 50,
                textAlign: 'center',
              }}
            >
              {String(timer.minutes).padStart(2, '0')}
              <Text
                style={{
                  fontSize: '0.6em',
                  fontWeight: 400,
                  opacity: 0.9,
                  marginTop: 2,
                }}
              >
                {t('homepage.flashSale.minutes')}
              </Text>
            </Flex>
            <Text
              style={{
                fontSize: '1.5em',
                fontWeight: 700,
                color: '#ff4d4f',
                margin: '0 4px',
              }}
            >
              :
            </Text>
            <Flex
              vertical
              align="center"
              style={{
                background: '#ff4d4f',
                color: 'white',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: '1.2em',
                fontWeight: 700,
                minWidth: 50,
                textAlign: 'center',
              }}
            >
              {String(timer.seconds).padStart(2, '0')}
              <Text
                style={{
                  fontSize: '0.6em',
                  fontWeight: 400,
                  opacity: 0.9,
                  marginTop: 2,
                }}
              >
                {t('homepage.flashSale.seconds')}
              </Text>
            </Flex>
          </Space>
        </Flex>
        <Button
          type="primary"
          onClick={handleViewAll}
          style={{
            background: '#ff4d4f',
            borderColor: '#ff4d4f',
            fontWeight: 600,
          }}
        >
          {t('homepage.flashSale.viewAll')}
        </Button>
      </Flex>
      <Row gutter={[16, 16]}>
        {flashSaleProducts.map((product) => (
          <Col xs={12} sm={12} md={8} lg={6} xl={4} key={product.id}>
            <Card
              hoverable
              onClick={() => handleProductClick(product.link)}
              cover={
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 200,
                    overflow: 'hidden',
                    background: '#f8fafc',
                  }}
                >
                  <img
                    src={product.imageUrl}
                    alt={getProductName(product)}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <Badge
                    count={`-${product.discount}%`}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      backgroundColor: '#ff4d4f',
                    }}
                  />
                </div>
              }
              styles={{
                body: {
                  padding: 12,
                },
              }}
              style={{
                borderRadius: 12,
                border: '1px solid #f1f5f9',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Title
                  level={5}
                  style={{
                    fontSize: '0.95em',
                    fontWeight: 600,
                    color: '#1e293b',
                    margin: '0 0 8px 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getProductName(product)}
                </Title>
                <Space size="small">
                  <Text style={{ color: '#fbbf24', fontSize: '0.9em' }}>
                    {'★'.repeat(Math.floor(product.rating))}
                    {'☆'.repeat(5 - Math.floor(product.rating))}
                  </Text>
                  <Text style={{ fontSize: '0.85em', color: '#64748b' }}>
                    ({product.reviewCount})
                  </Text>
                </Space>
                <Space>
                  <Text
                    strong
                    style={{ fontSize: '1.1em', fontWeight: 700, color: '#ff4d4f' }}
                  >
                    {formatPrice(product.salePrice)}
                  </Text>
                  <Text delete style={{ fontSize: '0.9em', color: '#94a3b8' }}>
                    {formatPrice(product.originalPrice)}
                  </Text>
                </Space>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default FlashSale;




