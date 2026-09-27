# E-Commerce Micro Frontend

A cloud-native e-commerce platform built with React 18+, Module Federation, and NX monorepo.

## Architecture

This project consists of:

- **host** - Main shell application that orchestrates micro-frontends
- **store** - Product catalog and browsing micro-frontend
- **checkout** - Shopping cart and checkout flow micro-frontend
- **account** - User account management micro-frontend

### Shared Packages

Located in `packages/`:

- **app-injector** - Standardized micro-frontend injection utilities (React 18+ createRoot API)
- **auth-provider** - Authentication provider with MSAL support

## Prerequisites

- Node.js 18+ 
- npm 9+

## Getting Started

### First-Time Setup

```bash
# Clone the repository
git clone <repository-url>
cd ecommerce-micro-frontend

# Install dependencies and build local packages (recommended)
npm run setup

# Or just install (postinstall will build packages automatically)
npm install
```

### Development

```bash
# Start all micro-frontends in parallel
npm start

# Start individual modules
npm run start:host      # Host shell (port 4200)
npm run start:store     # Store module (port 4201)
npm run start:checkout  # Checkout module (port 4202)
npm run start:account   # Account module (port 4203)
```

### Building

```bash
# Build all modules (development)
npm run build

# Build all modules (production)
npm run build:prod

# Build local packages only
npm run build:packages
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Linting & Formatting

```bash
# Lint all modules
npm run lint

# Lint and auto-fix
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Utility Commands

```bash
# View dependency graph
npm run graph

# Clean all caches and build artifacts
npm run clean

# Run affected tests only
npm run affected:test

# Run affected builds only
npm run affected:build
```

## Troubleshooting

### Build Errors on Fresh Clone

If you encounter build errors like `Cannot find module '@ecommerce-platform/app-injector'`:

```bash
# Rebuild local packages
npm run build:packages

# Or do a full clean setup
npm run clean
npm run setup
```

### Type Errors in IDE

If your IDE shows type errors but builds succeed:

1. Restart TypeScript server in your IDE
2. Ensure local packages are built: `npm run build:packages`

## Project Structure

```
ecommerce-micro-frontend/
├── host/                    # Host shell application
├── store/                   # Store micro-frontend
├── checkout/                # Checkout micro-frontend
├── account/                 # Account micro-frontend
├── packages/
│   ├── app-injector/        # MFE injection utilities
│   └── auth-provider/       # Authentication provider
├── nx.json                  # NX configuration
├── package.json             # Root package.json
└── tsconfig.base.json       # Base TypeScript config
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **NX** - Monorepo management
- **Module Federation** - Micro-frontend runtime integration
- **Ant Design** - UI component library
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **TanStack Router** - Type-safe routing
- **Zod** - Schema validation
- **Jest** - Unit testing
- **Playwright** - E2E testing

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm test` and `npm run lint` 
4. Submit a pull request

## License

MIT

