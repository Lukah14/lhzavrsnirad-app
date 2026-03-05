import { memo, useCallback, useMemo } from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Single habit row
// ---------------------------------------------------------------------------

const HabitItem = memo(function HabitItem({ habit, onToggle }) {
  return (
    <div
      className="habit-item"
      role="checkbox"
      aria-checked={habit.done}
      tabIndex={0}
      onClick={() => onToggle(habit.id)}
      onKeyDown={(e) => e.key === 'Enter' && onToggle(habit.id)}
    >
      <div className={`habit-check ${habit.done ? 'done' : ''}`}>
        {habit.done && <IonIcon icon={checkmarkOutline} />}
      </div>
      <span className={`habit-title ${habit.done ? 'done' : ''}`}>{habit.title}</span>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   habits: import('../../models/dashboard').Habit[],
 *   onToggle: (id: string) => void,
 *   selectedDate: string
 * }} props
 */
const HabitTrackerCard = memo(function HabitTrackerCard({ habits, onToggle, selectedDate }) {
  const { t } = useTranslation();
  const history = useHistory();

  const completedCount = useMemo(
    () => habits.filter((h) => h.done).length,
    [habits]
  );

  const goHabits = () => history.push(`/habits?date=${selectedDate}`);

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h2 className="dash-card-title">{t('dashboard.habits.title')}</h2>
        <button className="dash-card-action" onClick={goHabits}>
          {t('common.viewAll')}
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="habit-empty">
          <p className="habit-empty-title">{t('dashboard.habits.noHabits')}</p>
          <p className="habit-empty-hint">{t('dashboard.habits.noHabitsHint')}</p>
          <button
            className="activity-btn-primary"
            style={{ width: '100%' }}
            onClick={goHabits}
          >
            {t('dashboard.habits.addHabit')}
          </button>
        </div>
      ) : (
        <>
          <div className="habit-list">
            {habits.map((habit) => (
              <HabitItem key={habit.id} habit={habit} onToggle={onToggle} />
            ))}
          </div>

          <div className="habit-footer">
            <span className="habit-progress-label">
              {t('dashboard.habits.completed', {
                done: completedCount,
                total: habits.length,
              })}
            </span>
            <button className="habit-add-btn" onClick={goHabits}>
              {t('dashboard.habits.addHabit')}
            </button>
          </div>
        </>
      )}
    </div>
  );
});

export default HabitTrackerCard;
