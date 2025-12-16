import React from 'react';
import { Space } from 'antd';
import PromotionalBanner from './components/PromotionalBanner';
import CategoryGrid from './components/CategoryGrid';
import FeaturedProducts from './components/FeaturedProducts';
import FeaturedBrands from './components/FeaturedBrands';
import TrustBadges from './components/TrustBadges';

function HomePage() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 32px',
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <PromotionalBanner />
        <CategoryGrid />
        <FeaturedProducts />
        <FeaturedBrands />
        <TrustBadges />
      </Space>
    </div>
  );
}

export default HomePage;
