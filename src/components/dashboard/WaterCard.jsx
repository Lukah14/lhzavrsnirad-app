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
  const currentL = (waterMl / 1000).toFixed(2);
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
        <h2 className="dash-card-title">{t('dashboard.water.title')}</h2>
        <span className="dash-card-action" style={{ cursor: 'default', color: 'var(--dash-text-secondary)' }}>
          {t('dashboard.water.goalLabel', { value: goalL })}
        </span>
      </div>

      <div className="water-content">
        {/* Amount display */}
        <div className="water-amount-row">
          <span className="water-current">
            {currentL}
            <sup>{t('common.l')}</sup>
          </span>
          {waterMl === 0 && (
            <span className="water-goal-label">{t('dashboard.water.noWater')}</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="water-track" role="progressbar" aria-valuenow={waterMl} aria-valuemax={waterMlGoal}>
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
              {t(`dashboard.water.add${ml}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default WaterCard;
