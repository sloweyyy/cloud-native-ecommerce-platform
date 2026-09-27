import { createFileRoute } from '@tanstack/react-router';
import ProductsManagement from '../pages/Products/ProductsManagement';

export const Route = createFileRoute('/products')({
  component: ProductsManagement,
});

