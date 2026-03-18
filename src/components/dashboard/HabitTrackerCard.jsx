import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useHabitContext } from '../../context/HabitContext';
import { isHabitComplete } from '../../models/habits';
import DesignEmptyState from '../ui/DesignEmptyState';

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

/**
 * Compact Dashboard habit card — Figma pill-style layout.
 * @param {{ selectedDate: string }} props
 */
const HabitTrackerCard = memo(function HabitTrackerCard({ selectedDate }) {
  const { t }       = useTranslation();
  const history     = useHistory();
  const {
    habitsForDate,
    logForDate,
    summaryForDate,
    toggleHabit,
  } = useHabitContext();

  const habits = habitsForDate(selectedDate);
  const logs   = logForDate(selectedDate);
  const { done, total } = summaryForDate(selectedDate);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const goHabits = useCallback(() => {
    history.push(`/habits?date=${selectedDate}`);
  }, [history, selectedDate]);

  const handleToggle = useCallback((habitId) => {
    toggleHabit(habitId, selectedDate);
  }, [toggleHabit, selectedDate]);

  const visibleHabits = useMemo(() => habits.slice(0, 5), [habits]);

  return (
    <div className="dash-card" style={{ cursor: 'pointer' }} onClick={goHabits}>
      <div className="dash-card-header" style={{ pointerEvents: 'none' }}>
        <h2 className="dash-card-title">{t('habits.title')}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--dash-habit-accent)' }}>
            {done}/{total}
          </span>
          <span style={{ fontSize: 18, color: 'var(--dash-text-muted)' }}>›</span>
        </div>
      </div>

      {habits.length === 0 ? (
        <div style={{ pointerEvents: 'none' }}>
          <DesignEmptyState
            icon="⭐"
            title={t('dashboard.habits.noHabits')}
            hint={t('dashboard.habits.noHabitsHint')}
            ctaLabel={t('dashboard.habits.addHabit')}
            onCtaClick={(e) => { e.stopPropagation(); history.push('/habits'); }}
          />
        </div>
      ) : (
        <div style={{ padding: '4px 16px 16px', pointerEvents: 'none' }}>
          {/* Progress bar */}
          <div style={{
            height: 10, background: 'var(--dash-track-color)',
            borderRadius: 5, overflow: 'hidden', marginBottom: 12,
          }}>
            <div style={{
              width: `${pct}%`, height: '100%', borderRadius: 5,
              background: 'linear-gradient(90deg, var(--dash-habit-accent), #7C3AED)',
              transition: 'width 0.5s ease',
            }} />
          </div>

          {/* Habit pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {visibleHabits.map((habit) => {
              const isDone = isHabitComplete(habit, logs[habit.id] ?? null);
              return (
                <div
                  key={habit.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 20,
                    background: isDone ? 'var(--dash-text-primary)' : 'var(--dash-track-color)',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{ fontSize: 13 }}>{habit.icon || '⭐'}</span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: isDone ? 'var(--dash-card-bg)' : 'var(--dash-text-secondary)',
                  }}>
                    {habit.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
            {habits.length > 5 && (
              <div style={{
                display: 'flex', alignItems: 'center',
                padding: '6px 12px', borderRadius: 20,
                background: 'var(--dash-track-color)',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dash-text-secondary)' }}>
                  +{habits.length - 5}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default HabitTrackerCard;
