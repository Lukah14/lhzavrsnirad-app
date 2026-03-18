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

export default function CoachMessagesPage() {
  const { t } = useTranslation();

  return (
    <IonPage className="coach-messages-page">
      <IonHeader translucent>
        <IonToolbar>
          <h1 className="coach-page-title">{t('coach.messages', { defaultValue: 'Messages' })}</h1>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <PageShell>
          <DesignCard>
            <DesignEmptyState
              icon="💬"
              title={t('coach.messagesEmpty', { defaultValue: 'No messages' })}
              hint={t('coach.messagesEmptyHint', { defaultValue: 'Chat with your clients' })}
            />
          </DesignCard>
        </PageShell>
      </IonContent>
    </IonPage>
  );
}
