import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

// Quick workout presets
const PRESETS = [
  { key: 'walk', minutes: 30, kcal: 150 },
  { key: 'gym',  minutes: 60, kcal: 350 },
];

// Stat tile definitions for the Figma-style activity card
const STAT_ICONS = {
  burned:  { emoji: '🔥', color: '#FF9F43' },
  minutes: { emoji: '⏱',  color: '#34D399' },
  steps:   { emoji: '👟', color: '#5B9CF6' },
};

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

  const stats = [
    { key: 'burned',  value: burnedKcal,      unit: 'kcal',    label: 'Burned',  ...STAT_ICONS.burned },
    { key: 'minutes', value: workoutsMinutes,  unit: 'min',     label: 'Active',  ...STAT_ICONS.minutes },
    { key: 'steps',   value: '—',              unit: '',        label: 'Steps',   ...STAT_ICONS.steps },
  ];

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

      <div className="activity-stats-row">
        {stats.map((stat) => (
          <div key={stat.key} className="activity-stat-pill">
            <span style={{ fontSize: 20, display: 'block', marginBottom: 4 }}>{stat.emoji}</span>
            <span className="activity-stat-pill-value" style={{ color: stat.color }}>
              {stat.value}
              {stat.unit && (
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--dash-text-secondary)', marginLeft: 1 }}>
                  {stat.unit}
                </span>
              )}
            </span>
            <span className="activity-stat-pill-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Step-goal progress bar */}
      <div style={{ padding: '4px 16px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--dash-text-secondary)' }}>Step goal progress</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#34D399' }}>—</span>
        </div>
        <div style={{ height: 8, background: 'var(--dash-track-color)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4,
            background: 'linear-gradient(90deg, #34D399, #059669)',
            width: hasActivity ? '40%' : '0%',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

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
