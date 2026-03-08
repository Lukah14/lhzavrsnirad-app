import { memo } from 'react';
import { useHabitContext } from '../../context/HabitContext';
import { MOOD_EMOJIS } from '../../models/habits';
import { useTranslation } from 'react-i18next';

// Mood labels for screen-reader accessibility
const MOOD_LABELS = [
  'Terrible', 'Very sad', 'Sad', 'Slightly down', 'Neutral',
  'Okay', 'Good', 'Great', 'Excellent', 'Amazing',
];

const DailyMoodSection = memo(function DailyMoodSection() {
  const { t } = useTranslation();
  const { selectedDate, moodForDate, setMood } = useHabitContext();

  const mood      = moodForDate(selectedDate);
  const moodValue = mood?.value ?? null; // 1-10 or null

  const handleSelect = (score) => {
    // Toggle off if tapping the already-selected mood
    if (score === moodValue) return;
    setMood(selectedDate, score);
  };

  return (
    <div className="mood-section" aria-label="Daily mood check-in">
      <div className="mood-section__header">
        <span className="mood-section__title">{t('mood.title')}</span>
        {moodValue !== null && (
          <span className="mood-section__selected-label">
            {MOOD_EMOJIS[moodValue - 1]} {MOOD_LABELS[moodValue - 1]}
          </span>
        )}
      </div>

      <p className="mood-section__label">{t('mood.label')}</p>

      <div className="mood-row" role="group" aria-label="Mood scale 1 to 10">
        {MOOD_EMOJIS.map((emoji, i) => {
          const score     = i + 1;
          const isSelected = score === moodValue;
          return (
            <button
              key={score}
              className={`mood-btn${isSelected ? ' mood-btn--selected' : ''}`}
              onClick={() => handleSelect(score)}
              aria-label={`Mood ${score}: ${MOOD_LABELS[i]}`}
              aria-pressed={isSelected}
            >
              {emoji}
              <span className="mood-btn__score">{score}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default DailyMoodSection;
