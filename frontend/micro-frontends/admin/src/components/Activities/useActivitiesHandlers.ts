import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import type { Activity } from '../../services/activities';

type UseActivitiesHandlersProps = {
  setSelectedActivity: (activity: Activity | null) => void;
  setIsDetailModalOpen: (open: boolean) => void;
  setEntityType: (value: string | undefined) => void;
  setActivityType: (value: string | undefined) => void;
  setDateRange: (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => void;
  setActor: (value: string | undefined) => void;
  setSearchQuery: (value: string) => void;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  setSelectedRowKeys: (keys: React.Key[]) => void;
  resetPageIndex: () => void;
  selectedActivity: Activity | null;
};

export function useActivitiesHandlers(props: UseActivitiesHandlersProps) {
  const {
    setSelectedActivity,
    setIsDetailModalOpen,
    setEntityType,
    setActivityType,
    setDateRange,
    setActor,
    setSearchQuery,
    setPageIndex,
    setPageSize,
    setSelectedRowKeys,
    resetPageIndex,
    selectedActivity,
  } = props;

  const navigate = useNavigate({ from: '/activities' });

  const handleActivityClick = useCallback(
    (activity: Activity) => {
      setSelectedActivity(activity);
      setIsDetailModalOpen(true);
    },
    [setSelectedActivity, setIsDetailModalOpen]
  );

  const handleViewEntity = useCallback(
    (activity: Activity) => {
      if (activity.entityType === 'Product') {
        navigate({ to: `/products/${activity.entityId}/edit` });
        return;
      }
      if (activity.entityType === 'Order') {
        navigate({ to: '/orders' });
      }
    },
    [navigate]
  );

  const handlePresetFilter = useCallback(
    (preset: 'today' | 'thisWeek' | 'thisMonth' | 'last7Days' | 'last30Days', presetRanges: any) => {
      const range = presetRanges[preset];
      setDateRange(range);
      resetPageIndex();
    },
    [setDateRange, resetPageIndex]
  );

  const handleResetFilters = useCallback(() => {
    setEntityType(undefined);
    setActivityType(undefined);
    setDateRange(null);
    setActor(undefined);
    setSearchQuery('');
    resetPageIndex();
  }, [
    setEntityType,
    setActivityType,
    setDateRange,
    setActor,
    setSearchQuery,
    resetPageIndex,
  ]);

  const handleEntityTypeChange = useCallback(
    (value: string | undefined) => {
      setEntityType(value);
      resetPageIndex();
    },
    [setEntityType, resetPageIndex]
  );

  const handleActivityTypeChange = useCallback(
    (value: string | undefined) => {
      setActivityType(value);
      resetPageIndex();
    },
    [setActivityType, resetPageIndex]
  );

  const handleDateRangeChange = useCallback(
    (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
      setDateRange(dates);
      resetPageIndex();
    },
    [setDateRange, resetPageIndex]
  );

  const handleActorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setActor(e.target.value || undefined);
      resetPageIndex();
    },
    [setActor, resetPageIndex]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  const handlePaginationChange = useCallback(
    (page: number, size: number) => {
      setPageIndex(page - 1);
      setPageSize(size);
    },
    [setPageIndex, setPageSize]
  );

  const handleRowSelectionChange = useCallback(
    (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
    [setSelectedRowKeys]
  );

  const handleSelectAll = useCallback(
    (selected: boolean, selectedRows: Activity[]) => {
      setSelectedRowKeys(selected ? selectedRows.map((r) => r.id) : []);
    },
    [setSelectedRowKeys]
  );

  const handleRowClick = useCallback(
    (record: Activity) => {
      handleActivityClick(record);
    },
    [handleActivityClick]
  );

  const handleViewAllRelatedActivities = useCallback(() => {
    if (!selectedActivity) return;
    setEntityType(selectedActivity.entityType);
    setIsDetailModalOpen(false);
  }, [selectedActivity, setEntityType, setIsDetailModalOpen]);

  const handleViewAllEntityTypeActivities = useCallback(() => {
    if (!selectedActivity) return;
    setEntityType(selectedActivity.entityType);
    setActivityType(undefined);
    setDateRange(null);
    setIsDetailModalOpen(false);
  }, [
    selectedActivity,
    setEntityType,
    setActivityType,
    setDateRange,
    setIsDetailModalOpen,
  ]);

  const handleRelatedActivityClick = useCallback(
    (activity: Activity) => {
      setSelectedActivity(activity);
    },
    [setSelectedActivity]
  );

  return {
    handleActivityClick,
    handleViewEntity,
    handlePresetFilter,
    handleResetFilters,
    handleEntityTypeChange,
    handleActivityTypeChange,
    handleDateRangeChange,
    handleActorChange,
    handleSearchChange,
    handlePaginationChange,
    handleRowSelectionChange,
    handleSelectAll,
    handleRowClick,
    handleViewAllRelatedActivities,
    handleViewAllEntityTypeActivities,
    handleRelatedActivityClick,
  };
}

