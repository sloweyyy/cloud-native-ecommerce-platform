import React from 'react';
import { Card, Typography, Image, Rate, Tag, Space, Flex } from 'antd';
import { themeConfig } from '../../../../config/theme';
import { formatCurrency } from '../../../../helpers/formatUtils';
import type { Product } from '../../../../services/products';

const { Title, Text } = Typography;

type ProductCardProps = {
  product: Product;
  onClick: (productId: string) => void;
};

function ProductCard(props: ProductCardProps) {
  const { product, onClick } = props;

  function handleClick() {
    onClick(product.id);
  }

  return (
    <Card
      hoverable
      onClick={handleClick}
      style={{
        borderRadius: 12,
        border: `1px solid ${
          themeConfig.token?.colorBorderSecondary || '#f1f5f9'
        }`,
        backgroundColor: themeConfig.token?.colorBgContainer || '#ffffff',
        overflow: 'hidden',
      }}
      styles={{
        body: {
          padding: 20,
        },
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Flex
          style={{
            position: 'relative',
            width: '100%',
            height: 256,
            overflow: 'hidden',
            backgroundColor: themeConfig.token?.colorBgElevated || '#f8fafc',
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <Image
            src={product.imageUrl || product.imageFile}
            alt={product.name}
            preview={false}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Flex>
        <Tag
          style={{
            fontSize: '0.75rem',
            color: themeConfig.token?.colorTextTertiary || '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            border: 'none',
            backgroundColor: 'transparent',
            padding: 0,
          }}
        >
          {product.productType}
        </Tag>
        <Title
          level={5}
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: themeConfig.token?.colorText || '#1e293b',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.name}
        </Title>
        <Flex justify="space-between" align="center">
          <Text
            strong
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: themeConfig.token?.colorPrimary || '#667eea',
            }}
          >
            {formatCurrency(product.price)}
          </Text>
          {product.ratingAverage && (
            <Rate
              disabled
              defaultValue={product.ratingAverage}
              style={{ fontSize: '0.75rem' }}
            />
          )}
        </Flex>
      </Space>
    </Card>
  );
}

export default ProductCard;
