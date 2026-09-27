import React, { useState, useMemo } from 'react';
import { Space } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import { useGetRecentActivities } from '../../services/activities';
import type { Activity } from '../../services/activities';
import ExportModal from '../../components/Activities/ExportModal';
import ActivityStatistics from '../../components/Activities/ActivityStatistics';
import ActivitiesHeader from '../../components/Activities/ActivitiesHeader';
import ActivitiesStatsCards from '../../components/Activities/ActivitiesStatsCards';
import ActivitiesFilters from '../../components/Activities/ActivitiesFilters';
import ActivitiesTable from '../../components/Activities/ActivitiesTable';
import ActivityDetailModal from '../../components/Activities/ActivityDetailModal';
import { useActivitiesColumns } from '../../components/Activities/useActivitiesColumns';
import { useActivitiesFilters } from '../../components/Activities/useActivitiesFilters';
import { useRefreshThrottle } from '../../components/Activities/useRefreshThrottle';
import { useActivitiesHandlers } from '../../components/Activities/useActivitiesHandlers';

dayjs.extend(relativeTime);

type ActivitiesManagementProps = {
  config?: AppInjectorProps['config'];
};

function ActivitiesManagement(props: ActivitiesManagementProps) {
  const [viewMode, setViewMode] = useState<'table' | 'statistics'>('table');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const filters = useActivitiesFilters();
  const {
    pageIndex,
    pageSize,
    entityType,
    activityType,
    dateRange,
    actor,
    searchQuery,
    filtersExpanded,
    hasActiveFilters,
    presetRanges,
    filterParams,
    setPageIndex,
    setPageSize,
    setEntityType,
    setActivityType,
    setDateRange,
    setActor,
    setSearchQuery,
    setFiltersExpanded,
    resetPageIndex,
  } = filters;

  const {
    data: activitiesData,
    isLoading,
    refetch,
  } = useGetRecentActivities({
    ...filterParams,
    staleTime: 5000,
  });

  const { refreshCooldownRemaining, handleRefresh } =
    useRefreshThrottle(refetch);

  const handlers = useActivitiesHandlers({
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
  });
  const activities = useMemo(
    () => activitiesData?.items || [],
    [activitiesData?.items]
  );
  const totalCount = useMemo(
    () => activitiesData?.totalCount || 0,
    [activitiesData?.totalCount]
  );
  const totalPages = useMemo(
    () => activitiesData?.totalPages || 0,
    [activitiesData?.totalPages]
  );
  const isRefreshDisabled = useMemo(
    () => isLoading || refreshCooldownRemaining > 0,
    [isLoading, refreshCooldownRemaining]
  );

  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities;

    const query = searchQuery.toLowerCase();
    return activities.filter(
      (activity) =>
        activity.title.toLowerCase().includes(query) ||
        activity.description?.toLowerCase().includes(query) ||
        activity.entityId.toLowerCase().includes(query) ||
        activity.actor?.toLowerCase().includes(query) ||
        activity.sourceService.toLowerCase().includes(query)
    );
  }, [activities, searchQuery]);

  const stats = useMemo(() => {
    const now = dayjs();
    const todayStart = now.startOf('day');
    const weekStart = now.startOf('week');
    const monthStart = now.startOf('month');

    const todayActivities = activities.filter((a) =>
      dayjs(a.occurredAt).isAfter(todayStart)
    );
    const weekActivities = activities.filter((a) =>
      dayjs(a.occurredAt).isAfter(weekStart)
    );
    const monthActivities = activities.filter((a) =>
      dayjs(a.occurredAt).isAfter(monthStart)
    );

    return {
      today: todayActivities.length,
      thisWeek: weekActivities.length,
      thisMonth: monthActivities.length,
      total: totalCount,
    };
  }, [activities, totalCount]);

  const relatedActivities = useMemo(() => {
    if (!selectedActivity) return [];
    return activities
      .filter(
        (a) =>
          a.entityId === selectedActivity.entityId &&
          a.id !== selectedActivity.id
      )
      .slice(0, 5);
  }, [selectedActivity, activities]);

  const {
    handleActivityClick,
    handleViewEntity,
    handlePresetFilter: handlePresetFilterBase,
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
  } = handlers;

  const columns = useActivitiesColumns({
    onActivityClick: handleActivityClick,
    onViewEntity: handleViewEntity,
  });

  function handlePresetFilter(preset: keyof typeof presetRanges) {
    handlePresetFilterBase(preset, presetRanges);
  }

  function handleSetViewMode(mode: 'table' | 'statistics') {
    setViewMode(mode);
  }

  function handleToggleFiltersExpanded() {
    setFiltersExpanded(!filtersExpanded);
  }

  function handleCloseDetailModal() {
    setIsDetailModalOpen(false);
  }

  function handleCloseExportModal() {
    setIsExportModalOpen(false);
  }

  function handleOpenExportModal() {
    setIsExportModalOpen(true);
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <ActivitiesHeader
        viewMode={viewMode}
        isLoading={isLoading}
        isRefreshDisabled={isRefreshDisabled}
        onViewModeChange={handleSetViewMode}
        onExport={handleOpenExportModal}
        onRefresh={handleRefresh}
      />

      <ActivitiesStatsCards stats={stats} />

      <ActivitiesFilters
        filtersExpanded={filtersExpanded}
        hasActiveFilters={hasActiveFilters}
        searchQuery={searchQuery}
        entityType={entityType}
        activityType={activityType}
        dateRange={dateRange}
        actor={actor}
        presetRanges={presetRanges}
        onToggleExpanded={handleToggleFiltersExpanded}
        onPresetFilter={handlePresetFilter}
        onSearchChange={handleSearchChange}
        onEntityTypeChange={handleEntityTypeChange}
        onActivityTypeChange={handleActivityTypeChange}
        onDateRangeChange={handleDateRangeChange}
        onActorChange={handleActorChange}
        onResetFilters={handleResetFilters}
      />

      {viewMode === 'table' && (
        <ActivitiesTable
          columns={columns}
          activities={filteredActivities}
          isLoading={isLoading}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          searchQuery={searchQuery}
          selectedRowKeys={selectedRowKeys}
          onRowClick={handleRowClick}
          onRowSelectionChange={handleRowSelectionChange}
          onSelectAll={handleSelectAll}
          onPaginationChange={handlePaginationChange}
        />
      )}

      {viewMode === 'statistics' && (
        <ActivityStatistics activities={activities} isLoading={isLoading} />
      )}

      <ExportModal
        open={isExportModalOpen}
        onClose={handleCloseExportModal}
        activities={activities}
        totalCount={totalCount}
        selectedActivities={activities.filter((a) =>
          selectedRowKeys.includes(a.id)
        )}
        filters={{
          entityType,
          activityType,
          dateRange,
          actor,
        }}
      />

      <ActivityDetailModal
        open={isDetailModalOpen}
        activity={selectedActivity}
        relatedActivities={relatedActivities}
        onClose={handleCloseDetailModal}
        onViewEntity={(activity) => {
          handleViewEntity(activity);
          setIsDetailModalOpen(false);
        }}
        onViewAllEntityTypeActivities={handleViewAllEntityTypeActivities}
        onViewAllRelatedActivities={handleViewAllRelatedActivities}
        onRelatedActivityClick={handleRelatedActivityClick}
      />
    </Space>
  );
}

export default ActivitiesManagement;
