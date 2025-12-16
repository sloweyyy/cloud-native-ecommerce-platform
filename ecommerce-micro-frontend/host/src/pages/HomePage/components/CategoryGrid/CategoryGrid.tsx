import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Typography, Image, Row, Col, Spin } from 'antd';
import { useCategories } from '../../../../services/categories';

const { Title } = Typography;

function CategoryGrid() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { categories, isLoading } = useCategories();

  const handleCategoryClick = (path: string) => {
    navigate(path);
  };

  const getCategoryName = (category: typeof categories[0]) => {
    return i18n.language === 'vi' ? category.nameVi : category.name;
  };

  if (isLoading) {
    return (
      <div style={{ margin: '48px 0', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

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
          {t('homepage.categoryGrid.title')}
        </Title>
      </div>
      <Row gutter={[16, 16]} justify="center">
        {categories.map((category) => (
          <Col xs={12} sm={8} md={6} lg={4} xl={3} key={category.id}>
            <Card
              hoverable
              onClick={() => handleCategoryClick(category.path)}
              cover={
                <div
                  style={{
                    width: '100%',
                    height: 160,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    overflow: 'hidden',
                  }}
                >
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={getCategoryName(category)}
                      preview={false}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: '3em', lineHeight: 1 }}>
                      {category.icon}
                    </div>
                  )}
                </div>
              }
              styles={{
                body: {
                  textAlign: 'center',
                  padding: '12px 0',
                },
              }}
              style={{
                borderRadius: 12,
                border: '1px solid #f1f5f9',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Card.Meta
                title={
                  <div
                    style={{
                      fontSize: '0.95em',
                      fontWeight: 600,
                      color: '#1e293b',
                      margin: 0,
                    }}
                  >
                    {getCategoryName(category)}
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default CategoryGrid;

