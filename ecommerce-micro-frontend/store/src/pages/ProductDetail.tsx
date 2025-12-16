import React, { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Row, Col, Space, Divider, Button, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import { useGetProductById } from '../services/products/hooks';
import { isProductInStock } from '../helpers/productUtils';
import { useProductActions } from '../hooks/useProductActions';
import {
  ProductImageGallery,
  ProductTitle,
  ProductRating,
  ProductStockBadge,
  ProductPrice,
  ProductDescription,
  ProductFeatures,
  ProductSpecifications,
  ProductActions,
  ShippingInfo,
  ReviewsSummary,
  ReviewsList,
  RelatedProducts,
  StickyBuyBar,
} from '../components/ProductDetail';
import ProductDetailSkeleton from '../components/ProductDetail/ProductDetailSkeleton';

type ProductDetailProps = {
  productId: string;
  config?: AppInjectorProps['config'];
};

function ProductDetail(props: ProductDetailProps) {
  const { productId, config } = props;
  const navigate = useNavigate();

  const {
    data: productData,
    isLoading,
    isError,
    error,
  } = useGetProductById(productId, {
    enabled: Boolean(productId),
  });

  const product = productData ?? null;

  const isInStock = useMemo(() => {
    if (!product) {
      return false;
    }
    return isProductInStock(product);
  }, [product]);

  const {
    quantity,
    setQuantity,
    handleAddToCart,
    handleBuyNow,
    handleAddToWishlist,
    canAddToCart,
    maxQuantity,
    isAddingToCart,
  } = useProductActions({
    product,
    config,
  });

  function handleBack() {
    navigate({ to: '/', search: {} });
  }

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Empty
          description={
            error?.message || "The product you're looking for doesn't exist."
          }
        />
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginTop: 24 }}
        >
          Back to Store
        </Button>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.imageFile];

  return (
    <div style={{ padding: '24px' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{ marginBottom: 24 }}
      >
        Back to Store
      </Button>

      <Row gutter={[24, 24]}>
        {/* Left Column - Product Images */}
        <Col xs={24} md={12}>
          <ProductImageGallery images={images} productName={product.name} />
        </Col>

        {/* Right Column - Product Info */}
        <Col xs={24} md={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <ProductTitle name={product.name} />
              <Space size="middle" wrap>
                <ProductRating
                  ratingAverage={product.ratingAverage}
                  ratingCount={product.ratingCount}
                />
                <ProductStockBadge
                  stockStatus={product.stockStatus ?? 'out-of-stock'}
                />
              </Space>
            </div>
            <ProductPrice
              price={product.price}
              originalPrice={product.originalPrice}
            />
            <Divider />
            <ProductDescription description={product.description} />
            {product.features && product.features.length > 0 && (
              <ProductFeatures features={product.features} />
            )}
            <ShippingInfo
              shippingFreeShipping={product.shippingFreeShipping}
              shippingEstimatedDeliveryDays={
                product.shippingEstimatedDeliveryDays
              }
              shippingCost={product.shippingCost}
            />
            <Divider />
            <ProductActions
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onAddToWishlist={handleAddToWishlist}
              canAddToCart={canAddToCart}
              maxQuantity={maxQuantity}
              isInStock={isInStock}
              isLoading={isAddingToCart}
            />
          </Space>
        </Col>
      </Row>

      {/* Full Width Sections */}
      <div style={{ marginTop: 48 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            {product.specifications &&
              Object.keys(product.specifications).length > 0 && (
                <ProductSpecifications
                  specifications={product.specifications}
                />
              )}
          </Col>
          <Col xs={24} lg={12}>
            {product.ratingAverage && product.ratingCount && (
              <ReviewsSummary
                ratingAverage={product.ratingAverage}
                ratingCount={product.ratingCount}
                ratingDistribution={product.ratingDistribution}
              />
            )}
          </Col>
        </Row>
      </div>

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <ReviewsList reviews={product.reviews} />
        </div>
      )}

      {/* Related Products */}
      {product.relatedProductIds && product.relatedProductIds.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <RelatedProducts relatedProductIds={product.relatedProductIds} />
        </div>
      )}

      {/* Mobile Sticky Buy Bar */}
      <StickyBuyBar
        price={product.price}
        onAddToCart={handleAddToCart}
        canAddToCart={canAddToCart}
        isInStock={isInStock}
      />
    </div>
  );
}

export default ProductDetail;
