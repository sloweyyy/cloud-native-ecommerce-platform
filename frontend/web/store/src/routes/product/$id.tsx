import { createFileRoute } from '@tanstack/react-router';
import ProductDetail from '../../pages/ProductDetail';

export const Route = createFileRoute('/product/$id')({
  component: ProductDetailRoute,
});

function ProductDetailRoute() {
  const { id } = Route.useParams();

  return <ProductDetail productId={id} />;
}

