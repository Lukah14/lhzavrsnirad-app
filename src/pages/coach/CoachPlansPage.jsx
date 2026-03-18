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

export default function CoachPlansPage() {
  const { t } = useTranslation();

  return (
    <IonPage className="coach-plans-page">
      <IonHeader translucent>
        <IonToolbar>
          <h1 className="coach-page-title">{t('coach.plans', { defaultValue: 'Plans' })}</h1>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <PageShell>
          <DesignCard>
            <DesignEmptyState
              icon="📋"
              title={t('coach.plansEmpty', { defaultValue: 'No plans yet' })}
              hint={t('coach.plansEmptyHint', { defaultValue: 'Create workout and nutrition plans' })}
            />
          </DesignCard>
        </PageShell>
      </IonContent>
    </IonPage>
  );
}
