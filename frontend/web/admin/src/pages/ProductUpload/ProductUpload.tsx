import React, { useState, useMemo } from 'react';
import {
  Upload,
  Button,
  Card,
  Typography,
  Space,
  Image,
  Alert,
  Row,
  Col,
  Tag,
  Flex,
  Divider,
  theme,
} from 'antd';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import {
  UploadOutlined,
  CheckCircleOutlined,
  FileImageOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import { useUploadProductImage } from '../../services';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

type ProductUploadProps = {
  config?: AppInjectorProps['config'];
};

function ProductUpload(props: ProductUploadProps) {
  const { config } = props;
  const { onError } = config || {};

  const [fileList, setFileList] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const { token } = theme.useToken();
  const { mutate: uploadImage, isPending, isSuccess } = useUploadProductImage();

  const fileListForUpload = useMemo(
    () =>
      fileList.map((file) => ({
        uid: file.name,
        name: file.name,
        status: 'done' as const,
      })),
    [fileList]
  );
  function handleFileSelect(file: File) {
    setFileList([file]);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    return false;
  }

  function handleRemove() {
    setFileList([]);
    setPreviewUrl(null);
    setUploadedUrl(null);
  }

  function handleUpload() {
    if (fileList.length === 0) {
      return;
    }

    uploadImage(fileList[0], {
      onSuccess: (data) => {
        if (data?.success && data.imageUrl) {
          setUploadedUrl(data.imageUrl);
        }
      },
      onError: (error) => {
        if (onError) {
          onError(error as Error);
        }
      },
    });
  }

  function handleCustomRequest(options: UploadRequestOption) {
    const { file, onSuccess, onError: onUploadError } = options;
    const fileObj = file as File;

    uploadImage(fileObj, {
      onSuccess: (data) => {
        if (data?.success) {
          onSuccess?.('ok');
          if (data.imageUrl) {
            setUploadedUrl(data.imageUrl);
          }
        } else {
          const error = new Error(data?.message || 'Upload failed');
          onUploadError?.(error);
          if (onError) {
            onError(error);
          }
        }
      },
      onError: (error) => {
        onUploadError?.(error as Error);
        if (onError) {
          onError(error as Error);
        }
      },
    });
  }

  if (isSuccess && uploadedUrl) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          message="Upload Successful"
          description="Your image has been uploaded to S3 storage successfully and is ready to use."
          type="success"
          icon={<CheckCircleOutlined />}
          showIcon
          closable
        />

        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Flex justify="space-between" align="center">
              <Title level={4} style={{ margin: 0 }}>
                Uploaded Image
              </Title>
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Ready
              </Tag>
            </Flex>

            <Card
              hoverable
              cover={
                <Image
                  src={uploadedUrl}
                  alt="Uploaded product image"
                  style={{
                    width: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                  }}
                  preview
                />
              }
            />

            <Divider />

            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong>Image URL</Text>
              <Text
                copyable={{ text: uploadedUrl }}
                code
                style={{ display: 'block', wordBreak: 'break-all' }}
              >
                {uploadedUrl}
              </Text>
            </Space>

            <Button
              type="primary"
              size="large"
              block
              icon={<ReloadOutlined />}
              onClick={handleRemove}
            >
              Upload Another Image
            </Button>
          </Space>
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Title level={2} style={{ margin: 0 }}>
            Upload Product Image
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            Upload product images to S3 storage. Supported formats: JPG, PNG,
            JPEG, WebP, GIF. Maximum file size: 10MB.
          </Paragraph>
        </Space>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FileImageOutlined />
                <Text strong>Upload Area</Text>
              </Space>
            }
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Dragger
                customRequest={handleCustomRequest}
                fileList={fileListForUpload}
                beforeUpload={(file) => {
                  handleFileSelect(file);
                  return false;
                }}
                onRemove={handleRemove}
                maxCount={1}
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                disabled={isPending}
              >
                <Space
                  direction="vertical"
                  align="center"
                  size="large"
                  style={{ padding: '48px 0' }}
                >
                  <UploadOutlined
                    style={{ fontSize: 64, color: token.colorPrimary }}
                  />
                  <Space direction="vertical" size="small" align="center">
                    <Text strong style={{ fontSize: 16 }}>
                      Click or drag file to this area to upload
                    </Text>
                    <Text type="secondary">
                      Support for single image upload
                    </Text>
                  </Space>
                </Space>
              </Dragger>

              {fileList.length > 0 && (
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={isPending}
                  onClick={handleUpload}
                  icon={<UploadOutlined />}
                >
                  Upload to S3
                </Button>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FileImageOutlined />
                <Text strong>Preview</Text>
              </Space>
            }
          >
            {previewUrl && (
              <Space
                direction="vertical"
                size="middle"
                style={{ width: '100%' }}
              >
                <Card
                  hoverable
                  cover={
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: '100%',
                        maxHeight: 300,
                        objectFit: 'contain',
                      }}
                      preview
                    />
                  }
                />

                <Divider style={{ margin: '16px 0' }} />

                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: '100%' }}
                >
                  <Flex justify="space-between" align="center">
                    <Text type="secondary">File name:</Text>
                    <Text strong>{fileList[0]?.name}</Text>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text type="secondary">File size:</Text>
                    <Text strong>
                      {(fileList[0]?.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text type="secondary">File type:</Text>
                    <Tag>{fileList[0]?.type || 'Unknown'}</Tag>
                  </Flex>
                </Space>
              </Space>
            )}

            {!previewUrl && (
              <Space
                direction="vertical"
                align="center"
                size="middle"
                style={{ width: '100%', padding: '64px 0', minHeight: 300 }}
              >
                <FileImageOutlined
                  style={{ fontSize: 64, color: token.colorTextQuaternary }}
                />
                <Space direction="vertical" size="small" align="center">
                  <Text type="secondary" strong>
                    No image selected
                  </Text>
                  <Text type="secondary">Select an image to see preview</Text>
                </Space>
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

export default React.memo(ProductUpload);
