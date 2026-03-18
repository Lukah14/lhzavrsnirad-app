import { memo } from 'react';

/**
 * Reusable card with optional header and action.
 * Uses design system tokens.
 */
const DesignCard = memo(function DesignCard({
  title,
  action,
  onActionClick,
  children,
  className = '',
  padding = true,
  onClick,
}) {
  return (
    <div
      className={`ds-card ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {(title || action) && (
        <div className="ds-card-header">
          {title && <h2 className="ds-card-title">{title}</h2>}
          {action && (
            <button
              type="button"
              className="ds-card-action"
              onClick={(e) => {
                e.stopPropagation();
                onActionClick?.(e);
              }}
            >
              {action}
            </button>
          )}
        </div>
      )}
      <div className={padding ? 'ds-card-body' : ''}>{children}</div>
    </div>
  );
});

export default DesignCard;
