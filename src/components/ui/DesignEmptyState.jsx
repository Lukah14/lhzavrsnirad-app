import { memo } from 'react';
import DesignButton from './DesignButton';

/**
 * Empty state: icon, title, hint, optional CTA.
 */
const DesignEmptyState = memo(function DesignEmptyState({
  icon = '📭',
  title,
  hint,
  ctaLabel,
  onCtaClick,
  className = '',
}) {
  return (
    <div className={`ds-empty-state ${className}`.trim()}>
      <div className="ds-empty-state-icon">{icon}</div>
      {title && <p className="ds-empty-state-title">{title}</p>}
      {hint && <p className="ds-empty-state-hint">{hint}</p>}
      {ctaLabel && onCtaClick && (
        <DesignButton
          variant="primary"
          onClick={onCtaClick}
          className="ds-empty-state-cta"
        >
          {ctaLabel}
        </DesignButton>
      )}
    </div>
  );
});

export default DesignEmptyState;
