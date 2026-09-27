import { createFileRoute } from '@tanstack/react-router';
import Checkout from '../pages/Checkout';

export const Route = createFileRoute('/')({
  component: CheckoutRoute,
});

function CheckoutRoute() {
  const { config } = Route.useRouteContext();

  return <Checkout config={config} />;
}
