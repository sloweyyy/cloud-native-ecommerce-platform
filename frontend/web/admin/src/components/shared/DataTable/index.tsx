import React, { ReactNode } from 'react';
import { Table, TableProps, TableColumnsType } from 'antd';
import { theme } from 'antd';

interface DataTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns: TableColumnsType<T>;
  loading?: boolean;
  emptyState?: ReactNode;
  stickyHeader?: boolean;
}

/**
 * DataTable Component
 * 
 * Enhanced table following UX requirements:
 * - Sticky header
 * - Dense rows for efficiency
 * - Consistent styling
 * - Server-side pagination support
 * - Row selection support
 */
function DataTable<T extends Record<string, unknown>>({
  columns,
  loading = false,
  emptyState,
  stickyHeader = true,
  scroll,
  ...tableProps
}: DataTableProps<T>) {
  const { token } = theme.useToken();

  return (
    <Table<T>
      columns={columns}
      loading={loading}
      scroll={{
        x: 'max-content',
        y: stickyHeader ? 'calc(100vh - 400px)' : undefined,
        ...scroll,
      }}
      sticky={stickyHeader ? { offsetHeader: 0 } : undefined}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        pageSizeOptions: ['10', '20', '50', '100'],
        ...tableProps.pagination,
      }}
      rowClassName={() => 'data-table-row'}
      style={{
        background: token.colorBgContainer,
      }}
      {...tableProps}
    />
  );
}

// Memoize with proper generic type preservation
const MemoizedDataTable = React.memo(DataTable) as typeof DataTable;
export default MemoizedDataTable;

