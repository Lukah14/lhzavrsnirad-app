import { useCallback, useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonIcon,
} from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAppContext } from '../context/AppContext';
import DesignCard from '../components/ui/DesignCard';
import DesignEmptyState from '../components/ui/DesignEmptyState';
import DesignButton from '../components/ui/DesignButton';
import PageShell from '../components/layout/PageShell';

import '../theme/dashboard.css';
import '../theme/activity.css';

const todayISO = () => new Date().toISOString().split('T')[0];

const PRESETS = [
  { key: 'walk', minutes: 30, kcal: 150 },
  { key: 'gym', minutes: 60, kcal: 350 },
];

export default function ActivityTodayPage() {
  const { t } = useTranslation();
  const history = useHistory();
  const { getDashboardData, loadDate, addQuickWorkout } = useAppContext();

  const [selectedDate, setSelectedDate] = useState(todayISO);

  useEffect(() => {
    loadDate(selectedDate);
  }, [selectedDate, loadDate]);

  const data = getDashboardData(selectedDate);
  const totals = data?.totals ?? {
    burnedKcal: 0,
    workoutsCount: 0,
    workoutsMinutes: 0,
  };

  const handlePreset = useCallback(
    (preset) => {
      addQuickWorkout({ minutes: preset.minutes, kcal: preset.kcal }, selectedDate);
    },
    [addQuickWorkout, selectedDate]
  );

  const hasActivity = totals.workoutsCount > 0;

  return (
    <IonPage className="activity-today-page">
      <IonHeader translucent>
        <IonToolbar>
          <h1 className="activity-page-title">{t('dashboard.activity.title')}</h1>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <PageShell>
          {/* Stats row */}
          <div className="activity-today-stats">
            <div className="activity-today-stat">
              <span className="activity-today-stat-value">{totals.burnedKcal}</span>
              <span className="activity-today-stat-label">kcal burned</span>
            </div>
            <div className="activity-today-stat">
              <span className="activity-today-stat-value">{totals.workoutsMinutes}</span>
              <span className="activity-today-stat-label">min active</span>
            </div>
            <div className="activity-today-stat">
              <span className="activity-today-stat-value">—</span>
              <span className="activity-today-stat-label">steps</span>
            </div>
          </div>

          <DesignCard title={t('dashboard.activity.title')}>
            {hasActivity ? (
              <div className="activity-today-content">
                <p>{t('dashboard.activity.presetWalk')} · {totals.workoutsMinutes} min</p>
              </div>
            ) : (
              <DesignEmptyState
                icon="🔥"
                title={t('dashboard.activity.noActivity')}
                hint={t('dashboard.activity.noActivityHint')}
                ctaLabel={t('dashboard.activity.addWorkout')}
                onCtaClick={() => history.push(`/activity/add?date=${selectedDate}`)}
              />
            )}
          </DesignCard>

          <div className="activity-today-presets">
            {PRESETS.map((preset) => (
              <DesignButton
                key={preset.key}
                variant="secondary"
                onClick={() => handlePreset(preset)}
              >
                {preset.key === 'walk' ? t('dashboard.activity.presetWalk') : t('dashboard.activity.presetGym')}
              </DesignButton>
            ))}
          </div>

          <DesignButton
            variant="primary"
            fullWidth
            onClick={() => history.push(`/activity/add?date=${selectedDate}`)}
          >
            <IonIcon icon={addOutline} style={{ marginRight: 8 }} />
            {t('dashboard.activity.addWorkout')}
          </DesignButton>
        </PageShell>
      </IonContent>
    </IonPage>
  );
}
