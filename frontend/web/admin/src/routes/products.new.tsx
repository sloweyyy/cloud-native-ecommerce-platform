import { createFileRoute } from '@tanstack/react-router';
import ProductForm from '../pages/Products/ProductForm';

export const Route = createFileRoute('/products/new')({
  component: () => <ProductForm />,
});

