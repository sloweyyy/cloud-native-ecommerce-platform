import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Image, Row, Col, Spin, Space, Flex } from 'antd';
import { useCategories } from '../../../../services/categories';
import { themeConfig } from '../../../../config/theme';

const { Title, Text } = Typography;

function CategoriesSection() {
  const navigate = useNavigate();
  const { categories, isLoading } = useCategories();

  function handleCategoryClick(path: string) {
    navigate(path);
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ padding: '80px 0' }}>
        <Spin size="large" />
      </Flex>
    );
  }

  const displayCategories = categories;

  return (
    <Space
      direction="vertical"
      size="large"
      style={{
        width: '100%',
        padding: 64,
        backgroundColor: themeConfig.token?.colorBgContainer || '#ffffff',
      }}
    >
      <Flex
        vertical
        style={{
          width: '100%',
          margin: '0 auto',
          padding: '0 16px',
        }}
        gap={32}
      >
        <Flex
          vertical
          justify="center"
          align="center"
          style={{ width: '100%' }}
        >
          <Title
            level={2}
            style={{
              fontSize: '1.875rem',
              fontWeight: 700,
              color: themeConfig.token?.colorText || '#1e293b',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Shop by Category
          </Title>
          <Flex
            style={{
              width: 64,
              height: 4,
              backgroundColor: themeConfig.token?.colorPrimary || '#667eea',
              borderRadius: 2,
            }}
          />
        </Flex>
        <Row gutter={[32, 32]} justify="center" style={{ width: '100%' }}>
          {displayCategories.map((category) => (
            <Col xs={24} sm={12} md={6} key={category.id}>
              <Card
                hoverable
                onClick={() => handleCategoryClick(category.path)}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 16,
                  height: 320,
                  padding: 0,
                  border: 'none',
                  boxShadow:
                    themeConfig.token?.boxShadow ||
                    '0 2px 8px rgba(15, 23, 42, 0.06)',
                }}
                styles={{
                  body: {
                    padding: 0,
                    height: '100%',
                  },
                }}
              >
                <Flex
                  vertical
                  justify="flex-end"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    backgroundImage: category.imageUrl
                      ? `url(${category.imageUrl})`
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: category.imageUrl
                      ? 'transparent'
                      : themeConfig.token?.colorBgElevated || '#f8fafc',
                  }}
                >
                  <Flex
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background:
                        'linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)',
                      zIndex: 1,
                    }}
                  />
                  {!category.imageUrl && (
                    <Flex
                      justify="center"
                      align="center"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        fontSize: '4rem',
                        zIndex: 0,
                      }}
                    >
                      {category.icon}
                    </Flex>
                  )}
                  {category.imageUrl && (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      preview={false}
                      loading="lazy"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0,
                      }}
                    />
                  )}
                  <Space
                    direction="vertical"
                    size="small"
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      padding: 32,
                      width: '100%',
                    }}
                  >
                    <Title
                      level={3}
                      style={{
                        color: '#ffffff',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      {category.name}
                    </Title>
                    <Text
                      style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Explore →
                    </Text>
                  </Space>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      </Flex>
    </Space>
  );
}

export default CategoriesSection;
