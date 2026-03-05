import { memo, useCallback } from 'react';
import { IonIcon } from '@ionic/react';
import { barbellOutline, walkOutline, fitnessOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

// Quick workout presets
const PRESETS = [
  { key: 'walk', minutes: 30, kcal: 150 },
  { key: 'gym',  minutes: 60, kcal: 350 },
];

/**
 * @param {{
 *   totals: import('../../models/dashboard').Totals,
 *   selectedDate: string
 * }} props
 */
const ActivityCard = memo(function ActivityCard({ totals, selectedDate }) {
  const { t } = useTranslation();
  const history = useHistory();
  const { addQuickWorkout } = useAppContext();

  const { workoutsCount, workoutsMinutes, burnedKcal } = totals;
  const hasActivity = workoutsCount > 0;

  const goAddWorkout = useCallback(() => {
    history.push(`/activity/add?date=${selectedDate}`);
  }, [history, selectedDate]);

  const handlePreset = useCallback(
    (preset) => {
      addQuickWorkout({ minutes: preset.minutes, kcal: preset.kcal }, selectedDate);
    },
    [addQuickWorkout, selectedDate]
  );

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h2 className="dash-card-title">{t('dashboard.activity.title')}</h2>
        <button
          className="dash-card-action"
          onClick={() => history.push(`/activity?date=${selectedDate}`)}
        >
          {t('dashboard.activity.more')}
        </button>
      </div>

      {hasActivity ? (
        <div className="activity-stats-row">
          {/* Workouts */}
          <div className="activity-stat-pill">
            <span className="activity-stat-pill-value">{workoutsCount}</span>
            <span className="activity-stat-pill-label">
              {t('dashboard.activity.workoutCount_one', { count: workoutsCount })}
            </span>
          </div>

          {/* Duration */}
          <div className="activity-stat-pill">
            <span className="activity-stat-pill-value">{workoutsMinutes}</span>
            <span className="activity-stat-pill-label">{t('common.min')}</span>
          </div>

          {/* Burned */}
          <div className="activity-stat-pill">
            <span className="activity-stat-pill-value" style={{ color: 'var(--dash-carbs-color)' }}>
              {burnedKcal}
            </span>
            <span className="activity-stat-pill-label">{t('common.kcal')}</span>
          </div>
        </div>
      ) : (
        <div className="activity-empty">
          <p className="activity-empty-title">{t('dashboard.activity.noActivity')}</p>
          <p className="activity-empty-hint">{t('dashboard.activity.noActivityHint')}</p>
        </div>
      )}

      {/* Actions */}
      <div className="activity-actions">
        <button className="activity-btn-primary" onClick={goAddWorkout}>
          {t('dashboard.activity.addWorkout')}
        </button>
        <button className="activity-btn-preset" onClick={() => handlePreset(PRESETS[0])}>
          {t('dashboard.activity.presetWalk')}
        </button>
        <button className="activity-btn-preset" onClick={() => handlePreset(PRESETS[1])}>
          {t('dashboard.activity.presetGym')}
        </button>
      </div>
    </div>
  );
});

export default ActivityCard;
