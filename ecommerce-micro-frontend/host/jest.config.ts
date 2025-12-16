export default {
  displayName: 'host',
  preset: '../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../coverage/host',
  testEnvironment: 'jsdom',
};
