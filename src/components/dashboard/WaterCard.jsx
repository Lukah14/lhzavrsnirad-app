import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { calcRatio } from '../../models/dashboard';

const QUICK_AMOUNTS = [250, 500, 750];

/**
 * @param {{
 *   waterMl: number,
 *   waterMlGoal: number,
 *   onAdd: (ml: number) => void
 * }} props
 */
const WaterCard = memo(function WaterCard({ waterMl, waterMlGoal, onAdd }) {
  const { t } = useTranslation();

  const ratio = calcRatio(waterMl, waterMlGoal);
  const currentL = (waterMl / 1000).toFixed(1);
  const goalL    = (waterMlGoal / 1000).toFixed(1);

  const handleAdd = useCallback(
    (ml) => {
      onAdd(ml);
    },
    [onAdd]
  );

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>💧</span>
          <h2 className="dash-card-title">{t('dashboard.water.title')}</h2>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--dash-water-color)' }}>
          {currentL}L / {goalL}L
        </span>
      </div>

      <div className="water-content">
        {/* Progress bar */}
        <div
          className="water-track"
          role="progressbar"
          aria-valuenow={waterMl}
          aria-valuemax={waterMlGoal}
          style={{ marginBottom: 16 }}
        >
          <div
            className="water-track-fill"
            style={{ width: `${ratio * 100}%` }}
          />
        </div>

        {/* Quick add buttons */}
        <div className="water-quick-btns">
          {QUICK_AMOUNTS.map((ml) => (
            <button
              key={ml}
              className="water-quick-btn"
              onClick={() => handleAdd(ml)}
              aria-label={`Add ${ml} ml water`}
            >
              +{ml}ml
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default WaterCard;
