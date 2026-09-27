import { createFileRoute } from '@tanstack/react-router';
import ProductForm from '../pages/Products/ProductForm';

function EditProductPage() {
  const { id } = Route.useParams();
  return <ProductForm productId={id} />;
}

export const Route = createFileRoute('/products/$id/edit')({
  component: EditProductPage,
});

