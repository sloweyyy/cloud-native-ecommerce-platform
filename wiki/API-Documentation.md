# API Documentation

This page provides documentation for the APIs exposed by the Cloud-Native E-commerce Platform.

## API Gateway

All client requests go through the API Gateway, which routes them to the appropriate microservice.

**Base URL**: `http://localhost:8010`

## Catalog API

The Catalog API manages products, categories, and brands.

### Endpoints

#### Get All Products

```
GET /api/v1/catalog/products
```

**Response**:

```json
[
  {
    "id": "602d2149e773f2a3990b47f5",
    "name": "IPhone X",
    "category": "Smart Phone",
    "summary": "This phone is the company's biggest change to its flagship smartphone in years.",
    "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ut, tenetur natus doloremque laborum quos iste ipsum rerum obcaecati impedit odit illo dolorum ab tempora nihil dicta earum fugiat.",
    "imageFile": "product-1.png",
    "price": 950.00
  },
  ...
]
```

#### Get Product by ID

```
GET /api/v1/catalog/products/{id}
```

**Parameters**:

- `id` (string, required): Product ID

**Response**:

```json
{
  "id": "602d2149e773f2a3990b47f5",
  "name": "IPhone X",
  "category": "Smart Phone",
  "summary": "This phone is the company's biggest change to its flagship smartphone in years.",
  "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ut, tenetur natus doloremque laborum quos iste ipsum rerum obcaecati impedit odit illo dolorum ab tempora nihil dicta earum fugiat.",
  "imageFile": "product-1.png",
  "price": 950.00
}
```

#### Get Products by Category

```
GET /api/v1/catalog/products/category/{category}
```

**Parameters**:

- `category` (string, required): Category name

**Response**:

```json
[
  {
    "id": "602d2149e773f2a3990b47f5",
    "name": "IPhone X",
    "category": "Smart Phone",
    "summary": "This phone is the company's biggest change to its flagship smartphone in years.",
    "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ut, tenetur natus doloremque laborum quos iste ipsum rerum obcaecati impedit odit illo dolorum ab tempora nihil dicta earum fugiat.",
    "imageFile": "product-1.png",
    "price": 950.00
  },
  ...
]
```

#### Create Product

```
POST /api/v1/catalog/products
```

**Request Body**:

```json
{
  "name": "New Product",
  "category": "Electronics",
  "summary": "Product summary",
  "description": "Detailed description",
  "imageFile": "product-image.png",
  "price": 499.99
}
```

**Response**: Created product object

#### Update Product

```
PUT /api/v1/catalog/products
```

**Request Body**:

```json
{
  "id": "602d2149e773f2a3990b47f5",
  "name": "Updated Product",
  "category": "Electronics",
  "summary": "Updated summary",
  "description": "Updated description",
  "imageFile": "updated-image.png",
  "price": 599.99
}
```

**Response**: Updated product object

#### Delete Product

```
DELETE /api/v1/catalog/products/{id}
```

**Parameters**:

- `id` (string, required): Product ID

**Response**: Boolean indicating success

## Basket API

The Basket API manages shopping carts.

### Endpoints

#### Get Basket

```
GET /api/v1/basket/{username}
```

**Parameters**:

- `username` (string, required): User identifier

**Response**:

```json
{
  "userName": "john",
  "items": [
    {
      "quantity": 2,
      "color": "Red",
      "price": 950.00,
      "productId": "602d2149e773f2a3990b47f5",
      "productName": "IPhone X"
    }
  ],
  "totalPrice": 1900.00
}
```

#### Update Basket

```
POST /api/v1/basket
```

**Request Body**:

```json
{
  "userName": "john",
  "items": [
    {
      "quantity": 2,
      "color": "Red",
      "price": 950.00,
      "productId": "602d2149e773f2a3990b47f5",
      "productName": "IPhone X"
    }
  ]
}
```

**Response**: Updated basket object

#### Delete Basket

```
DELETE /api/v1/basket/{username}
```

**Parameters**:

- `username` (string, required): User identifier

**Response**: No content

#### Checkout Basket

```
POST /api/v1/basket/checkout
```

**Request Body**:

```json
{
  "userName": "john",
  "totalPrice": 1900.00,
  "firstName": "John",
  "lastName": "Doe",
  "emailAddress": "john.doe@example.com",
  "addressLine": "123 Main St",
  "country": "USA",
  "state": "CA",
  "zipCode": "90210",
  "cardName": "John Doe",
  "cardNumber": "1234567890123456",
  "expiration": "12/25",
  "cvv": "123",
  "paymentMethod": 1
}
```

**Response**: No content (event published to RabbitMQ)

## Discount API

The Discount API manages product discounts.

### Endpoints

#### Get Discount

```
GET /api/v1/discount/{productName}
```

**Parameters**:

- `productName` (string, required): Product name

**Response**:

```json
{
  "id": 1,
  "productName": "IPhone X",
  "description": "IPhone Discount",
  "amount": 150
}
```

#### Create Discount

```
POST /api/v1/discount
```

**Request Body**:

```json
{
  "productName": "IPhone X",
  "description": "IPhone Discount",
  "amount": 150
}
```

**Response**: Created discount object

#### Update Discount

```
PUT /api/v1/discount
```

**Request Body**:

```json
{
  "id": 1,
  "productName": "IPhone X",
  "description": "Updated Discount",
  "amount": 200
}
```

**Response**: Updated discount object

#### Delete Discount

```
DELETE /api/v1/discount/{productName}
```

**Parameters**:

- `productName` (string, required): Product name

**Response**: Boolean indicating success

## Ordering API

The Ordering API manages orders.

### Endpoints

#### Get Orders by Username

```
GET /api/v1/orders/{username}
```

**Parameters**:

- `username` (string, required): User identifier

**Response**:

```json
[
  {
    "id": 1,
    "userName": "john",
    "totalPrice": 1900.00,
    "firstName": "John",
    "lastName": "Doe",
    "emailAddress": "john.doe@example.com",
    "addressLine": "123 Main St",
    "country": "USA",
    "state": "CA",
    "zipCode": "90210",
    "cardName": "John Doe",
    "cardNumber": "1234567890123456",
    "expiration": "12/25",
    "cvv": "123",
    "paymentMethod": 1,
    "status": "Pending"
  },
  ...
]
```

#### Create Order

```
POST /api/v1/orders
```

**Request Body**:

```json
{
  "userName": "john",
  "totalPrice": 1900.00,
  "firstName": "John",
  "lastName": "Doe",
  "emailAddress": "john.doe@example.com",
  "addressLine": "123 Main St",
  "country": "USA",
  "state": "CA",
  "zipCode": "90210",
  "cardName": "John Doe",
  "cardNumber": "1234567890123456",
  "expiration": "12/25",
  "cvv": "123",
  "paymentMethod": 1
}
```

**Response**: Created order object

#### Update Order

```
PUT /api/v1/orders
```

**Request Body**:

```json
{
  "id": 1,
  "userName": "john",
  "totalPrice": 1900.00,
  "firstName": "John",
  "lastName": "Doe",
  "emailAddress": "john.doe@example.com",
  "addressLine": "123 Main St",
  "country": "USA",
  "state": "CA",
  "zipCode": "90210",
  "cardName": "John Doe",
  "cardNumber": "1234567890123456",
  "expiration": "12/25",
  "cvv": "123",
  "paymentMethod": 1,
  "status": "Shipped"
}
```

**Response**: Updated order object

#### Delete Order

```
DELETE /api/v1/orders/{id}
```

**Parameters**:

- `id` (integer, required): Order ID

**Response**: Boolean indicating success

## Testing APIs

You can test these APIs using the Postman collections provided in the `PostmanCollection/` directory:

- `Catalog.postman_collection.json`
- `Basket API.postman_collection.json`
- `Discount.postman_collection.json`
- `Ordering.postman_collection.json`
- `API Gateway.postman_collection.json`

To use these collections:

1. Import them into Postman
2. Ensure the services are running
3. Execute the requests
