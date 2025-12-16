import React from 'react';
import { Col, Row } from 'antd';
import { Product } from '../../services/products';
import { ProductCard } from '../ProductCard';

type ProductGridProps = {
  products: Product[];
  onAddToCart: (productId: string, productName: string) => void;
  onViewDetails: (productId: string) => void;
};

function ProductGrid(props: ProductGridProps) {
  const { products, onAddToCart, onViewDetails } = props;

  return (
    <Row gutter={[16, 16]}>
      {products.map((product) => (
        <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
          <ProductCard
            product={product}
            onAddToCart={onAddToCart}
            onViewDetails={onViewDetails}
          />
        </Col>
      ))}
    </Row>
  );
}

export default ProductGrid;
