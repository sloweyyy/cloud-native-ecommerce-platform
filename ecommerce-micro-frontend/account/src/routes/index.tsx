import { createFileRoute } from '@tanstack/react-router';
import Profile from '../pages/Profile';

export const Route = createFileRoute('/')({
  component: ProfileRoute,
});

function ProfileRoute() {
  const { config } = Route.useRouteContext();

  return <Profile config={config} />;
}
