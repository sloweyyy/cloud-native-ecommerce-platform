import { createFileRoute } from '@tanstack/react-router';
import ActivitiesManagement from '../pages/Activities/ActivitiesManagement';

export const Route = createFileRoute('/activities')({
  component: ActivitiesManagement,
});

