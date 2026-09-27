import React from 'react';
import { Space, Rate, Typography } from 'antd';

const { Text } = Typography;

type ProductRatingProps = {
  ratingAverage?: number;
  ratingCount?: number;
};

function ProductRating(props: ProductRatingProps) {
  const { ratingAverage, ratingCount } = props;

  const hasRating = ratingAverage !== undefined && ratingCount !== undefined;

  if (!hasRating) {
    return null;
  }

  const ratingValue = ratingAverage ?? 0;
  const reviewCount = ratingCount ?? 0;
  const reviewLabel = reviewCount === 1 ? 'review' : 'reviews';

  return (
    <Space size="small">
      <Rate disabled value={ratingValue} allowHalf />
      <Text strong>{ratingValue.toFixed(1)}</Text>
      <Text type="secondary">
        ({reviewCount} {reviewLabel})
      </Text>
    </Space>
  );
}

export default ProductRating;

