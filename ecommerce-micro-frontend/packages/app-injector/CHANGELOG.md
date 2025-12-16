# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-11

### Added

- Initial release
- `createAppInjector` - Basic app injector for React micro-frontends
- `createEnhancedAppInjector` - Enhanced injector with retry logic and async injection
- React 16/17/18+ automatic detection and compatibility
- Environment detection utilities (`isProductionEnv`, `isStagingEnv`, `isDevelopmentEnv`)
- Configurable environment settings via `configureEnvironment`
- Custom environment detector factory via `createEnvironmentDetector`
- Full TypeScript support with comprehensive type definitions
- Debug mode for troubleshooting injection issues

