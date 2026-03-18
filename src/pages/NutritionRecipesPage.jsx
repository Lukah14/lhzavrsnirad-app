import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonIcon,
} from '@ionic/react';
import { chevronBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import NutritionSegmentedNav from '../components/nutrition/NutritionSegmentedNav';
import DesignCard from '../components/ui/DesignCard';
import DesignEmptyState from '../components/ui/DesignEmptyState';
import PageShell from '../components/layout/PageShell';

import '../theme/nutrition.css';

export default function NutritionRecipesPage() {
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <IonPage className="nutrition-recipes-page">
      <IonHeader translucent>
        <IonToolbar>
          <div className="nutrition-food-log-header">
            <button
              type="button"
              className="nutrition-back-btn"
              onClick={() => history.push('/nutrition')}
              aria-label={t('common.back')}
            >
              <IonIcon icon={chevronBackOutline} />
            </button>
            <h1 className="nutrition-food-log-title">{t('dashboard.meals.recipes', { defaultValue: 'Recipes' })}</h1>
          </div>
        </IonToolbar>
        <IonToolbar>
          <NutritionSegmentedNav />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <PageShell>
          <DesignCard>
            <DesignEmptyState
              icon="🍳"
              title={t('nutrition.recipes.empty', { defaultValue: 'No recipes yet' })}
              hint={t('nutrition.recipes.emptyHint', { defaultValue: 'Save your favorite recipes and add them to your food log' })}
            />
          </DesignCard>
        </PageShell>
      </IonContent>
    </IonPage>
  );
}
