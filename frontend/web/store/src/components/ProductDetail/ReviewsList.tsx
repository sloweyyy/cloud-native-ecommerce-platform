import React, { useState } from 'react';
import { Button, Empty } from 'antd';
import { Review } from '../../services/products/schemas';
import ReviewCard from './ReviewCard';

type ReviewsListProps = {
  reviews: Review[];
  initialDisplayCount?: number;
};

function ReviewsList(props: ReviewsListProps) {
  const { reviews, initialDisplayCount = 5 } = props;
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);

  if (!reviews || reviews.length === 0) {
    return <Empty description="No reviews yet" />;
  }

  const displayedReviews = reviews.slice(0, displayCount);
  const hasMore = reviews.length > displayCount;

  function handleShowMore() {
    setDisplayCount(reviews.length);
  }

  function handleShowLess() {
    setDisplayCount(initialDisplayCount);
  }

  return (
    <div>
      {displayedReviews.map((review) => (
        <ReviewCard key={review.reviewId} review={review} />
      ))}
      {hasMore && displayCount < reviews.length && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={handleShowMore}>
            Show more ({reviews.length - displayCount} more)
          </Button>
        </div>
      )}
      {displayCount >= reviews.length && reviews.length > initialDisplayCount && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={handleShowLess}>Show less</Button>
        </div>
      )}
    </div>
  );
}

export default ReviewsList;




