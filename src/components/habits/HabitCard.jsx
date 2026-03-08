import { memo, useCallback, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkOutline } from 'ionicons/icons';
import { useHabitContext } from '../../context/HabitContext';
import { HABIT_TYPES, isHabitComplete } from '../../models/habits';
import { HABIT_CATEGORIES } from '../../models/habits';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCategoryIcon(categoryId) {
  const cat = HABIT_CATEGORIES.find((c) => c.id === categoryId);
  return cat?.icon ?? '⭐';
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// ---------------------------------------------------------------------------
// Numeric / Timer inline value editor
// ---------------------------------------------------------------------------

function ValueEditor({ habit, log, date }) {
  const { setHabitValue, incrementHabit } = useHabitContext();
  const current = log?.value ?? 0;
  const target  = habit.targetValue ?? 1;
  const pct     = clamp(Math.round((current / target) * 100), 0, 100);
  const unit    = habit.unit ?? '';

  const handleInc = useCallback((e) => {
    e.stopPropagation();
    incrementHabit(habit.id, date);
  }, [habit.id, date, incrementHabit]);

  return (
    <div className="habit-card__progress-wrap">
      <div className="habit-card__progress-row">
        <span className="habit-card__progress-label">
          {current} / {target} {unit}
        </span>
        <span className="habit-card__progress-label">{pct}%</span>
      </div>
      <div className="habit-card__progress-track">
        <div className="habit-card__progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main HabitCard
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   habit: object,
 *   date:  string,
 *   onOpenDetail: (habit: object) => void,
 * }} props
 */
const HabitCard = memo(function HabitCard({ habit, date, onOpenDetail }) {
  const { habitLogEntry, toggleHabit, incrementHabit, HABIT_TYPES: HT } = useHabitContext();
  const log      = habitLogEntry(habit.id, date);
  const done     = isHabitComplete(habit, log);
  const isBoolean = habit.type === HABIT_TYPES.BOOLEAN;

  const handleToggle = useCallback((e) => {
    e.stopPropagation();
    toggleHabit(habit.id, date);
  }, [habit.id, date, toggleHabit]);

  const handleInc = useCallback((e) => {
    e.stopPropagation();
    incrementHabit(habit.id, date);
  }, [habit.id, date, incrementHabit]);

  const handleCardClick = useCallback(() => {
    if (onOpenDetail) onOpenDetail(habit);
  }, [habit, onOpenDetail]);

  const hasProgress = habit.type === HABIT_TYPES.NUMERIC || habit.type === HABIT_TYPES.TIMER;

  return (
    <div
      className="habit-card"
      onClick={handleCardClick}
      role="listitem"
      aria-label={habit.name}
    >
      {/* Left: category icon */}
      <div className={`habit-card__icon-wrap${done ? ' habit-card__icon-wrap--done' : ''}`}>
        {habit.icon || getCategoryIcon(habit.category)}
      </div>

      {/* Middle: body */}
      <div className="habit-card__body">
        <p className={`habit-card__name${done ? ' habit-card__name--done' : ''}`}>
          {habit.name}
        </p>
        <div className="habit-card__meta">
          <span className="habit-card__category">{habit.category}</span>
          {habit.priority === 'high' && (
            <span className="habit-card__priority">High</span>
          )}
        </div>

        {hasProgress && (
          <ValueEditor habit={habit} log={log} date={date} />
        )}
      </div>

      {/* Right: action button */}
      <div className="habit-card__right" onClick={(e) => e.stopPropagation()}>
        {isBoolean ? (
          <button
            className={`habit-card__toggle${done ? ' habit-card__toggle--done' : ''}`}
            onClick={handleToggle}
            aria-label={done ? 'Mark undone' : 'Mark done'}
            aria-pressed={done}
          >
            {done && <IonIcon icon={checkmarkOutline} className="habit-card__toggle-icon" />}
          </button>
        ) : (
          <>
            <button
              className={`habit-card__toggle${done ? ' habit-card__toggle--done' : ''}`}
              onClick={handleToggle}
              aria-label={done ? 'Mark undone' : 'Mark done'}
              aria-pressed={done}
            >
              {done && <IonIcon icon={checkmarkOutline} className="habit-card__toggle-icon" />}
            </button>
            <button
              className="habit-card__inc-btn"
              onClick={handleInc}
              aria-label={`Add ${habit.step ?? 1} ${habit.unit ?? ''}`}
            >
              +{habit.step ?? 1}
            </button>
          </>
        )}
      </div>
    </div>
  );
});

export default HabitCard;
