import React, { useState, useMemo } from 'react';
import {
  Modal,
  Radio,
  Checkbox,
  Button,
  Space,
  Input,
  Typography,
  Divider,
  message,
  Spin,
} from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { Activity } from '../../services/activities';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

export type ExportFormat = 'csv' | 'excel' | 'json';

export type ExportScope = 'current' | 'all' | 'selected';

export interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  activities: Activity[];
  totalCount: number;
  selectedActivities?: Activity[];
  filters?: {
    entityType?: string;
    activityType?: string;
    dateRange?: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
    actor?: string;
  };
}

interface ColumnOption {
  key: string;
  label: string;
  defaultChecked: boolean;
}

const COLUMN_OPTIONS: ColumnOption[] = [
  { key: 'id', label: 'ID', defaultChecked: true },
  { key: 'entityType', label: 'Type', defaultChecked: true },
  { key: 'title', label: 'Activity', defaultChecked: true },
  { key: 'description', label: 'Description', defaultChecked: true },
  { key: 'entityId', label: 'Entity ID', defaultChecked: true },
  { key: 'activityType', label: 'Activity Type', defaultChecked: true },
  { key: 'actor', label: 'Actor', defaultChecked: true },
  { key: 'sourceService', label: 'Source Service', defaultChecked: true },
  { key: 'occurredAt', label: 'Occurred At', defaultChecked: true },
  { key: 'timeAgo', label: 'Time Ago', defaultChecked: false },
  { key: 'createdDate', label: 'Created Date', defaultChecked: false },
];

/**
 * Export Modal Component
 *
 * Allows users to export activities in various formats (CSV, Excel, JSON)
 * with customizable options for scope, columns, and formatting.
 */
function ExportModal({
  open,
  onClose,
  activities,
  totalCount,
  selectedActivities = [],
  filters,
}: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [exportScope, setExportScope] = useState<ExportScope>('current');
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(
      COLUMN_OPTIONS.filter((col) => col.defaultChecked).map((col) => col.key)
    )
  );
  const [includeDescriptions, setIncludeDescriptions] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [customFilename, setCustomFilename] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Determine activities to export
  const activitiesToExport = useMemo(() => {
    switch (exportScope) {
      case 'selected':
        return selectedActivities;
      case 'all':
        // Note: This would require fetching all activities from API
        // For now, we'll export current activities
        return activities;
      case 'current':
      default:
        return activities;
    }
  }, [exportScope, activities, selectedActivities]);

  // Generate filename
  const filename = useMemo(() => {
    if (customFilename) {
      return customFilename;
    }
    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    const formatExt = exportFormat === 'excel' ? 'xlsx' : exportFormat;
    return `activities_${timestamp}.${formatExt}`;
  }, [customFilename, exportFormat]);

  // Prepare data for export
  const prepareExportData = () => {
    return activitiesToExport.map((activity) => {
      const row: Record<string, any> = {};

      if (selectedColumns.has('id')) row['ID'] = activity.id;
      if (selectedColumns.has('entityType')) row['Type'] = activity.entityType;
      if (selectedColumns.has('title')) row['Activity'] = activity.title;
      if (selectedColumns.has('description') && includeDescriptions) {
        row['Description'] = activity.description || '';
      }
      if (selectedColumns.has('entityId')) row['Entity ID'] = activity.entityId;
      if (selectedColumns.has('activityType'))
        row['Activity Type'] = activity.activityType;
      if (selectedColumns.has('actor'))
        row['Actor'] = activity.actor || 'system';
      if (selectedColumns.has('sourceService'))
        row['Source Service'] = activity.sourceService;
      if (selectedColumns.has('occurredAt')) {
        row['Occurred At'] = dayjs(activity.occurredAt).format(
          'YYYY-MM-DD HH:mm:ss'
        );
      }
      if (selectedColumns.has('timeAgo')) {
        row['Time Ago'] =
          activity.timeAgo || dayjs(activity.occurredAt).fromNow();
      }
      if (selectedColumns.has('createdDate') && activity.createdDate) {
        row['Created Date'] = dayjs(activity.createdDate).format(
          'YYYY-MM-DD HH:mm:ss'
        );
      }

      if (includeMetadata) {
        row['Metadata'] = JSON.stringify({
          entityType: activity.entityType,
          activityType: activity.activityType,
        });
      }

      return row;
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      const data = prepareExportData();
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success(`Exported ${data.length} activities to CSV`);
    } catch (error) {
      console.error('CSV export error:', error);
      message.error('Failed to export CSV. Please try again.');
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const data = prepareExportData();
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Activities');

      // Set column widths
      const colWidths = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, filename);
      message.success(`Exported ${data.length} activities to Excel`);
    } catch (error) {
      console.error('Excel export error:', error);
      message.error('Failed to export Excel. Please try again.');
    }
  };

  // Export to JSON
  const exportToJSON = () => {
    try {
      const jsonData = {
        exportedAt: dayjs().toISOString(),
        filters: filters
          ? {
              entityType: filters.entityType,
              activityType: filters.activityType,
              actor: filters.actor,
              dateRange: filters.dateRange
                ? {
                    from: filters.dateRange[0]?.toISOString(),
                    to: filters.dateRange[1]?.toISOString(),
                  }
                : null,
            }
          : null,
        totalCount: activitiesToExport.length,
        activities: activitiesToExport,
      };

      const json = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success(
        `Exported ${activitiesToExport.length} activities to JSON`
      );
    } catch (error) {
      console.error('JSON export error:', error);
      message.error('Failed to export JSON. Please try again.');
    }
  };

  // Handle export
  const handleExport = async () => {
    if (activitiesToExport.length === 0) {
      message.warning('No activities to export');
      return;
    }

    if (selectedColumns.size === 0) {
      message.warning('Please select at least one column to export');
      return;
    }

    setIsExporting(true);

    try {
      switch (exportFormat) {
        case 'csv':
          exportToCSV();
          break;
        case 'excel':
          exportToExcel();
          break;
        case 'json':
          exportToJSON();
          break;
      }

      // Close modal after successful export
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (error) {
      setIsExporting(false);
      console.error('Export error:', error);
      message.error('Failed to export. Please try again.');
    }
  };

  // Handle column toggle
  const handleColumnToggle = (key: string) => {
    const newSelected = new Set(selectedColumns);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedColumns(newSelected);
  };

  // Select all / deselect all columns
  const handleSelectAllColumns = (checked: boolean) => {
    if (checked) {
      setSelectedColumns(new Set(COLUMN_OPTIONS.map((col) => col.key)));
    } else {
      setSelectedColumns(new Set());
    }
  };

  const exportCount = activitiesToExport.length;
  const hasSelectedActivities = selectedActivities.length > 0;

  return (
    <Modal
      title={
        <Space>
          <DownloadOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Export Activities
          </Title>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>,
        <Button
          key="export"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
          loading={isExporting}
          disabled={exportCount === 0 || selectedColumns.size === 0}
        >
          Export ({exportCount} activities)
        </Button>,
      ]}
      width={600}
    >
      <Spin spinning={isExporting}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Export Scope */}
          <div>
            <Text strong>Export Scope:</Text>
            <Radio.Group
              value={exportScope}
              onChange={(e) => setExportScope(e.target.value)}
              style={{ marginTop: 8, display: 'block' }}
            >
              <Radio value="current">
                Current View ({activities.length} activities)
              </Radio>
              <Radio value="all" disabled>
                All Activities ({totalCount} activities)
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  (Requires API enhancement)
                </Text>
              </Radio>
              {hasSelectedActivities && (
                <Radio value="selected">
                  Selected Activities ({selectedActivities.length} activities)
                </Radio>
              )}
            </Radio.Group>
          </div>

          <Divider />

          {/* Export Format */}
          <div>
            <Text strong>Format:</Text>
            <Space style={{ marginTop: 8, display: 'block' }}>
              <Radio.Group
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <Radio.Button value="csv">
                  <FileTextOutlined /> CSV
                </Radio.Button>
                <Radio.Button value="excel">
                  <FileExcelOutlined /> Excel
                </Radio.Button>
                <Radio.Button value="json">
                  <CodeOutlined /> JSON
                </Radio.Button>
              </Radio.Group>
            </Space>
          </div>

          <Divider />

          {/* Column Selection */}
          <div>
            <Space
              style={{
                marginBottom: 8,
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              <Text strong>Columns to Export:</Text>
              <Checkbox
                checked={selectedColumns.size === COLUMN_OPTIONS.length}
                indeterminate={
                  selectedColumns.size > 0 &&
                  selectedColumns.size < COLUMN_OPTIONS.length
                }
                onChange={(e) => handleSelectAllColumns(e.target.checked)}
              >
                Select All
              </Checkbox>
            </Space>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8,
              }}
            >
              {COLUMN_OPTIONS.map((column) => (
                <Checkbox
                  key={column.key}
                  checked={selectedColumns.has(column.key)}
                  onChange={() => handleColumnToggle(column.key)}
                >
                  {column.label}
                </Checkbox>
              ))}
            </div>
          </div>

          <Divider />

          {/* Options */}
          <div>
            <Text strong>Options:</Text>
            <Space
              direction="vertical"
              style={{ marginTop: 8, display: 'block' }}
            >
              <Checkbox
                checked={includeDescriptions}
                onChange={(e) => setIncludeDescriptions(e.target.checked)}
              >
                Include descriptions
              </Checkbox>
              <Checkbox
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
              >
                Include metadata
              </Checkbox>
            </Space>
          </div>

          <Divider />

          {/* Filename */}
          <div>
            <Text strong>File Name:</Text>
            <Input
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder={filename}
              style={{ marginTop: 8 }}
              suffix={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  .{exportFormat === 'excel' ? 'xlsx' : exportFormat}
                </Text>
              }
            />
            <Text
              type="secondary"
              style={{ fontSize: 12, display: 'block', marginTop: 4 }}
            >
              Leave empty to use auto-generated filename
            </Text>
          </div>
        </Space>
      </Spin>
    </Modal>
  );
}

export default ExportModal;
