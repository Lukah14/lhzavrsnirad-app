import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { calcRemaining, calcRatio } from '../../models/dashboard';
import MacroMiniCard from './MacroMiniCard';

// ---------------------------------------------------------------------------
// Full-circle ring (Cal AI style — right side of calorie card)
// ---------------------------------------------------------------------------

/**
 * Thin full-circle progress ring. Starts at 12 o'clock, fills CW.
 * @param {{ consumed: number, goal: number, size?: number, strokeWidth?: number }} props
 */
const CalorieCircle = memo(function CalorieCircle({
  consumed,
  goal,
  size = 110,
  strokeWidth = 9,
}) {
  const cx           = size / 2;
  const cy           = size / 2;
  const R            = cx - strokeWidth / 2 - 2;
  const circumference = 2 * Math.PI * R;
  const ratio         = calcRatio(consumed, goal);
  const progressLen   = circumference * ratio;

  // rotate(-90) so arc starts at 12 o'clock
  const rotation = `rotate(-90 ${cx} ${cy})`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Background track — full circle */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke="var(--dash-track-color)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      {progressLen > 0 && (
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke="var(--dash-text-primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progressLen} ${circumference - progressLen}`}
          transform={rotation}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      )}
    </svg>
  );
});

// ---------------------------------------------------------------------------
// Main card — same props as before, completely new layout
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   goals: import('../../models/dashboard').Goals,
 *   totals: import('../../models/dashboard').Totals
 * }} props
 */
const NutritionSummaryCard = memo(function NutritionSummaryCard({ goals, totals }) {
  const { t } = useTranslation();

  const remaining = useMemo(() => calcRemaining(goals, totals), [goals, totals]);

  const macros = useMemo(() => [
    {
      key:       'protein',
      label:     t('dashboard.macros.protein') + ' left',
      remaining: goals.proteinGoal - totals.proteinG,
      consumed:  totals.proteinG,
      goal:      goals.proteinGoal,
      color:     'var(--dash-protein-color)',
      icon:      '🥩',
    },
    {
      key:       'carbs',
      label:     t('dashboard.macros.carbs') + ' left',
      remaining: goals.carbsGoal - totals.carbsG,
      consumed:  totals.carbsG,
      goal:      goals.carbsGoal,
      color:     'var(--dash-carbs-color)',
      icon:      '🌾',
    },
    {
      key:       'fat',
      label:     t('dashboard.macros.fat') + ' left',
      remaining: goals.fatGoal - totals.fatG,
      consumed:  totals.fatG,
      goal:      goals.fatGoal,
      color:     'var(--dash-fat-color)',
      icon:      '🫐',
    },
  ], [t, goals, totals]);

  return (
    <>
      {/* ── Calorie hero card ── */}
      <div className="calorie-hero-card">
        <div className="calorie-hero-left">
          <div className="calorie-hero-number">
            {Math.max(0, Math.round(remaining)).toLocaleString()}
          </div>
          <div className="calorie-hero-label">
            {t('dashboard.summary.caloriesLeft')}
          </div>
        </div>

        <div className="calorie-circle-wrap">
          <CalorieCircle
            consumed={totals.consumedKcal}
            goal={goals.caloriesGoal}
          />
          <span className="calorie-circle-icon" aria-hidden="true">🔥</span>
        </div>
      </div>

      {/* ── Macro mini cards ── */}
      <div className="macro-cards-row">
        {macros.map((m) => (
          <MacroMiniCard
            key={m.key}
            label={m.label}
            remaining={m.remaining}
            consumed={m.consumed}
            goal={m.goal}
            color={m.color}
            icon={m.icon}
          />
        ))}
      </div>
    </>
  );
});

export default NutritionSummaryCard;
