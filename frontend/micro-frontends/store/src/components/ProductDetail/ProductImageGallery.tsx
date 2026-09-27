import React, { useState } from 'react';
import { Card, Image, Space } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import styles from './ProductImageGallery.module.less';

type ProductImageGalleryProps = {
  images: string[];
  productName: string;
};

function ProductImageGallery(props: ProductImageGalleryProps) {
  const { images, productName } = props;
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentImage = images[currentIndex] || images[0] || '';

  function handlePrevious() {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  function handleThumbnailClick(index: number) {
    setCurrentIndex(index);
  }

  if (images.length === 0) {
    return (
      <Card>
        <div className={styles.placeholder}>
          <span>No image available</span>
        </div>
      </Card>
    );
  }

  return (
    <div className={styles.gallery}>
      <Card className={styles.mainImageCard}>
        <div className={styles.mainImageContainer}>
          {images.length > 1 && (
            <button
              className={styles.navButton}
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <LeftOutlined />
            </button>
          )}
          <Image
            src={currentImage}
            alt={productName}
            className={styles.mainImage}
            preview={{
              mask: 'Preview',
            }}
          />
          {images.length > 1 && (
            <button
              className={styles.navButton}
              onClick={handleNext}
              aria-label="Next image"
            >
              <RightOutlined />
            </button>
          )}
        </div>
      </Card>

      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.thumbnail} ${
                index === currentIndex ? styles.active : ''
              }`}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={index === currentIndex}
            >
              <Image
                src={image}
                alt={`${productName} - Image ${index + 1}`}
                preview={false}
                className={styles.thumbnailImage}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductImageGallery;




