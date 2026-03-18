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

import '../theme/community.css';

export default function CommunityPage() {
  const { t } = useTranslation();

  return (
    <IonPage className="community-page">
      <IonHeader translucent>
        <IonToolbar>
          <h1 className="community-page-title">{t('nav.community')}</h1>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <PageShell>
          <DesignCard>
            <DesignEmptyState
              icon="💬"
              title={t('community.empty', { defaultValue: 'Community' })}
              hint={t('community.emptyHint', { defaultValue: 'Connect with others and share your journey' })}
            />
          </DesignCard>
        </PageShell>
      </IonContent>
    </IonPage>
  );
}
