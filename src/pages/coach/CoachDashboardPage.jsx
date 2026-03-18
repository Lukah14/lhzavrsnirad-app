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

export default function CoachDashboardPage() {
  const { t } = useTranslation();

  return (
    <IonPage className="coach-dashboard-page">
      <IonHeader translucent>
        <IonToolbar>
          <h1 className="coach-page-title">{t('coach.dashboard', { defaultValue: 'Coach Dashboard' })}</h1>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <PageShell>
          <DesignCard>
            <DesignEmptyState
              icon="👨‍🏫"
              title={t('coach.dashboardEmpty', { defaultValue: 'Coach mode' })}
              hint={t('coach.dashboardEmptyHint', { defaultValue: 'Manage your clients and programs' })}
            />
          </DesignCard>
        </PageShell>
      </IonContent>
    </IonPage>
  );
}
