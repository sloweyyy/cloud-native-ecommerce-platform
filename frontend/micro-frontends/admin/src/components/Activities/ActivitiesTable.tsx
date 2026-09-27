import React from 'react';
import {
  Card,
  Table,
  Space,
  Typography,
  Pagination,
  Empty,
  Spin,
  theme,
} from 'antd';
import type { Activity } from '../../services/activities';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

type ActivitiesTableProps = {
  columns: ColumnsType<Activity>;
  activities: Activity[];
  isLoading: boolean;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  searchQuery: string;
  selectedRowKeys: React.Key[];
  onRowClick: (record: Activity) => void;
  onRowSelectionChange: (keys: React.Key[]) => void;
  onSelectAll: (selected: boolean, selectedRows: Activity[]) => void;
  onPaginationChange: (page: number, size: number) => void;
};

function ActivitiesTable(props: ActivitiesTableProps) {
  const {
    columns,
    activities,
    isLoading,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    searchQuery,
    selectedRowKeys,
    onRowClick,
    onRowSelectionChange,
    onSelectAll,
    onPaginationChange,
  } = props;
  const { token } = theme.useToken();

  const filteredCount = searchQuery
    ? activities.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.actor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.sourceService.toLowerCase().includes(searchQuery.toLowerCase())
      ).length
    : 0;

  return (
    <Card>
      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={activities}
          rowKey="id"
          pagination={false}
          rowSelection={{
            selectedRowKeys,
            onChange: onRowSelectionChange,
            onSelectAll: onSelectAll,
          }}
          onRow={(record) => ({
            onClick: () => onRowClick(record),
            style: { cursor: 'pointer' },
          })}
          locale={{
            emptyText: <Empty description="No activities found" />,
          }}
        />
      </Spin>

      {totalPages > 0 && (
        <Space
          style={{
            marginTop: token.sizeUnit * 4,
            width: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <Text type="secondary">
            Showing {pageIndex * pageSize + 1} -{' '}
            {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount}
            {searchQuery && ` (${filteredCount} filtered)`}
          </Text>
          <Pagination
            current={pageIndex + 1}
            total={totalCount}
            pageSize={pageSize}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `Total ${total} activities`}
            onChange={onPaginationChange}
            pageSizeOptions={['10', '20', '50', '100']}
          />
        </Space>
      )}
    </Card>
  );
}

export default ActivitiesTable;
