import { createFileRoute } from '@tanstack/react-router';
import ProductList from '../pages/ProductList';
import { productListSearchSchema } from '../typings/search';

export type { ProductListSearch } from '../typings/search';

export const Route = createFileRoute('/')({
  component: ProductListRoute,
  validateSearch: (search) => productListSearchSchema.parse(search),
});

function ProductListRoute() {
  const { config } = Route.useRouteContext();

  return <ProductList config={config} />;
}
