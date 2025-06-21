# System Architecture

This page provides an overview of the Cloud-Native E-commerce Platform architecture.

## Architecture Overview

The platform follows a microservices architecture with clean separation of concerns. Each microservice is built using Clean Architecture principles and is deployed as a containerized application in Kubernetes.

![System Architecture](../images/system-architecture.png)

## Key Components

### Client Layer

- **Angular Frontend**: Modern responsive UI built with Angular
- **Single Page Application**: Communicates with backend through API Gateway

### API Gateway Layer

- **Ocelot API Gateway**: Routes client requests to appropriate microservices
- **Authentication & Authorization**: Centralized security policies
- **Request Aggregation**: Combines multiple service responses
- **Rate Limiting & Load Balancing**: Traffic management

### Microservices Layer

Each microservice follows Clean Architecture with these layers:

- **API Layer**: Controllers and external interfaces
- **Application Layer**: Business workflows and application logic
- **Core/Domain Layer**: Business entities and rules
- **Infrastructure Layer**: Technical implementations and external concerns

#### Catalog Service

- **Purpose**: Product catalog management
- **Database**: MongoDB (document store)
- **Key Features**: Product CRUD, category management, search

#### Basket Service

- **Purpose**: Shopping cart management
- **Database**: Redis (in-memory)
- **Key Features**: Cart persistence, item management

#### Discount Service

- **Purpose**: Product discount management
- **Database**: PostgreSQL
- **Key Features**: Discount rules, coupon codes

#### Ordering Service

- **Purpose**: Order processing and management
- **Database**: SQL Server
- **Key Features**: Order creation, status tracking, history

### Infrastructure Services

#### Message Bus

- **RabbitMQ**: Event-driven communication between services
- **Event Types**: BasketCheckout, OrderCreated, etc.

#### Data Storage

- **MongoDB**: Document database for catalog
- **Redis**: In-memory database for basket
- **PostgreSQL**: Relational database for discounts
- **SQL Server**: Relational database for orders

#### Monitoring & Logging

- **Elasticsearch**: Log aggregation
- **Kibana**: Log visualization
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Jaeger**: Distributed tracing

## Communication Patterns

### Synchronous Communication

- **REST APIs**: Service-to-service direct HTTP calls
- **gRPC**: High-performance RPC for specific services

### Asynchronous Communication

- **Event-Driven**: Services publish and subscribe to events
- **Message Broker**: RabbitMQ handles message distribution

## Deployment Architecture

### Containerization

- **Docker**: All components packaged as containers
- **Docker Compose**: Local development environment

### Orchestration

- **Kubernetes**: Container orchestration platform
- **Helm Charts**: Package management for Kubernetes
- **Istio**: Service mesh for advanced networking

### CI/CD Pipeline

- **GitHub Actions**: Continuous Integration
- **Automated Tests**: Unit, integration, and end-to-end tests
- **Deployment Automation**: Automated deployment to Kubernetes

## Design Patterns

- **Clean Architecture**: Separation of concerns
- **CQRS**: Command Query Responsibility Segregation
- **Repository Pattern**: Data access abstraction
- **Mediator Pattern**: Request/response handling
- **Circuit Breaker**: Fault tolerance
- **Saga Pattern**: Distributed transactions

## Security Architecture

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **API Security**: Rate limiting, input validation
- **Network Security**: Service mesh encryption
- **Data Protection**: Encrypted storage

## Scalability Considerations

- **Horizontal Scaling**: Each microservice can scale independently
- **Stateless Design**: Services designed for horizontal scaling
- **Database Scaling**: Appropriate database choices for each service
- **Caching Strategy**: Redis for high-performance caching
