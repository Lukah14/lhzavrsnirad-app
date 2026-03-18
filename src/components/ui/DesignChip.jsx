import { memo } from 'react';

/**
 * Filter pill / chip. Selected state uses primary fill.
 */
const DesignChip = memo(function DesignChip({
  label,
  selected = false,
  onClick,
  className = '',
}) {
  return (
    <button
      type="button"
      className={`ds-chip ${selected ? 'ds-chip--selected' : ''} ${className}`.trim()}
      onClick={onClick}
    >
      {label}
    </button>
  );
});

export default DesignChip;
