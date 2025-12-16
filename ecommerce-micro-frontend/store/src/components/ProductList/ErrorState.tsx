import React from 'react';
import { Alert, Button } from 'antd';
import styles from './ErrorState.module.less';

type ErrorStateProps = {
  message?: string;
  description?: string;
  onRetry?: () => void;
};

function ErrorState(props: ErrorStateProps) {
  const {
    message = 'Error Loading Products',
    description = 'Failed to load products. Please try again later.',
    onRetry,
  } = props;

  return (
    <div className={styles.container}>
      <Alert
        message={message}
        description={description}
        type="error"
        showIcon
        action={
          onRetry ? (
            <Button size="small" danger onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}

export default ErrorState;

