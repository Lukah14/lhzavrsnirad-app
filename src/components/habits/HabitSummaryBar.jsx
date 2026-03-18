import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHabitContext } from '../../context/HabitContext';

const R = 33;
const CIRCUM = 2 * Math.PI * R;

const HabitSummaryBar = memo(function HabitSummaryBar({ date }) {
  const { t } = useTranslation();
  const { summaryForDate, habitsForDate, habitStreak } = useHabitContext();

  const { done, total, pct } = summaryForDate(date);

  const scheduledHabits = habitsForDate(date);
  const bestStreak = scheduledHabits.reduce((max, h) => {
    const s = habitStreak(h);
    return s > max ? s : max;
  }, 0);

  const dashOffset = CIRCUM * (1 - pct / 100);

  return (
    <div className="habit-summary" aria-label="Habit progress summary">
      {/* Top row: count + ring */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--dash-text-secondary)', marginBottom: 2 }}>
            Today's progress
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--dash-text-primary)', lineHeight: 1 }}>
            {done}
            <span style={{ fontSize: 20, color: 'var(--dash-text-secondary)' }}>/{total}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--habit-accent)', fontWeight: 600, marginTop: 2 }}>
            habits completed
          </div>
          {bestStreak > 0 && (
            <div className="habit-summary__streak" style={{ marginTop: 8 }}>
              🔥 {t('habits.streak', { days: bestStreak })}
            </div>
          )}
        </div>

        {/* Ring SVG */}
        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
          <svg viewBox="0 0 80 80" width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="40" cy="40" r={R}
              fill="none"
              stroke="var(--habit-progress-track)"
              strokeWidth="7"
            />
            <circle
              cx="40" cy="40" r={R}
              fill="none"
              stroke="var(--habit-accent)"
              strokeWidth="7"
              strokeDasharray={CIRCUM}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--habit-accent)' }}>{pct}%</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="habit-summary__progress-track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% complete`}
      >
        <div
          className="habit-summary__progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
});

export default HabitSummaryBar;
