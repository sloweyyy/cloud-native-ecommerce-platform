import React from 'react';
import {
  Card,
  Space,
  Typography,
  Button,
  Input,
  Select,
  DatePicker,
  Divider,
  Badge,
  theme,
} from 'antd';
import {
  FilterOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

type ActivitiesFiltersProps = {
  filtersExpanded: boolean;
  hasActiveFilters: boolean;
  searchQuery: string;
  entityType?: string;
  activityType?: string;
  dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
  actor?: string;
  presetRanges: {
    today: [dayjs.Dayjs, dayjs.Dayjs];
    thisWeek: [dayjs.Dayjs, dayjs.Dayjs];
    thisMonth: [dayjs.Dayjs, dayjs.Dayjs];
    last7Days: [dayjs.Dayjs, dayjs.Dayjs];
    last30Days: [dayjs.Dayjs, dayjs.Dayjs];
  };
  onToggleExpanded: () => void;
  onPresetFilter: (
    preset: keyof ActivitiesFiltersProps['presetRanges']
  ) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEntityTypeChange: (value: string | undefined) => void;
  onActivityTypeChange: (value: string | undefined) => void;
  onDateRangeChange: (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => void;
  onActorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetFilters: () => void;
};

function ActivitiesFilters(props: ActivitiesFiltersProps) {
  const {
    filtersExpanded,
    hasActiveFilters,
    searchQuery,
    entityType,
    activityType,
    dateRange,
    actor,
    onToggleExpanded,
    onPresetFilter,
    onSearchChange,
    onEntityTypeChange,
    onActivityTypeChange,
    onDateRangeChange,
    onActorChange,
    onResetFilters,
  } = props;
  const { token } = theme.useToken();

  const activeFiltersCount = Object.values({
    entityType,
    activityType,
    dateRange,
    actor,
    searchQuery,
  }).filter(Boolean).length;

  return (
    <Card
      title={
        <Space>
          <FilterOutlined />
          <Text strong>Filters</Text>
          {hasActiveFilters && <Badge count={activeFiltersCount} />}
        </Space>
      }
      extra={
        <Button type="text" size="small" onClick={onToggleExpanded}>
          {filtersExpanded && 'Collapse'}
          {!filtersExpanded && 'Expand'}
        </Button>
      }
    >
      {filtersExpanded && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Text strong>Quick Filters:</Text>
            <Button size="small" onClick={() => onPresetFilter('today')}>
              Today
            </Button>
            <Button size="small" onClick={() => onPresetFilter('thisWeek')}>
              This Week
            </Button>
            <Button size="small" onClick={() => onPresetFilter('thisMonth')}>
              This Month
            </Button>
            <Button size="small" onClick={() => onPresetFilter('last7Days')}>
              Last 7 Days
            </Button>
            <Button size="small" onClick={() => onPresetFilter('last30Days')}>
              Last 30 Days
            </Button>
          </Space>

          <Divider style={{ margin: `${token.sizeUnit * 2}px 0` }} />

          <Space wrap size="middle" style={{ width: '100%' }}>
            <Space direction="vertical" size="small">
              <Text strong>Search</Text>
              <Search
                placeholder="Search activities..."
                allowClear
                value={searchQuery}
                onChange={onSearchChange}
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
              />
            </Space>

            <Space direction="vertical" size="small">
              <Text strong>Entity Type</Text>
              <Select
                placeholder="All Types"
                style={{ width: 150 }}
                allowClear
                value={entityType}
                onChange={onEntityTypeChange}
              >
                <Option value="Product">Product</Option>
                <Option value="Order">Order</Option>
              </Select>
            </Space>

            <Space direction="vertical" size="small">
              <Text strong>Activity Type</Text>
              <Select
                placeholder="All Activities"
                style={{ width: 200 }}
                allowClear
                value={activityType}
                onChange={onActivityTypeChange}
              >
                <Option value="Product.Created">Product Created</Option>
                <Option value="Product.Updated">Product Updated</Option>
                <Option value="Order.Created">Order Created</Option>
                <Option value="Order.Updated">Order Updated</Option>
              </Select>
            </Space>

            <Space direction="vertical" size="small">
              <Text strong>Date Range</Text>
              <RangePicker
                value={dateRange}
                onChange={onDateRangeChange}
                showTime
                format="YYYY-MM-DD HH:mm"
              />
            </Space>

            <Space direction="vertical" size="small">
              <Text strong>Actor</Text>
              <Input
                placeholder="Filter by actor"
                style={{ width: 150 }}
                value={actor}
                onChange={onActorChange}
                allowClear
                prefix={<UserOutlined />}
              />
            </Space>

            <Space direction="vertical" size="small">
              <Text strong>Actions</Text>
              <Button onClick={onResetFilters} disabled={!hasActiveFilters}>
                Reset All
              </Button>
            </Space>
          </Space>
        </Space>
      )}
    </Card>
  );
}

export default ActivitiesFilters;
