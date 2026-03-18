import { memo } from 'react';

/**
 * SVG progress ring. Value 0–100. Optional center content.
 */
const DesignProgressRing = memo(function DesignProgressRing({
  value = 0,
  size = 80,
  strokeWidth = 8,
  color = 'var(--ds-primary)',
  trackColor = 'var(--ds-track)',
  children,
  className = '',
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const r = (size - strokeWidth) / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className={`ds-progress-ring ${className}`.trim()} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {clamped > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        )}
      </svg>
      {children && (
        <div className="ds-progress-ring-center">
          {children}
        </div>
      )}
    </div>
  );
});

export default DesignProgressRing;
