import { memo } from 'react';
import { calcRatio } from '../../models/dashboard';

// ---------------------------------------------------------------------------
// SVG horseshoe ring (same math as NutritionSummaryCard, smaller)
// ---------------------------------------------------------------------------

/**
 * @param {{ consumed: number, goal: number, color: string }} props
 */
const MiniHorseshoe = memo(function MiniHorseshoe({ consumed, goal, color }) {
  const size        = 56;
  const cx          = 28;
  const cy          = 28;
  const strokeWidth = 5;
  const R           = cx - strokeWidth / 2 - 1;

  const circumference  = 2 * Math.PI * R;
  const arcLength      = circumference * (270 / 360);
  const gapLength      = circumference * (90 / 360);
  const ratio          = calcRatio(consumed, goal);
  const progressLength = arcLength * ratio;
  const rotation       = `rotate(135 ${cx} ${cy})`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Track */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke="var(--dash-track-color)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${gapLength}`}
        transform={rotation}
      />
      {/* Progress */}
      {progressLength > 0 && (
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progressLength} ${circumference - progressLength}`}
          transform={rotation}
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      )}
    </svg>
  );
});

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   label: string,
 *   remaining: number,
 *   consumed: number,
 *   goal: number,
 *   color: string,
 *   icon: string
 * }} props
 */
const MacroMiniCard = memo(function MacroMiniCard({
  label,
  remaining,
  consumed,
  goal,
  color,
  icon,
}) {
  return (
    <div className="macro-mini-card">
      <span className="macro-mini-value">{Math.round(Math.max(0, remaining))}g</span>
      <span className="macro-mini-label">{label}</span>
      <div className="macro-mini-ring-wrap">
        <MiniHorseshoe consumed={consumed} goal={goal} color={color} />
        <span className="macro-mini-icon" aria-hidden="true">{icon}</span>
      </div>
    </div>
  );
});

export default MacroMiniCard;
