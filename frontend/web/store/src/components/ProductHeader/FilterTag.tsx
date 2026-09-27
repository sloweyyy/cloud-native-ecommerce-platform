import React from 'react';
import { Tag } from 'antd';

const { CheckableTag } = Tag;

type FilterTagProps = {
  label: string;
  checked: boolean;
  icon?: React.ReactNode;
  onChange: () => void;
};

function FilterTag(props: FilterTagProps) {
  const { label, checked, icon, onChange } = props;

  return (
    <CheckableTag
      checked={checked}
      onChange={onChange}
      style={{
        padding: '10px 20px',
        fontSize: '15px',
        fontWeight: checked ? 600 : 500,
        borderRadius: '8px',
        minHeight: '40px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
      }}
    >
      {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
      {label}
    </CheckableTag>
  );
}

export default React.memo(FilterTag);

