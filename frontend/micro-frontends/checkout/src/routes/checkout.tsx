import { createFileRoute } from '@tanstack/react-router';
import Checkout from '../pages/Checkout';

export const Route = createFileRoute('/checkout')({
  component: CheckoutRoute,
});

function CheckoutRoute() {
  return <Checkout />;
}
