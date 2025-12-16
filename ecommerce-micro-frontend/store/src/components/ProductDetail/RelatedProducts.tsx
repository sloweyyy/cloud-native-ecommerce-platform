import React from 'react';
import { Typography, Row, Col, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../services/products/types';
import { ProductCard } from '../ProductCard';
import { useRelatedProducts } from '../../hooks/useRelatedProducts';

const { Title } = Typography;

type RelatedProductsProps = {
  relatedProductIds: string[] | undefined;
};

function RelatedProducts(props: RelatedProductsProps) {
  const { relatedProductIds } = props;
  const navigate = useNavigate();
  const { relatedProducts, isLoading } = useRelatedProducts(relatedProductIds);

  function handleViewDetails(productId: string) {
    navigate(`/product/${productId}`);
  }

  function handleAddToCart(productId: string, productName: string) {
    // TODO: Implement actual add to cart
    message.success(`${productName} added to cart!`);
  }

  if (!relatedProductIds || relatedProductIds.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div>
        <Title level={4}>You may also like</Title>
        <div>Loading related products...</div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div>
      <Title level={4}>You may also like</Title>
      <Row gutter={[16, 16]}>
        {relatedProducts.map((product) => (
          <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
            <ProductCard
              product={product}
              onViewDetails={handleViewDetails}
              onAddToCart={handleAddToCart}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default RelatedProducts;
