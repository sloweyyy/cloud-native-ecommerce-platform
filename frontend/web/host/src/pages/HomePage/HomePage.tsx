import React from 'react';
import HeroSection from './components/HeroSection';
import CategoriesSection from './components/CategoriesSection';
import FeaturedProductsSection from './components/FeaturedProductsSection';
import FeaturesSection from './components/FeaturesSection';

function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <FeaturesSection />
    </>
  );
}

export default HomePage;
