import { createFileRoute } from '@tanstack/react-router';
import ProductDetail from '../../pages/ProductDetail';

export const Route = createFileRoute('/product/$id')({
  component: ProductDetailRoute,
});

function ProductDetailRoute() {
  const { id } = Route.useParams();
  const { config } = Route.useRouteContext();

  return <ProductDetail productId={id} config={config} />;
}

