import { createFileRoute } from '@tanstack/react-router';
import Cart from '../pages/Cart';

export const Route = createFileRoute('/')({
  component: CartRoute,
});

function CartRoute() {
  const { config } = Route.useRouteContext();

  return <Cart config={config} />;
}
