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

export default function CoachClientsPage() {
  const { t } = useTranslation();

  return (
    <IonPage className="coach-clients-page">
      <IonHeader translucent>
        <IonToolbar>
          <h1 className="coach-page-title">{t('coach.clients', { defaultValue: 'Clients' })}</h1>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <PageShell>
          <DesignCard>
            <DesignEmptyState
              icon="👥"
              title={t('coach.clientsEmpty', { defaultValue: 'No clients yet' })}
              hint={t('coach.clientsEmptyHint', { defaultValue: 'Invite clients to get started' })}
            />
          </DesignCard>
        </PageShell>
      </IonContent>
    </IonPage>
  );
}
