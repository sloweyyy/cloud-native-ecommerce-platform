/* eslint-disable @typescript-eslint/triple-slash-reference, @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type, no-var */
/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PUBLIC_URL: string;
    NX_API_BASE_URL?: string;
    NX_API_TIMEOUT?: string;
    NX_USE_MOCK_DATA?: string;
    NX_ENABLE_AUTHENTICATION?: string;
    NX_ENABLE_DISCOUNT_SERVICE?: string;
    NX_ENABLE_ORDER_TRACKING?: string;
    NX_LOG_LEVEL?: string;
    NX_ENABLE_API_LOGGING?: string;
  }
}

declare var process: {
  env: NodeJS.ProcessEnv;
};

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  import React, { FC } from 'react';

  export const ReactComponent: FC<React.SVGProps<SVGSVGElement>>;

  const src: string;
  export default src;
}

declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.less' {
  const classes: { [key: string]: string };
  export default classes;
}

