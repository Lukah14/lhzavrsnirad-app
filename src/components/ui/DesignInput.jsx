import { memo } from 'react';

/**
 * Search/input with optional leading icon.
 */
const DesignInput = memo(function DesignInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
  className = '',
  ...rest
}) {
  return (
    <div className={`ds-input-wrap ${className}`.trim()}>
      {icon && <span className="ds-input-icon">{icon}</span>}
      <input
        type={type}
        className="ds-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...rest}
      />
    </div>
  );
});

export default DesignInput;
