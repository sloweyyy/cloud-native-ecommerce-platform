import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Button,
  Badge,
  Typography,
  Image,
  Rate,
  Tag,
  Row,
  Col,
  Flex,
  Space,
} from 'antd';
import { featuredProducts } from '../../data/featuredProducts';
import { brandGradient } from '../../../../config/theme';
import { formatCurrency } from '../../../../helpers/formatUtils';

const { Title, Text, Paragraph } = Typography;

function FeaturedProducts() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleProductClick = (link: string) => {
    navigate(link);
  };

  const handleViewAll = () => {
    navigate('/store');
  };


  const getProductName = (product: (typeof featuredProducts)[0]) => {
    return i18n.language === 'vi' ? product.nameVi : product.name;
  };

  return (
    <div
      style={{
        margin: '64px 0',
        padding: '48px 32px',
        background: '#f8fafc',
        borderRadius: 16,
      }}
    >
      <Flex justify="center" style={{ marginBottom: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <Text
            style={{
            fontSize: '0.95em',
            fontWeight: 600,
            color: brandGradient.start,
            marginBottom: 8,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              display: 'block',
            }}
          >
            {t('homepage.featuredProducts.title')}
          </Text>
          <Title
            level={2}
            style={{
              fontSize: '2.2em',
              fontWeight: 700,
              color: '#1e293b',
              margin: '0 0 16px 0',
              position: 'relative',
              display: 'inline-block',
              paddingBottom: 16,
            }}
          >
            {t('homepage.featuredProducts.subtitle')}
            <div
              style={{
                position: 'absolute',
                width: 80,
                height: 4,
                background: brandGradient.start,
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: 2,
              }}
            />
          </Title>
          <Paragraph
            style={{
              fontSize: '1.1em',
              fontWeight: 400,
              color: '#64748b',
              maxWidth: 700,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            {t('homepage.featuredProducts.description')}
          </Paragraph>
          <Button
            type="primary"
            onClick={handleViewAll}
            style={{
              background: '#3048a5',
              borderColor: '#3048a5',
              fontWeight: 600,
              height: 'auto',
              padding: '12px 24px',
              marginTop: 24,
            }}
          >
            {t('homepage.featuredProducts.viewAll')}
          </Button>
        </div>
      </Flex>
      <Row gutter={[24, 24]}>
        {featuredProducts.map((product) => (
          <Col xs={12} sm={12} md={8} lg={6} xl={6} key={product.id}>
            <Card
              hoverable
              onClick={() => handleProductClick(product.link)}
              cover={
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 240,
                    overflow: 'hidden',
                    background: '#f8fafc',
                  }}
                >
                  <Image
                    src={product.imageUrl}
                    alt={getProductName(product)}
                    preview={false}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {product.discount && (
                    <Badge
                      count={`-${product.discount}%`}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        backgroundColor: '#52c41a',
                      }}
                    />
                  )}
                </div>
              }
              styles={{
                body: {
                  padding: 16,
                },
              }}
              style={{
                borderRadius: 12,
                border: '1px solid #f1f5f9',
                background: 'white',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                <Tag
                  style={{
                    fontSize: '0.75em',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {product.category}
                </Tag>
                <Title
                  level={4}
                  style={{
                    fontSize: '1em',
                    fontWeight: 600,
                    color: '#1e293b',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '2.4em',
                  }}
                >
                  {getProductName(product)}
                </Title>
                <Space size="small">
                  <Rate
                    disabled
                    defaultValue={product.rating}
                    style={{ fontSize: '0.9em' }}
                  />
                  <Text style={{ fontSize: '0.85em', color: '#64748b' }}>
                    ({product.reviewCount})
                  </Text>
                </Space>
                <Space>
                  <Text
                    strong
                    style={{
                      fontSize: '1.2em',
                      fontWeight: 700,
                      color: '#3048a5',
                    }}
                  >
                    {formatCurrency(product.price)}
                  </Text>
                  {product.originalPrice && (
                    <Text
                      delete
                      style={{ fontSize: '0.9em', color: '#94a3b8' }}
                    >
                      {formatCurrency(product.originalPrice)}
                    </Text>
                  )}
                </Space>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default FeaturedProducts;
