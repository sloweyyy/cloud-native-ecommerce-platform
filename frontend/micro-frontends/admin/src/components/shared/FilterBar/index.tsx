import React, { ReactNode } from 'react';
import { Space, Button, theme } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface FilterBarProps {
  chips?: FilterChip[];
  onClearAll?: () => void;
  extra?: ReactNode;
}

/**
 * FilterBar Component
 * 
 * Displays active filter chips with clear functionality.
 * Follows UX requirement: Filter chips with clear reset
 */
function FilterBar({ chips = [], onClearAll, extra }: FilterBarProps) {
  const { token } = theme.useToken();

  if (chips.length === 0 && !extra) {
    return null;
  }

  return (
    <Space
      wrap
      size="small"
      style={{
        padding: `${token.sizeUnit * 3}px ${token.sizeUnit * 4}px`,
        background: token.colorFillTertiary,
        borderRadius: token.borderRadius,
        width: '100%',
      }}
    >
      {chips.map((chip) => (
        <Button
          key={chip.key}
          size="small"
          icon={<CloseOutlined />}
          onClick={chip.onRemove}
          style={{
            borderRadius: token.borderRadiusSM,
          }}
        >
          {chip.label}
        </Button>
      ))}
      {chips.length > 0 && onClearAll && (
        <Button
          type="link"
          size="small"
          onClick={onClearAll}
          style={{
            padding: 0,
            height: 'auto',
          }}
        >
          Clear all
        </Button>
      )}
      {extra}
    </Space>
  );
}

export default React.memo(FilterBar);

