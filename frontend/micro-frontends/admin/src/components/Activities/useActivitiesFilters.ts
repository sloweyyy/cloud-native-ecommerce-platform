import { useState, useMemo } from 'react';
import dayjs from 'dayjs';

export function useActivitiesFilters() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [entityType, setEntityType] = useState<string | undefined>();
  const [activityType, setActivityType] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [actor, setActor] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const hasActiveFilters = !!(
    entityType ||
    activityType ||
    dateRange ||
    actor ||
    searchQuery
  );

  const presetRanges = useMemo(() => {
    const now = dayjs();
    return {
      today: [now.startOf('day'), now.endOf('day')] as [
        dayjs.Dayjs,
        dayjs.Dayjs
      ],
      thisWeek: [now.startOf('week'), now.endOf('week')] as [
        dayjs.Dayjs,
        dayjs.Dayjs
      ],
      thisMonth: [now.startOf('month'), now.endOf('month')] as [
        dayjs.Dayjs,
        dayjs.Dayjs
      ],
      last7Days: [now.subtract(7, 'day').startOf('day'), now.endOf('day')] as [
        dayjs.Dayjs,
        dayjs.Dayjs
      ],
      last30Days: [
        now.subtract(30, 'day').startOf('day'),
        now.endOf('day'),
      ] as [dayjs.Dayjs, dayjs.Dayjs],
    };
  }, []);

  const filterParams = useMemo(() => {
    const params: {
      pageIndex: number;
      pageSize: number;
      entityType?: string;
      activityType?: string;
      from?: string;
      to?: string;
      actor?: string;
    } = {
      pageIndex,
      pageSize,
    };

    if (entityType) params.entityType = entityType;
    if (activityType) params.activityType = activityType;
    if (actor) params.actor = actor;
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.from = dateRange[0].toISOString();
      params.to = dateRange[1].toISOString();
    }

    return params;
  }, [pageIndex, pageSize, entityType, activityType, dateRange, actor]);

  function resetPageIndex() {
    setPageIndex(0);
  }

  return {
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
  };
}
