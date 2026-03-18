import { memo } from 'react';

/**
 * Section title with optional "View all" link.
 */
const DesignSectionHeader = memo(function DesignSectionHeader({
  title,
  action,
  onActionClick,
  className = '',
}) {
  return (
    <div className={`ds-section-header ${className}`.trim()}>
      <h2 className="ds-section-title">{title}</h2>
      {action && (
        <button
          type="button"
          className="ds-section-action"
          onClick={onActionClick}
        >
          {action}
        </button>
      )}
    </div>
  );
});

export default DesignSectionHeader;
