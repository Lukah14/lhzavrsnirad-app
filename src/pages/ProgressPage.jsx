import { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';

import { useAppContext } from '../context/AppContext';
import DesignCard from '../components/ui/DesignCard';
import DesignEmptyState from '../components/ui/DesignEmptyState';
import PageShell from '../components/layout/PageShell';

import '../theme/community.css';

const todayISO = () => new Date().toISOString().split('T')[0];

export default function ProgressPage() {
  const { t } = useTranslation();
  const { getDashboardData, loadDate } = useAppContext();
  const [selectedDate] = useState(todayISO);

  useEffect(() => {
    loadDate(selectedDate);
  }, [selectedDate, loadDate]);

  const data = getDashboardData(selectedDate);
  const snapshot = data?.progressSnapshot;
  const hasData = snapshot?.lastWeightKg != null;

  return (
    <IonPage className="progress-page">
      <IonHeader translucent>
        <IonToolbar>
          <h1 className="progress-page-title">{t('dashboard.progress.title')}</h1>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <PageShell>
          {hasData ? (
            <DesignCard>
              <div className="progress-detail">
                <div className="progress-detail-weight">
                  <span className="progress-detail-value">{snapshot.lastWeightKg?.toFixed(1)}</span>
                  <span className="progress-detail-unit">{t('common.kg')}</span>
                </div>
                {snapshot.deltaKg != null && (
                  <p className="progress-detail-delta">
                    {snapshot.deltaKg <= 0 ? '↓' : '↑'} {Math.abs(snapshot.deltaKg).toFixed(1)} kg {t('dashboard.progress.deltaThisWeek')}
                  </p>
                )}
              </div>
            </DesignCard>
          ) : (
            <DesignCard>
              <DesignEmptyState
                icon="📊"
                title={t('dashboard.progress.noData')}
                hint={t('dashboard.progress.noDataHint', { defaultValue: 'Track your weight over time' })}
              />
            </DesignCard>
          )}
        </PageShell>
      </IonContent>
    </IonPage>
  );
}
