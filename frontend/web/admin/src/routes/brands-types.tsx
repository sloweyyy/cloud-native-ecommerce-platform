import { createFileRoute } from '@tanstack/react-router';
import BrandsTypesManagement from '../pages/BrandsTypes/BrandsTypesManagement';

export const Route = createFileRoute('/brands-types')({
  component: BrandsTypesManagement,
});

