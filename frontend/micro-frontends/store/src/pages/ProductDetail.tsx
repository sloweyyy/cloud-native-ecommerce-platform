import React from 'react';

import { Row, Col, Space, Divider, Button, Empty, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';

import { useGetProductById } from '../services/products/hooks';
import { useProductActions } from '../hooks/useProductActions';
import { isProductInStock } from '../helpers/productUtils';
import { Product } from '../services/products/schemas';
import {
  ProductImageGallery,
  ProductPrice,
  ProductDescription,
  ProductActions,
  StickyBuyBar,
} from '../components/ProductDetail';
import ProductDetailSkeleton from '../components/ProductDetail/ProductDetailSkeleton';

const { Title } = Typography;

type ProductDetailProps = {
  productId: string;
};

function ProductDetail(props: ProductDetailProps) {
  const { productId } = props;
  const navigate = useNavigate();

  const {
    data: productData,
    isLoading,
    isError,
    error,
  } = useGetProductById(productId, {
    enabled: Boolean(productId),
  });

  const product = (productData ?? null) as Product | null;

  const {
    quantity,
    setQuantity,
    handleAddToCart,
    canAddToCart,
    maxQuantity,
    isAddingToCart,
  } = useProductActions({
    product,
  });

  const isInStock = product ? isProductInStock(product) : false;

  function handleBack() {
    navigate({ to: '/', search: {} });
  }

  async function handleBuyNow() {
    if (!product) {
      return;
    }

    if (!canAddToCart) {
      return;
    }

    try {
      const success = await handleAddToCart();
      if (success) {
        window.location.href = '/checkout';
      }
    } catch (error) {
      console.error('Failed to proceed to checkout:', error);
    }
  }

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <Space
        direction="vertical"
        align="center"
        size="large"
        style={{ width: '100%', padding: '24px' }}
      >
        <Empty
          description={
            error?.message || "The product you're looking for doesn't exist."
          }
        />
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
        >
          Back to Store
        </Button>
      </Space>
    );
  }

  return (
    <Space
      direction="vertical"
      size="large"
      style={{ width: '100%', padding: '24px' }}
    >
      <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
        Back to Store
      </Button>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <ProductImageGallery
            images={[product.imageFile]}
            productName={product.name}
          />
        </Col>

        <Col xs={24} md={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              {product.name}
            </Title>
            <ProductPrice price={product.price} />
            <Divider />
            <ProductDescription description={product.description} />
            <Divider />
            <ProductActions
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              canAddToCart={canAddToCart}
              maxQuantity={maxQuantity}
              isInStock={isInStock}
              isLoading={isAddingToCart}
            />
          </Space>
        </Col>
      </Row>

      <StickyBuyBar
        price={product.price}
        onAddToCart={handleAddToCart}
        canAddToCart={canAddToCart}
        isInStock={isInStock}
      />
    </Space>
  );
}

export default ProductDetail;
