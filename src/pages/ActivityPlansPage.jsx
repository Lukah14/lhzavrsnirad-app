import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';

import DesignCard from '../components/ui/DesignCard';
import DesignEmptyState from '../components/ui/DesignEmptyState';
import PageShell from '../components/layout/PageShell';

import '../theme/activity.css';

export default function ActivityPlansPage() {
  const { t } = useTranslation();

  return (
    <IonPage className="activity-plans-page">
      <IonHeader translucent>
        <IonToolbar>
          <h1 className="activity-page-title">{t('activity.plans.title', { defaultValue: 'Workout Plans' })}</h1>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <PageShell>
          <DesignCard>
            <DesignEmptyState
              icon="📋"
              title={t('activity.plans.empty', { defaultValue: 'No plans yet' })}
              hint={t('activity.plans.emptyHint', { defaultValue: 'Create workout plans and follow your progress' })}
            />
          </DesignCard>
        </PageShell>
      </IonContent>
    </IonPage>
  );
}
