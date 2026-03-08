import { memo, useCallback, useMemo } from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useHabitContext } from '../../context/HabitContext';
import { isHabitComplete } from '../../models/habits';
import '../../components/habits/habits.css';

// ---------------------------------------------------------------------------
// Single compact habit row (Dashboard only)
// ---------------------------------------------------------------------------

const HabitItem = memo(function HabitItem({ habit, log, onToggle }) {
  const done = isHabitComplete(habit, log);

  const displayValue = (() => {
    if (habit.type === 'boolean') return null;
    const val = log?.value ?? 0;
    const target = habit.targetValue ?? 1;
    const unit = habit.unit ?? '';
    return `${val}/${target}${unit}`;
  })();

  return (
    <div
      className="htcard-item"
      role="checkbox"
      aria-checked={done}
      tabIndex={0}
      onClick={() => onToggle(habit.id)}
      onKeyDown={(e) => e.key === 'Enter' && onToggle(habit.id)}
    >
      <span className="htcard-item__icon" aria-hidden="true">
        {habit.icon || '⭐'}
      </span>
      <span className={`htcard-item__name${done ? ' htcard-item__name--done' : ''}`}>
        {habit.name}
      </span>
      {displayValue && (
        <span className="htcard-item__value">{displayValue}</span>
      )}
      <div className={`htcard-item__check${done ? ' htcard-item__check--done' : ''}`}>
        {done && <IonIcon icon={checkmarkOutline} style={{ fontSize: 14, color: 'var(--habit-done-border)' }} />}
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

/**
 * Compact Dashboard habit card.
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

  const goHabits = useCallback(() => {
    history.push(`/habits?date=${selectedDate}`);
  }, [history, selectedDate]);

  const handleToggle = useCallback((habitId) => {
    toggleHabit(habitId, selectedDate);
  }, [toggleHabit, selectedDate]);

  // Limit to 5 habits in the Dashboard card to keep it compact
  const visibleHabits = useMemo(() => habits.slice(0, 5), [habits]);

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h2 className="dash-card-title">{t('habits.title')}</h2>
        <button className="dash-card-action" onClick={goHabits}>
          {t('common.viewAll')}
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="habit-empty">
          <p className="habit-empty-title">{t('habits.noHabits')}</p>
          <p className="habit-empty-hint">{t('habits.noHabitsHint')}</p>
          <button
            className="activity-btn-primary"
            style={{ width: '100%', marginTop: 12 }}
            onClick={goHabits}
          >
            {t('habits.addHabit')}
          </button>
        </div>
      ) : (
        <>
          {/* Compact progress line */}
          <div
            style={{
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'space-between',
              marginBottom:    10,
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--dash-text-secondary)', fontWeight: 600 }}>
              {t('habits.completed', { done, total })}
            </span>
            <div
              style={{
                width:         100,
                height:        5,
                borderRadius:  3,
                background:    'var(--habit-progress-track)',
                overflow:      'hidden',
              }}
            >
              <div
                style={{
                  width:       `${total > 0 ? Math.round((done / total) * 100) : 0}%`,
                  height:      '100%',
                  borderRadius: 3,
                  background:  'var(--habit-accent)',
                  transition:  'width 0.35s ease',
                }}
              />
            </div>
          </div>

          {/* Habit list */}
          <div role="list">
            {visibleHabits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                log={logs[habit.id] ?? null}
                onToggle={handleToggle}
              />
            ))}
            {habits.length > 5 && (
              <button
                onClick={goHabits}
                style={{
                  width:      '100%',
                  marginTop:  8,
                  padding:    '8px 0',
                  background: 'transparent',
                  border:     'none',
                  color:      'var(--dash-text-secondary)',
                  fontSize:   13,
                  cursor:     'pointer',
                  fontWeight: 600,
                }}
              >
                +{habits.length - 5} more
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="habit-footer" style={{ marginTop: 12 }}>
            <button className="habit-add-btn" onClick={goHabits}>
              {t('habits.addHabit')}
            </button>
          </div>
        </>
      )}
    </div>
  );
});

export default HabitTrackerCard;
