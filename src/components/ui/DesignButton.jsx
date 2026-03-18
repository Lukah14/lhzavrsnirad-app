import { memo } from 'react';

/**
 * Design system button. Variants: primary, secondary, ghost.
 */
const DesignButton = memo(function DesignButton({
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false,
  ...rest
}) {
  const baseClass = 'ds-btn';
  const variantClass = `ds-btn--${variant}`;
  const widthClass = fullWidth ? 'ds-btn--full' : '';

  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${widthClass} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
});

export default DesignButton;
