import { memo } from 'react';

/**
 * Shimmer skeleton block for loading states.
 */
const DesignSkeleton = memo(function DesignSkeleton({
  width,
  height = 12,
  borderRadius = 8,
  className = '',
}) {
  return (
    <div
      className={`ds-skeleton ${className}`.trim()}
      style={{
        width: width ?? '100%',
        height,
        borderRadius,
      }}
    />
  );
});

export default DesignSkeleton;
