import React from 'react';
import { Typography, Progress, Rate, Flex } from 'antd';
import { formatNumber } from '../../helpers/formatUtils';

const { Title, Text } = Typography;

type ReviewsSummaryProps = {
  ratingAverage?: number;
  ratingCount?: number;
  ratingDistribution?: Record<string, number>;
};

function ReviewsSummary(props: ReviewsSummaryProps) {
  const { ratingAverage, ratingCount, ratingDistribution } = props;

  const hasNoReviews = !ratingAverage || !ratingCount || ratingCount === 0;

  if (hasNoReviews) {
    return (
      <div>
        <Title level={4}>Customer Reviews</Title>
        <Text type="secondary">No reviews yet</Text>
      </div>
    );
  }

  const distribution = ratingDistribution ?? {};

  function getPercentage(starCount: number): number {
    const count = distribution[starCount.toString()] ?? 0;
    const total = ratingCount ?? 0;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return Math.round(percentage);
  }

  const formattedRating = ratingAverage.toFixed(1);
  const formattedReviewCount = formatNumber(ratingCount ?? 0);

  return (
    <div>
      <Title level={4}>Customer Reviews</Title>
      <Flex gap={24}>
        <Flex
          vertical
          align="center"
          style={{ minWidth: 120 }}
          className="review-summary"
        >
          <Text style={{ fontSize: 48, fontWeight: 'bold', lineHeight: 1 }}>
            {formattedRating}
          </Text>
          <Rate
            disabled
            value={ratingAverage}
            allowHalf
            style={{ fontSize: 16 }}
          />
          <Text type="secondary" style={{ marginTop: 8 }}>
            {formattedReviewCount} {ratingCount === 1 ? 'review' : 'reviews'}
          </Text>
        </Flex>

        <Flex vertical flex={1} style={{ minWidth: 0 }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const percentage = getPercentage(star);
            return (
              <Flex
                key={star}
                align="center"
                gap={8}
                style={{ marginBottom: 8 }}
              >
                <Text style={{ width: 40 }}>{star} star</Text>
                <Flex flex={1} style={{ minWidth: 100 }}>
                  <Progress
                    percent={percentage}
                    showInfo={false}
                    strokeColor="#faab00"
                    style={{ width: '100%' }}
                  />
                </Flex>
                <Text
                  type="secondary"
                  style={{ width: 50, textAlign: 'right' }}
                >
                  {percentage}%
                </Text>
              </Flex>
            );
          })}
        </Flex>
      </Flex>
    </div>
  );
}

export default ReviewsSummary;
