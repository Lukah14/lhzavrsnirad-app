import { IonContent, IonHeader, IonPage, IonToolbar } from '@ionic/react';
import DesignCard from './DesignCard';
import DesignEmptyState from './DesignEmptyState';
import PageShell from '../layout/PageShell';
import '../../theme/designSystem.css';

/**
 * Full-page "Coming soon" placeholder using design system.
 */
export default function ComingSoonCard({ name }) {
  return (
    <IonPage className="coming-soon-page">
      <IonHeader translucent>
        <IonToolbar>
          <h1 className="coming-soon-title">{name}</h1>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <PageShell>
          <DesignCard>
            <DesignEmptyState
              icon="🚧"
              title={name}
              hint="This feature is coming soon."
            />
          </DesignCard>
        </PageShell>
      </IonContent>
    </IonPage>
  );
}
