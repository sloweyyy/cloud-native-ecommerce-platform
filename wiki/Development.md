# Development Guide

This page provides guidelines and information for developers working on the Cloud-Native E-commerce Platform.

## Development Environment Setup

### Prerequisites

- .NET Core SDK 8.0+
- Docker Desktop
- Node.js 18+ (for frontend)
- Git
- IDE (Visual Studio 2022 or VS Code recommended)

### Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/sloweyyy/cloud-native-ecommerce-platform.git
   cd cloud-native-ecommerce-platform
   ```

2. **Start infrastructure services**

   ```bash
   docker-compose up -d mongodb redis postgres sqlserver rabbitmq elasticsearch kibana
   ```

3. **Build the solution**

   ```bash
   dotnet build Ecommerce.sln
   ```

4. **Run individual services**

   Each service can be run independently. Open separate terminal windows for each service:

   ```bash
   # Catalog API
   cd Services/Catalog/Catalog.API
   dotnet run

   # Basket API
   cd Services/Basket/Basket.API
   dotnet run

   # Discount API
   cd Services/Discount/Discount.API
   dotnet run

   # Ordering API
   cd Services/Ordering/Ordering.API
   dotnet run

   # API Gateway
   cd ApiGateways/Ocelot.ApiGateway
   dotnet run
   ```

5. **Run the frontend**

   ```bash
   cd client
   npm install --legacy-peer-deps
   npm start
   ```

## Project Structure

The project follows a clean architecture pattern with microservices:

```
├── src/
│   ├── ApiGateways/                    # API gateway layer
│   ├── Infrastructure/                 # Shared infrastructure components
│   ├── Services/                       # Microservices implementations
│   │   ├── Basket/                     # Shopping cart service
│   │   ├── Catalog/                    # Product catalog service
│   │   ├── Discount/                   # Discount management service
│   │   └── Ordering/                   # Order processing service
│   ├── client/                         # Angular frontend application
│   └── images/                         # Documentation images
├── docker-compose.yml                  # Docker Compose configuration
├── Deployments/                        # Kubernetes and Helm deployment files
└── PostmanCollection/                  # API testing collections
```

Each microservice follows Clean Architecture with these layers:

- **API Layer**: Controllers and external interfaces
- **Application Layer**: Business workflows and application logic
- **Core/Domain Layer**: Business entities and rules
- **Infrastructure Layer**: Technical implementations and external concerns

## Coding Standards

### .NET Guidelines

- Follow [Microsoft's C# Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/inside-a-program/coding-conventions)
- Use meaningful variable and method names
- Write XML documentation for public APIs
- Follow SOLID principles
- Use dependency injection appropriately

### Angular Guidelines

- Follow [Angular Style Guide](https://angular.io/guide/styleguide)
- Use TypeScript strictly
- Write unit tests for components and services
- Follow reactive patterns with RxJS

### General Principles

- **Clean Architecture**: Maintain separation of concerns
- **SOLID Principles**: Write maintainable, extensible code
- **DRY**: Don't repeat yourself
- **YAGNI**: You ain't gonna need it
- **Testing**: Write tests for new functionality

## Testing

### Unit Testing

```bash
# Run all tests
dotnet test

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Frontend tests
cd client
npm test
```

### Integration Testing

Integration tests are located in each service's test project.

```bash
# Run integration tests
dotnet test --filter "Category=Integration"
```

### API Testing

Use the Postman collections in the `PostmanCollection/` directory for testing APIs.

## Debugging

### Backend Services

1. **Visual Studio**:
   - Open `Ecommerce.sln`
   - Set startup project to the service you want to debug
   - Press F5 to start debugging

2. **VS Code**:
   - Open the service folder
   - Use the `.vscode/launch.json` configuration
   - Press F5 to start debugging

### Frontend

1. **Angular DevTools**:
   - Install the Angular DevTools browser extension
   - Use Chrome DevTools for debugging

2. **VS Code**:
   - Use the Debugger for Chrome extension
   - Configure `launch.json` for Angular debugging

## Working with Docker

### Building Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build catalog.api
```

### Running with Docker

```bash
# Run all services
docker-compose up -d

# Run specific service
docker-compose up -d catalog.api

# View logs
docker-compose logs -f
```

## Common Development Tasks

### Adding a New API Endpoint

1. Define the request/response models in the Application layer
2. Create a command/query in the Application layer
3. Implement the handler in the Application layer
4. Add the controller endpoint in the API layer
5. Update the API Gateway configuration if needed

### Adding a New Entity

1. Define the entity in the Core layer
2. Add repository interface in the Core layer
3. Implement repository in the Infrastructure layer
4. Configure entity mapping in the Infrastructure layer
5. Create DTOs and mappers in the Application layer
6. Add API endpoints in the API layer

### Adding a New Event

1. Define the event in the EventBus.Messages project
2. Implement the publisher in the source service
3. Implement the consumer in the target service
4. Register the consumer in the target service's Program.cs

## Branching Strategy

We follow the GitFlow branching model:

- `main`: Production-ready code
- `develop`: Latest development changes
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `release/*`: Release preparation
- `hotfix/*`: Production hotfixes

## Pull Request Process

1. Create a branch from `develop` for your feature/fix
2. Make your changes following the coding standards
3. Write tests for your changes
4. Update documentation as needed
5. Submit a pull request to `develop`
6. Ensure CI passes
7. Get approval from at least one reviewer

## Continuous Integration

Our GitHub Actions workflows automate:

- Building the solution
- Running tests
- Linting code
- Building Docker images
- Validating Kubernetes manifests and Helm charts

See `.github/workflows/` for the CI configuration.
