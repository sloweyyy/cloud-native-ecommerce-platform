import React from 'react';
import { Spin } from 'antd';
import styles from './LoadingState.module.less';

type LoadingStateProps = {
  message?: string;
};

function LoadingState(props: LoadingStateProps) {
  const { message = 'Loading products...' } = props;

  return (
    <div className={styles.container} role="status" aria-live="polite">
      <Spin size="large" tip={message} />
    </div>
  );
}

export default LoadingState;
