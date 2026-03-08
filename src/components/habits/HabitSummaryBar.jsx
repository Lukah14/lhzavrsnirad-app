import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHabitContext } from '../../context/HabitContext';

const HabitSummaryBar = memo(function HabitSummaryBar({ date }) {
  const { t } = useTranslation();
  const { summaryForDate, habitsForDate, habitStreak, habits } = useHabitContext();

  const { done, total, pct } = summaryForDate(date);

  // Compute the best (longest) streak across all active habits for the date
  const scheduledHabits = habitsForDate(date);
  const bestStreak = scheduledHabits.reduce((max, h) => {
    const s = habitStreak(h);
    return s > max ? s : max;
  }, 0);

  return (
    <div className="habit-summary" aria-label="Habit progress summary">
      <div className="habit-summary__top">
        <span className="habit-summary__text">
          {t('habits.completed', { done, total })}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {bestStreak > 0 && (
            <div className="habit-summary__streak" aria-label={`${bestStreak} day streak`}>
              🔥 {t('habits.streak', { days: bestStreak })}
            </div>
          )}
          <span className="habit-summary__pct">{pct}%</span>
        </div>
      </div>

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
