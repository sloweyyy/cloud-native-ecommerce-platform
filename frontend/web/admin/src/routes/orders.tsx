import { createFileRoute } from '@tanstack/react-router';
import OrdersManagement from '../pages/Orders/OrdersManagement';

export const Route = createFileRoute('/orders')({
  component: OrdersManagement,
});

