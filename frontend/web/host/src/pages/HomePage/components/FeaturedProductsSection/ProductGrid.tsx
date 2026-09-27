import React from 'react';
import { Col, Flex, Typography } from 'antd';
import { themeConfig } from '../../../../config/theme';
import ProductCard from './ProductCard';
import type { Product } from '../../../../services/products';

const { Text } = Typography;

type ProductGridProps = {
  products: Product[];
  onProductClick: (productId: string) => void;
};

function ProductGrid(props: ProductGridProps) {
  const { products, onProductClick } = props;

  if (products.length === 0) {
    return (
      <Col span={24}>
        <Flex
          justify="center"
          align="center"
          style={{ padding: '40px 0' }}
        >
          <Text
            style={{
              color: themeConfig.token?.colorTextTertiary || '#64748b',
              fontSize: '1rem',
            }}
          >
            No products available
          </Text>
        </Flex>
      </Col>
    );
  }

  return (
    <>
      {products.map((product: Product) => (
        <Col xs={24} sm={12} lg={6} key={product.id}>
          <ProductCard product={product} onClick={onProductClick} />
        </Col>
      ))}
    </>
  );
}

export default ProductGrid;

