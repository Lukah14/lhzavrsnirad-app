import { memo, useMemo } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronForwardOutline, trendingDownOutline, trendingUpOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Inline SVG sparkline — no chart library
// ---------------------------------------------------------------------------

const Sparkline = memo(function Sparkline({ points, width = 80, height = 36 }) {
  if (!points || points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const pts = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * width;
      // Invert Y: lower weight = higher on chart (visually trending down)
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Dots at first and last point
  const [firstX, firstY] = pts.split(' ')[0].split(',').map(Number);
  const [lastX, lastY]   = pts.split(' ').at(-1).split(',').map(Number);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <polyline
        points={pts}
        fill="none"
        stroke="var(--dash-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle cx={lastX} cy={lastY} r="3.5" fill="var(--dash-accent)" />
    </svg>
  );
});

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

/**
 * @param {{ progressSnapshot: import('../../models/dashboard').ProgressSnapshot }} props
 */
const ProgressSnapshotCard = memo(function ProgressSnapshotCard({ progressSnapshot }) {
  const { t } = useTranslation();
  const history = useHistory();

  const { lastWeightKg, deltaKg, trendPoints } = progressSnapshot;
  const hasData = lastWeightKg !== null;

  const isLoss   = deltaKg !== null && deltaKg <= 0;
  const deltaAbs = deltaKg !== null ? Math.abs(deltaKg).toFixed(1) : null;

  const deltaText = useMemo(() => {
    if (deltaKg === null) return null;
    return deltaKg <= 0
      ? t('dashboard.progress.deltaNegative', { value: `-${deltaAbs}` })
      : t('dashboard.progress.deltaPositive', { value: deltaAbs });
  }, [deltaKg, deltaAbs, t]);

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h2 className="dash-card-title">{t('dashboard.progress.title')}</h2>
      </div>

      {hasData ? (
        <div
          className="progress-snapshot-inner"
          role="button"
          tabIndex={0}
          onClick={() => history.push('/progress')}
          onKeyDown={(e) => e.key === 'Enter' && history.push('/progress')}
        >
          {/* Weight block */}
          <div className="progress-weight-block">
            <div>
              <span className="progress-weight-value">{lastWeightKg?.toFixed(1)}</span>
              <span className="progress-weight-unit">{t('common.kg')}</span>
            </div>
            {deltaText && (
              <div className={`progress-delta ${isLoss ? 'loss' : 'gain'}`}>
                <IonIcon icon={isLoss ? trendingDownOutline : trendingUpOutline} />
                {deltaText}
              </div>
            )}
            <div className="progress-delta-week">{t('dashboard.progress.deltaThisWeek')}</div>
          </div>

          {/* Sparkline */}
          <div className="progress-sparkline">
            <Sparkline points={trendPoints} width={90} height={40} />
          </div>

          {/* View more */}
          <div className="progress-view-more">
            {t('dashboard.progress.viewMore')}
            <IonIcon icon={chevronForwardOutline} />
          </div>
        </div>
      ) : (
        <div className="progress-no-data">
          <p>{t('dashboard.progress.noData')}</p>
          <button
            className="activity-btn-primary"
            style={{ marginTop: 12, width: '100%' }}
            onClick={() => history.push('/progress')}
          >
            {t('dashboard.progress.viewMore')}
          </button>
        </div>
      )}
    </div>
  );
});

export default ProgressSnapshotCard;
