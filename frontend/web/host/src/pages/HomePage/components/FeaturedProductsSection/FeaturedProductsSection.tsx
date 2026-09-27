import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Row, Flex, Space } from 'antd';
import { useProducts } from '../../../../services/products';
import { themeConfig } from '../../../../config/theme';
import SectionHeader from './SectionHeader';
import ProductGrid from './ProductGrid';
import LoadingState from './LoadingState';

function FeaturedProductsSection() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const { products, isLoading } = useProducts({
    PageIndex: 1,
    PageSize: 8,
  });

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleProductClick(productId: string) {
    navigate(`/store/product/${productId}`);
  }

  function handleViewAll() {
    navigate('/store');
  }

  const displayProducts = useMemo(() => {
    return products.slice(0, 8);
  }, [products]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Space
      direction="vertical"
      size="large"
      style={{
        width: '100%',
        padding: 64,
        backgroundColor: themeConfig.token?.colorBgElevated || '#f8fafc',
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
        <SectionHeader
          title="Trending Now"
          subtitle="Handpicked items for this season"
          showViewAll={!isMobile}
          onViewAll={handleViewAll}
        />
        <Row gutter={[32, 32]} justify="center">
          <ProductGrid
            products={displayProducts}
            onProductClick={handleProductClick}
          />
        </Row>
        {isMobile && (
          <Flex justify="center">
            <Button type="link" onClick={handleViewAll}>
              View All Products →
            </Button>
          </Flex>
        )}
      </Flex>
    </Space>
  );
}

export default FeaturedProductsSection;
