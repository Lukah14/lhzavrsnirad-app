import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';

import DesignCard from '../../components/ui/DesignCard';
import DesignEmptyState from '../../components/ui/DesignEmptyState';
import PageShell from '../../components/layout/PageShell';

import '../../theme/coach.css';

export default function CoachAnalyticsPage() {
  const { t } = useTranslation();

  return (
    <IonPage className="coach-analytics-page">
      <IonHeader translucent>
        <IonToolbar>
          <h1 className="coach-page-title">{t('coach.analytics', { defaultValue: 'Analytics' })}</h1>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <PageShell>
          <DesignCard>
            <DesignEmptyState
              icon="📈"
              title={t('coach.analyticsEmpty', { defaultValue: 'Analytics' })}
              hint={t('coach.analyticsEmptyHint', { defaultValue: 'View client progress and insights' })}
            />
          </DesignCard>
        </PageShell>
      </IonContent>
    </IonPage>
  );
}
