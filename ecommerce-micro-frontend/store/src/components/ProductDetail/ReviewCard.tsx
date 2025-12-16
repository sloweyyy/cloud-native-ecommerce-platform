import React from 'react';
import { Card, Space, Rate, Typography, Button } from 'antd';
import { LikeOutlined, UserOutlined } from '@ant-design/icons';
import { Review } from '../../services/products/types';
import { formatDate } from '../../helpers/formatUtils';

const { Text, Paragraph } = Typography;

type ReviewCardProps = {
  review: Review;
};

function ReviewCard(props: ReviewCardProps) {
  const { review } = props;

  function handleHelpful() {
    // TODO: Implement helpful functionality
  }

  return (
    <Card
      style={{
        marginBottom: 16,
        borderRadius: 8,
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Space>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#e8e8e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserOutlined style={{ fontSize: 20, color: '#8c8c8c' }} />
          </div>
          <Space direction="vertical" size={0}>
            <Text strong>{review.userName}</Text>
            <Space size="small">
              <Rate disabled value={review.rating} style={{ fontSize: 12 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatDate(review.date, 'relative')}
              </Text>
            </Space>
          </Space>
        </Space>

        <Paragraph style={{ margin: 0 }}>{review.comment}</Paragraph>

        {review.helpfulCount !== undefined && review.helpfulCount > 0 && (
          <Button
            type="text"
            size="small"
            icon={<LikeOutlined />}
            onClick={handleHelpful}
            style={{ padding: 0 }}
          >
            Helpful ({review.helpfulCount})
          </Button>
        )}
      </Space>
    </Card>
  );
}

export default ReviewCard;




