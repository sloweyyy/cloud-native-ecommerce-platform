import { createFileRoute } from '@tanstack/react-router';
import Orders from '../pages/Orders';

export const Route = createFileRoute('/orders')({
  component: OrdersRoute,
});

function OrdersRoute() {
  const { config } = Route.useRouteContext();

  return <Orders config={config} />;
}

