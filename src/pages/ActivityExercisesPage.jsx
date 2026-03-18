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

export default function ActivityExercisesPage() {
  const { t } = useTranslation();

  return (
    <IonPage className="activity-exercises-page">
      <IonHeader translucent>
        <IonToolbar>
          <h1 className="activity-page-title">{t('dashboard.activity.exercises', { defaultValue: 'Exercises' })}</h1>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <PageShell>
          <DesignCard>
            <DesignEmptyState
              icon="💪"
              title={t('activity.exercises.empty', { defaultValue: 'Exercise library' })}
              hint={t('activity.exercises.emptyHint', { defaultValue: 'Browse exercises and add them to your workouts' })}
            />
          </DesignCard>
        </PageShell>
      </IonContent>
    </IonPage>
  );
}
