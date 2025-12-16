import React from 'react';
import { Card, Skeleton, Row, Col, Space, Divider } from 'antd';
import styles from './ProductDetailSkeleton.module.less';

function ProductDetailSkeleton() {
  return (
    <div className={styles.container}>
      <Skeleton.Button
        active
        style={{ width: 120, height: 32, marginBottom: 24 }}
      />

      <Row gutter={[24, 24]}>
        {/* Left Column - Image Gallery */}
        <Col xs={24} md={12}>
          <Card className={styles.imageCard}>
            <Skeleton.Image
              active
              style={{ width: '100%', height: 500, borderRadius: 8 }}
            />
            <div className={styles.thumbnails}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton.Image
                  key={i}
                  active
                  style={{ width: 80, height: 80, borderRadius: 4 }}
                />
              ))}
            </div>
          </Card>
        </Col>

        {/* Right Column - Product Info */}
        <Col xs={24} md={12}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Title and Rating */}
            <div>
              <Skeleton.Input
                active
                size="large"
                style={{ width: '80%', height: 32, marginBottom: 12 }}
              />
              <Space size="middle">
                <Skeleton.Button active size="small" style={{ width: 120 }} />
                <Skeleton.Button active size="small" style={{ width: 80 }} />
              </Space>
            </div>

            {/* Price */}
            <div>
              <Skeleton.Input
                active
                size="large"
                style={{ width: 150, height: 40 }}
              />
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Description */}
            <div>
              <Skeleton.Input
                active
                size="small"
                style={{ width: 100, height: 20, marginBottom: 12 }}
              />
              <Skeleton
                active
                paragraph={{ rows: 3, width: ['100%', '100%', '80%'] }}
              />
            </div>

            {/* Features */}
            <div>
              <Skeleton.Input
                active
                size="small"
                style={{ width: 120, height: 20, marginBottom: 12 }}
              />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: `${80 + i * 5}%`, height: 16 }}
                  />
                </div>
              ))}
            </div>

            {/* Shipping Info */}
            <div>
              <Skeleton.Button active size="small" style={{ width: 140 }} />
              <Skeleton.Input
                active
                size="small"
                style={{ width: 200, height: 16, marginTop: 8 }}
              />
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Quantity and Actions */}
            <div>
              <Skeleton.Input
                active
                size="small"
                style={{ width: 80, height: 20, marginBottom: 12 }}
              />
              <Space size="middle">
                <Skeleton.Button active size="small" style={{ width: 100 }} />
                <Skeleton.Button active size="small" style={{ width: 100 }} />
              </Space>
              <div style={{ marginTop: 16 }}>
                <Skeleton.Button
                  active
                  size="large"
                  block
                  style={{ height: 48, marginBottom: 12 }}
                />
                <Skeleton.Button
                  active
                  size="large"
                  block
                  style={{ height: 48 }}
                />
              </div>
            </div>
          </Space>
        </Col>
      </Row>

      {/* Full Width Sections */}
      <div className={styles.fullWidthSection}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Skeleton.Input
              active
              size="small"
              style={{ width: 150, height: 20, marginBottom: 16 }}
            />
            <Skeleton active paragraph={{ rows: 6 }} />
          </Col>
          <Col xs={24} lg={12}>
            <Skeleton.Input
              active
              size="small"
              style={{ width: 150, height: 20, marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <Skeleton.Input
                active
                size="large"
                style={{ width: 80, height: 60 }}
              />
              <div style={{ flex: 1 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 60, height: 16 }}
                    />
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ flex: 1, height: 8 }}
                    />
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 40, height: 16 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Reviews Section */}
      <div className={styles.fullWidthSection}>
        <Skeleton.Input
          active
          size="small"
          style={{ width: 150, height: 20, marginBottom: 16 }}
        />
        {[1, 2, 3].map((i) => (
          <Card key={i} style={{ marginBottom: 16, borderRadius: 8 }}>
            <Space style={{ width: '100%' }}>
              <Skeleton.Avatar active size={40} />
              <div style={{ flex: 1 }}>
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 120, height: 16, marginBottom: 8 }}
                />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 80, height: 12, marginBottom: 8 }}
                />
                <Skeleton
                  active
                  paragraph={{ rows: 2, width: ['100%', '80%'] }}
                />
              </div>
            </Space>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProductDetailSkeleton;
