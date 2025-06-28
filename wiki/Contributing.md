# Contributing Guide

This page provides guidelines for contributing to the Cloud-Native E-commerce Platform.

## How to Contribute

We welcome contributions from everyone! Here are the ways you can contribute:

- **Code**: Implement new features or fix bugs
- **Documentation**: Improve or add documentation
- **Testing**: Add tests or identify bugs
- **Ideas**: Suggest enhancements or new features
- **Reviews**: Review pull requests

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- Read the [Development Guide](Development)
- Set up your development environment
- Familiarized yourself with the [Architecture](Architecture)
- Read our [Code of Conduct](https://github.com/sloweyyy/cloud-native-ecommerce-platform/blob/main/CODE_OF_CONDUCT.md)

### Finding Issues to Work On

1. Check the [Issues](https://github.com/sloweyyy/cloud-native-ecommerce-platform/issues) page
2. Look for issues labeled with:
   - `good first issue`: Good for newcomers
   - `help wanted`: Issues needing assistance
   - `bug`: Bugs that need fixing
   - `enhancement`: New features or improvements

### Setting Up Your Development Environment

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR-USERNAME/cloud-native-ecommerce-platform.git
   cd cloud-native-ecommerce-platform
   ```

3. Add the upstream repository:

   ```bash
   git remote add upstream https://github.com/sloweyyy/cloud-native-ecommerce-platform.git
   ```

4. Create a branch for your work:

   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Branching Strategy

We follow the GitFlow branching model:

- `main`: Production-ready code
- `develop`: Latest development changes
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `release/*`: Release preparation
- `hotfix/*`: Production hotfixes

### Making Changes

1. Make your changes following our [coding standards](Development#coding-standards)
2. Write tests for your changes
3. Ensure all tests pass:

   ```bash
   dotnet test
   ```

4. Update documentation as needed

### Committing Changes

We use the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(catalog): add product search by brand

fix(basket): resolve issue with discount calculation

docs(api): update API documentation
```

### Keeping Your Fork Updated

```bash
git fetch upstream
git checkout develop
git merge upstream/develop
```

## Pull Request Process

### Before Submitting

1. Ensure your code follows our coding standards
2. Run all tests and ensure they pass
3. Update documentation if needed
4. Rebase your branch on the latest develop branch

### Creating a Pull Request

1. Push your branch to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to the [repository](https://github.com/sloweyyy/cloud-native-ecommerce-platform)
3. Click "Compare & pull request"
4. Fill out the PR template with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots if applicable
   - Breaking changes if any

### PR Review Process

1. Automated checks must pass (CI)
2. At least one maintainer must review and approve
3. Address any feedback from reviewers
4. Once approved, a maintainer will merge your PR

## Code Review Guidelines

### For Contributors

- Be open to feedback
- Respond to comments promptly
- Explain your reasoning for design decisions
- Break large PRs into smaller ones when possible

### For Reviewers

- Be respectful and constructive
- Focus on code quality, not style preferences
- Explain your reasoning for requested changes
- Approve once requirements are met

## Documentation

### Code Documentation

- Use XML comments for public APIs
- Document complex logic with inline comments
- Keep comments up-to-date with code changes

### Wiki Documentation

- Update wiki pages for significant changes
- Create new pages for new features or components
- Use clear, concise language
- Include examples where appropriate

## Testing

### Types of Tests

- **Unit Tests**: Test individual components
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete workflows

### Testing Guidelines

- Write tests for all new features
- Maintain test coverage for existing code
- Follow the Arrange-Act-Assert pattern
- Use meaningful test names

## Community

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Pull Requests**: For code reviews and contributions

### Getting Help

If you need help with your contribution:

1. Check the [wiki](Home)
2. Search existing [issues](https://github.com/sloweyyy/cloud-native-ecommerce-platform/issues)
3. Ask in [GitHub Discussions](https://github.com/sloweyyy/cloud-native-ecommerce-platform/discussions)

## Recognition

Contributors will be recognized in:

- The [Contributors](https://github.com/sloweyyy/cloud-native-ecommerce-platform/graphs/contributors) page
- Release notes for significant contributions
- Special acknowledgments for major contributions

Thank you for contributing to the Cloud-Native E-commerce Platform! Your efforts help make this project better for everyone.
