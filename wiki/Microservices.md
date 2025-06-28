# Microservices

This page details each microservice in the Cloud-Native E-commerce Platform, their responsibilities, and how they interact.

## Microservices Overview

Our platform is composed of several microservices, each responsible for a specific business domain. All services follow Clean Architecture principles with clear separation of concerns.

![Dependencies Structure](../images/dependencies-structure.png)

## Catalog Service

### Purpose

Manages the product catalog, including products, categories, and brands.

### Components

- **Catalog.API**: REST API endpoints for catalog operations
- **Catalog.Application**: Application business logic using CQRS pattern
- **Catalog.Core**: Domain entities and business rules
- **Catalog.Infrastructure**: MongoDB data access implementation

### Key Features

- Product CRUD operations
- Category and brand management
- Product search and filtering
- Product image handling

### Data Storage

- **MongoDB**: Document database for flexible product attributes

### API Endpoints

- `GET /api/v1/catalog/products`: Get all products
- `GET /api/v1/catalog/products/{id}`: Get product by ID
- `GET /api/v1/catalog/products/category/{category}`: Get products by category
- `POST /api/v1/catalog/products`: Create new product
- `PUT /api/v1/catalog/products`: Update existing product
- `DELETE /api/v1/catalog/products/{id}`: Delete product

## Basket Service

### Purpose

Manages shopping carts for users, including adding/removing items and checkout.

### Components

- **Basket.API**: REST API endpoints for basket operations
- **Basket.Application**: Application business logic
- **Basket.Core**: Domain entities and business rules
- **Basket.Infrastructure**: Redis data access implementation

### Key Features

- Shopping cart creation and management
- Add/remove/update cart items
- Cart checkout process
- Integration with Discount service for applying discounts

### Data Storage

- **Redis**: In-memory database for fast cart operations

### API Endpoints

- `GET /api/v1/basket/{username}`: Get basket by username
- `POST /api/v1/basket`: Update basket
- `DELETE /api/v1/basket/{username}`: Delete basket
- `POST /api/v1/basket/checkout`: Checkout basket

## Discount Service

### Purpose

Manages product discounts and coupon codes.

### Components

- **Discount.API**: REST API and gRPC service for discount operations
- **Discount.Application**: Application business logic
- **Discount.Core**: Domain entities and business rules
- **Discount.Infrastructure**: PostgreSQL data access implementation

### Key Features

- Discount CRUD operations
- Coupon validation
- Discount calculation
- gRPC service for internal communication

### Data Storage

- **PostgreSQL**: Relational database for discount rules

### API Endpoints

- `GET /api/v1/discount/{productName}`: Get discount by product name
- `POST /api/v1/discount`: Create discount
- `PUT /api/v1/discount`: Update discount
- `DELETE /api/v1/discount/{productName}`: Delete discount

### gRPC Services

- `GetDiscount`: Get discount for product
- `CreateDiscount`: Create new discount
- `UpdateDiscount`: Update existing discount
- `DeleteDiscount`: Delete discount

## Ordering Service

### Purpose

Manages the order process from creation to fulfillment.

### Components

- **Ordering.API**: REST API endpoints for order operations
- **Ordering.Application**: Application business logic using CQRS with MediatR
- **Ordering.Core**: Domain entities and business rules
- **Ordering.Infrastructure**: SQL Server data access implementation

### Key Features

- Order creation and management
- Order status tracking
- Order history for users
- Event-driven integration with Basket service

### Data Storage

- **SQL Server**: Relational database for order data

### API Endpoints

- `GET /api/v1/orders`: Get all orders
- `GET /api/v1/orders/{username}`: Get orders by username
- `POST /api/v1/orders`: Create order
- `PUT /api/v1/orders`: Update order
- `DELETE /api/v1/orders/{id}`: Delete order

### Event Consumers

- `BasketCheckoutConsumer`: Consumes basket checkout events from RabbitMQ

## API Gateway

### Purpose

Serves as the entry point for all client requests, routing them to appropriate microservices.

### Components

- **Ocelot.ApiGateway**: API Gateway implementation using Ocelot

### Key Features

- Request routing
- Request aggregation
- Authentication and authorization
- Rate limiting and caching
- Load balancing

### Configuration

- Route configuration in `ocelot.json`
- Environment-specific configurations

## Service Communication

### Synchronous Communication

- **REST APIs**: For direct service-to-service communication
- **gRPC**: For high-performance internal communication (Basket to Discount)

### Asynchronous Communication

- **RabbitMQ**: For event-driven communication
- **Event Bus**: Shared infrastructure for publishing and consuming events

### Events

- `BasketCheckoutEvent`: Published when a user checks out their basket
- `OrderCreatedEvent`: Published when an order is created

## Service Dependencies

- **Basket Service → Discount Service**: Gets product discounts via gRPC
- **Basket Service → Ordering Service**: Sends checkout events via RabbitMQ
- **All Services → API Gateway**: All client communication goes through the gateway
