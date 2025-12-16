import React from 'react';
import { Rate, Typography, Space } from 'antd';

const { Text } = Typography;

type ProductRatingProps = {
  rating?: number;
  reviewCount?: number;
};

function ProductRating(props: ProductRatingProps) {
  const { rating = 0, reviewCount = 0 } = props;

  if (rating === 0 && reviewCount === 0) {
    return (
      <Space size={4} style={{ height: 20 }}>
        <Rate disabled value={0} style={{ fontSize: 14, color: '#d9d9d9' }} />
        <Text type="secondary" style={{ fontSize: 12 }}>
          No reviews
        </Text>
      </Space>
    );
  }

  return (
    <Space size={4} style={{ height: 20 }}>
      <Rate disabled value={rating} style={{ fontSize: 14 }} />
      {reviewCount > 0 && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          ({reviewCount})
        </Text>
      )}
    </Space>
  );
}

export default ProductRating;

