# Contributing to Cloud-Native E-commerce Platform

First off, thank you for considering contributing to our project! 🎉 It's people like you that make this platform great.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, please include:

- Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml)
- Provide clear steps to reproduce
- Include environment details
- Add relevant logs or screenshots

### 💡 Suggesting Features

We welcome new feature ideas! Please:

- Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.yml)
- Explain the problem you're trying to solve
- Describe your proposed solution
- Consider the impact on existing functionality

### 📝 Improving Documentation

Documentation improvements are always welcome:

- Fix typos or unclear instructions
- Add examples or tutorials
- Improve API documentation
- Translate documentation

### 💻 Code Contributions

1. **Find an Issue**: Look for issues labeled with `good first issue`, `help wanted`, or `bug`
2. **Discuss**: Comment on the issue to discuss your approach
3. **Fork & Branch**: Fork the repo and create a feature branch
4. **Code**: Write your code following our standards
5. **Test**: Ensure all tests pass and add new tests
6. **Submit**: Create a pull request

## Development Setup

### Prerequisites

- .NET Core SDK 8.0+
- Docker Desktop
- Node.js 18+ (for frontend)
- Git
- A code editor (VS Code recommended)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/sloweyyy/cloud-native-ecommerce-platform.git
   cd cloud-native-ecommerce-platform
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up -d mongodb redis postgres sqlserver rabbitmq elasticsearch kibana
   ```

3. **Build and run services**
   ```bash
   # Build all services
   dotnet build Ecommerce.sln
   
   # Run individual services (in separate terminals)
   cd src/Services/Catalog/Catalog.API && dotnet run
   cd src/Services/Basket/Basket.API && dotnet run
   cd src/Services/Discount/Discount.API && dotnet run
   cd src/Services/Ordering/Ordering.API && dotnet run
   cd src/ApiGateways/Ocelot.ApiGateway && dotnet run
   ```

4. **Frontend development (Micro-frontends)**
   ```bash
   cd frontend/web
   npm install
   npx nx serve host
   ```

### Testing

```bash
# Run all tests
dotnet test

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Frontend tests
cd frontend/web
npx nx run-many --target=test --all
```

## Coding Standards

### .NET Guidelines

- Follow [Microsoft's C# Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/inside-a-program/coding-conventions)
- Use meaningful variable and method names
- Write XML documentation for public APIs
- Follow SOLID principles
- Use dependency injection appropriately

### React / Micro-frontend Guidelines

- Follow React best practices and hooks patterns
- Use TypeScript strictly
- Write unit tests for components and utilities
- Follow Nx workspace conventions for module federation

### General Principles

- **Clean Architecture**: Maintain separation of concerns
- **SOLID Principles**: Write maintainable, extensible code
- **DRY**: Don't repeat yourself
- **YAGNI**: You ain't gonna need it
- **Testing**: Write tests for new functionality

### Code Formatting

We use automated formatting tools:

- **.NET**: EditorConfig and built-in formatting
- **React/Nx**: Prettier with ESLint
- **YAML**: Standard YAML formatting

## Pull Request Process

### Before Submitting

1. **Update Documentation**: Ensure documentation reflects your changes
2. **Add Tests**: Include appropriate test coverage
3. **Check Style**: Run linting and formatting tools
4. **Verify Build**: Ensure all services build successfully
5. **Test Locally**: Run the full test suite

### PR Requirements

- Use the [PR template](.github/pull_request_template.md)
- Link to related issues
- Provide clear description of changes
- Include breaking change notes if applicable
- Ensure CI passes

### Review Process

1. **Automated Checks**: CI must pass
2. **Code Review**: At least one maintainer review
3. **Security Review**: For security-related changes
4. **Documentation Review**: For user-facing changes

## Issue Guidelines

### Creating Issues

- **Search First**: Check for existing issues
- **Use Templates**: Use the appropriate issue template
- **Be Specific**: Provide detailed information
- **Stay On Topic**: One issue per problem/feature

### Labels

We use labels to categorize issues:

- **Type**: `bug`, `enhancement`, `documentation`
- **Component**: `catalog`, `basket`, `ordering`, `frontend`
- **Priority**: `low`, `medium`, `high`, `critical`
- **Status**: `triage`, `in-progress`, `blocked`
- **Difficulty**: `good first issue`, `help wanted`

## Community

### Getting Help

- **Documentation**: Check the [README](README.md) and docs
- **Issues**: Search existing issues for answers
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord server

### Maintainers

Current maintainers:
- [@sloweyyy](https://github.com/sloweyyy) - Project Lead

### Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- Project documentation
- Community showcases

## Development Workflow

### Git Workflow

We use **GitHub Flow** with the following branches:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature development branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Critical production fixes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(catalog): add product search functionality`
- `fix(basket): resolve cart persistence issue`
- `docs: update deployment guide`
- `chore: update dependencies`

### Versioning

We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Architecture Guidelines

### Microservices

Each service should:
- Have a single responsibility
- Be independently deployable
- Own its data
- Communicate via well-defined APIs

### Database

- Each service owns its database
- Use appropriate database for the use case
- Implement proper migration strategies

### API Design

- Follow RESTful principles
- Use proper HTTP status codes
- Implement consistent error handling
- Document APIs with OpenAPI/Swagger

### Security

- Follow OWASP guidelines
- Implement proper authentication/authorization
- Use HTTPS everywhere
- Validate all inputs
- Handle sensitive data appropriately

## Testing Guidelines

### Test Types

1. **Unit Tests**: Test individual components
2. **Integration Tests**: Test service interactions
3. **E2E Tests**: Test complete user workflows
4. **Contract Tests**: Test API contracts

### Test Coverage

- Aim for 80%+ code coverage
- Focus on critical paths
- Test edge cases and error conditions
- Don't test trivial code

## Release Process

1. **Feature Complete**: All features merged to develop
2. **Testing**: Comprehensive testing phase
3. **Release Branch**: Create release branch
4. **Final Testing**: Production-like testing
5. **Tag & Release**: Create GitHub release
6. **Deploy**: Deploy to production
7. **Monitor**: Monitor for issues

## Getting Started Checklist

- [ ] Read the [Code of Conduct](CODE_OF_CONDUCT.md)
- [ ] Set up your development environment
- [ ] Run the project locally
- [ ] Find a good first issue
- [ ] Join our community discussions
- [ ] Make your first contribution!

## Questions?

If you have questions about contributing, please:

1. Check the existing documentation
2. Search issues and discussions
3. Ask in our community channels
4. Open a new discussion

Thank you for contributing to making this project better! 🚀 