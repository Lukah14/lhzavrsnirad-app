import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { calcRemaining, calcRatio } from '../../models/dashboard';

// ---------------------------------------------------------------------------
// SVG horseshoe ring (270° arc, gap at bottom) — no chart library
// ---------------------------------------------------------------------------

/**
 * Horseshoe arc gauge. Progress fills clockwise from bottom-left to bottom-right.
 * @param {{ value: number, goal: number, size?: number, strokeWidth?: number }} props
 */
const HorseshoeRing = memo(function HorseshoeRing({
  value,
  goal,
  size = 160,
  strokeWidth = 13,
}) {
  const cx = size / 2;
  const cy = size / 2;
  const R = cx - strokeWidth / 2 - 2;

  const circumference = 2 * Math.PI * R;
  // 270° visible arc, 90° gap centered at bottom
  const arcLength  = circumference * (270 / 360);
  const gapLength  = circumference * (90 / 360);

  const ratio = calcRatio(value, goal);
  const progressLength = arcLength * ratio;

  // The circle default-starts at 3 o'clock (right).
  // rotate(135) places that start point at 7:30 (bottom-left edge of gap).
  const rotation = `rotate(135 ${cx} ${cy})`;

  // Color: accent while under goal, warning red when over
  const progressColor = ratio >= 1 ? 'var(--dash-protein-color)' : 'var(--dash-accent)';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Background track */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke="var(--dash-track-color)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${gapLength}`}
        transform={rotation}
      />
      {/* Progress fill */}
      {progressLength > 0 && (
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progressLength} ${circumference - progressLength}`}
          transform={rotation}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      )}
    </svg>
  );
});

// ---------------------------------------------------------------------------
// Small macro progress bar row
// ---------------------------------------------------------------------------

const MacroBarRow = memo(function MacroBarRow({ label, value, goal, colorClass }) {
  const ratio = calcRatio(value, goal);
  return (
    <div className="macro-bar-row">
      <span className="macro-bar-label">{label}</span>
      <div className="macro-bar-track" role="progressbar" aria-valuenow={value} aria-valuemax={goal}>
        <div
          className={`macro-bar-fill ${colorClass}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="macro-bar-grams">
        {Math.round(value)} / {Math.round(goal)} g
      </span>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Main card
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   goals: import('../../models/dashboard').Goals,
 *   totals: import('../../models/dashboard').Totals
 * }} props
 */
const NutritionSummaryCard = memo(function NutritionSummaryCard({ goals, totals }) {
  const { t } = useTranslation();
  const history = useHistory();

  const remaining = useMemo(() => calcRemaining(goals, totals), [goals, totals]);

  const handleDetails = () => {
    history.push('/nutrition');
  };

  return (
    <div className="dash-card">
      {/* Card header */}
      <div className="dash-card-header">
        <h2 className="dash-card-title">{t('dashboard.summary.title')}</h2>
        <button className="dash-card-action" onClick={handleDetails}>
          {t('dashboard.summary.details')}
        </button>
      </div>

      <div className="nutrition-summary-card">
        {/* Calorie ring row: Eaten | Horseshoe | Burned */}
        <div className="calorie-ring-row">
          {/* Eaten */}
          <div className="calorie-stat-block">
            <span className="calorie-stat-value">{Math.round(totals.consumedKcal)}</span>
            <span className="calorie-stat-label">{t('dashboard.summary.eaten')}</span>
          </div>

          {/* Ring with center overlay */}
          <div className="calorie-ring-wrapper">
            <HorseshoeRing value={totals.consumedKcal} goal={goals.caloriesGoal} />
            <div className="calorie-ring-center">
              <span className="calorie-remaining-number">
                {Math.max(0, Math.round(remaining)).toLocaleString()}
              </span>
              <span className="calorie-remaining-label">{t('dashboard.summary.remaining')}</span>
            </div>
          </div>

          {/* Burned */}
          <div className="calorie-stat-block">
            <span className="calorie-stat-value">{Math.round(totals.burnedKcal)}</span>
            <span className="calorie-stat-label">{t('dashboard.summary.burned')}</span>
          </div>
        </div>

        {/* Macro progress bars */}
        <div className="macro-bars-section">
          <MacroBarRow
            label={t('dashboard.macros.protein')}
            value={totals.proteinG}
            goal={goals.proteinGoal}
            colorClass="protein"
          />
          <MacroBarRow
            label={t('dashboard.macros.carbs')}
            value={totals.carbsG}
            goal={goals.carbsGoal}
            colorClass="carbs"
          />
          <MacroBarRow
            label={t('dashboard.macros.fat')}
            value={totals.fatG}
            goal={goals.fatGoal}
            colorClass="fat"
          />
        </div>
      </div>
    </div>
  );
});

export default NutritionSummaryCard;
