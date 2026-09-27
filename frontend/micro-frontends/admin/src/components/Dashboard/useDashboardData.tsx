import { useMemo } from 'react';
import { useRouteContext } from '@tanstack/react-router';
import { useGetAllProducts } from '../../services/products';
import { useGetAllOrders } from '../../services/orders';
import { useGetRecentActivities } from '../../services/activities';
import { useAuth } from '@ecommerce-platform/auth-provider';
import type { Order } from '../../services/orders';
import type { IconType } from '../shared/utils/iconUtils';

type StatisticItem = {
  title: string;
  value: number;
  iconType: IconType;
  loading: boolean;
  precision?: number;
};

type RecentActivityItem = {
  id: string;
  entityType: string;
  activityType: string;
  title: string;
  description: string;
  timeAgo: string;
};

export function useDashboardData(): {
  statistics: StatisticItem[];
  recentActivities: RecentActivityItem[];
  isLoadingActivities: boolean;
} {
  const routeContext = useRouteContext({ from: '__root__' });
  const routerUser = routeContext?.auth?.user as
    | { username?: string }
    | undefined;
  const { user } = useAuth();
  const currentUserName =
    routerUser?.username || user?.username || user?.email || user?.id || '';

  const { data: productsData, isLoading: isLoadingProducts } =
    useGetAllProducts({
      pageIndex: 1,
      pageSize: 1,
    });

  const { data: orders = [], isLoading: isLoadingOrders } = useGetAllOrders(
    currentUserName || '',
    { enabled: !!currentUserName }
  );

  const { data: activitiesData, isLoading: isLoadingActivities } =
    useGetRecentActivities({
      pageSize: 10,
      pageIndex: 0,
    });

  const totalProducts = productsData?.count || 0;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum: number, order: Order) => sum + (order.totalPrice || 0),
    0
  );
  const uniqueUsers = new Set(
    orders.map((order: Order) => order.userName).filter(Boolean)
  ).size;

  const statistics = useMemo(
    () => [
      {
        title: 'Total Products',
        value: totalProducts,
        iconType: 'products' as const,
        loading: isLoadingProducts,
      },
      {
        title: 'Total Orders',
        value: totalOrders,
        iconType: 'orders' as const,
        loading: isLoadingOrders,
      },
      {
        title: 'Total Revenue',
        value: totalRevenue,
        iconType: 'revenue' as const,
        precision: 2,
        loading: isLoadingOrders,
      },
      {
        title: 'Active Users',
        value: uniqueUsers,
        iconType: 'users' as const,
        loading: isLoadingOrders,
      },
    ],
    [
      totalProducts,
      totalOrders,
      totalRevenue,
      uniqueUsers,
      isLoadingProducts,
      isLoadingOrders,
    ]
  );

  const recentActivities = useMemo(() => {
    if (!activitiesData?.items || activitiesData.items.length === 0) {
      return [];
    }

    return activitiesData.items.map((activity) => ({
      id: String(activity.id),
      entityType: activity.entityType,
      activityType: activity.activityType,
      title: activity.title,
      description: activity.description || '',
      timeAgo: activity.timeAgo || 'just now',
    }));
  }, [activitiesData]);

  return {
    statistics,
    recentActivities,
    isLoadingActivities,
  };
}
