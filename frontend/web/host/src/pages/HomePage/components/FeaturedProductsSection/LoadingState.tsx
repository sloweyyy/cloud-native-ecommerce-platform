import React from 'react';
import { Flex, Spin } from 'antd';
import { themeConfig } from '../../../../config/theme';

function LoadingState() {
  return (
    <Flex
      justify="center"
      align="center"
      style={{
        width: '100%',
        padding: '80px 0',
        backgroundColor: themeConfig.token?.colorBgElevated || '#f8fafc',
      }}
    >
      <Spin size="large" />
    </Flex>
  );
}

export default LoadingState;

