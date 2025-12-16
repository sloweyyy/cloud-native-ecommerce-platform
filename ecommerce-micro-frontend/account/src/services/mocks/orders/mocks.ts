import type { OrderResponse } from '../../orders/types';

/**
 * Mock orders data
 */
export const mockOrdersResponse: OrderResponse[] = [
  {
    id: 1001,
    userName: 'testuser',
    totalPrice: 299.97,
    orderDate: '2024-01-15T10:30:00Z',
    status: 'delivered',
    items: [
      {
        productId: 'prod-1',
        productName: 'Product 1',
        price: 99.99,
        quantity: 2,
        imageFile: null,
      },
      {
        productId: 'prod-2',
        productName: 'Product 2',
        price: 99.99,
        quantity: 1,
        imageFile: null,
      },
    ],
    firstName: 'John',
    lastName: 'Doe',
    emailAddress: 'john.doe@example.com',
    addressLine: '123 Main St',
    country: 'USA',
    state: 'CA',
    zipCode: '12345',
  },
  {
    id: 1002,
    userName: 'testuser',
    totalPrice: 149.99,
    orderDate: '2024-01-20T14:20:00Z',
    status: 'shipped',
    items: [
      {
        productId: 'prod-3',
        productName: 'Product 3',
        price: 149.99,
        quantity: 1,
        imageFile: null,
      },
    ],
    firstName: 'John',
    lastName: 'Doe',
    emailAddress: 'john.doe@example.com',
    addressLine: '123 Main St',
    country: 'USA',
    state: 'CA',
    zipCode: '12345',
  },
  {
    id: 1003,
    userName: 'testuser',
    totalPrice: 79.99,
    orderDate: '2024-01-25T09:15:00Z',
    status: 'processing',
    items: [
      {
        productId: 'prod-4',
        productName: 'Product 4',
        price: 79.99,
        quantity: 1,
        imageFile: null,
      },
    ],
    firstName: 'John',
    lastName: 'Doe',
    emailAddress: 'john.doe@example.com',
    addressLine: '123 Main St',
    country: 'USA',
    state: 'CA',
    zipCode: '12345',
  },
];

