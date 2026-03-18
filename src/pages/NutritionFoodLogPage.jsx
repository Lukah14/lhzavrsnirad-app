import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonIcon,
} from '@ionic/react';
import { addOutline, chevronBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAppContext } from '../context/AppContext';
import NutritionSegmentedNav from '../components/nutrition/NutritionSegmentedNav';
import DesignCard from '../components/ui/DesignCard';
import DesignEmptyState from '../components/ui/DesignEmptyState';
import DesignButton from '../components/ui/DesignButton';
import PageShell from '../components/layout/PageShell';

import { MEAL_ICONS, MEAL_TYPES } from '../models/dashboard';
import '../theme/dashboard.css';
import '../theme/nutrition.css';

const todayISO = () => new Date().toISOString().split('T')[0];

export default function NutritionFoodLogPage() {
  const { t } = useTranslation();
  const history = useHistory();
  const { getDashboardData, loadDate } = useAppContext();

  const [selectedDate, setSelectedDate] = useState(todayISO);

  useEffect(() => {
    loadDate(selectedDate);
  }, [selectedDate, loadDate]);

  const data = getDashboardData(selectedDate);
  const meals = data?.meals ?? [];

  const mealLabels = useMemo(() => ({
    breakfast: t('dashboard.meals.breakfast'),
    lunch: t('dashboard.meals.lunch'),
    dinner: t('dashboard.meals.dinner'),
    snack: t('dashboard.meals.snack'),
  }), [t]);

  const totals = data?.totals ?? { consumedKcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };
  const goals = data?.goals ?? { caloriesGoal: 2000, proteinGoal: 150, carbsGoal: 220, fatGoal: 65 };

  const handleAddFood = useCallback(
    (mealType) => {
      history.push(`/nutrition/search?mealType=${mealType}&date=${selectedDate}`);
    },
    [history, selectedDate]
  );

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <IonPage className="nutrition-food-log-page">
      <IonHeader translucent>
        <IonToolbar>
          <div className="nutrition-food-log-header">
            <button
              type="button"
              className="nutrition-back-btn"
              onClick={() => history.push('/home')}
              aria-label={t('common.back')}
            >
              <IonIcon icon={chevronBackOutline} />
            </button>
            <h1 className="nutrition-food-log-title">{t('dashboard.meals.title')}</h1>
          </div>
        </IonToolbar>
        <IonToolbar>
          <NutritionSegmentedNav />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <PageShell>
          {/* Date + summary */}
          <div className="nutrition-food-log-summary">
            <p className="nutrition-food-log-date">{formatDate(selectedDate)}</p>
            <div className="nutrition-food-log-stats">
              <span className="nutrition-stat">
                <strong>{Math.round(totals.consumedKcal)}</strong> / {goals.caloriesGoal} kcal
              </span>
              <span className="nutrition-stat">
                P {Math.round(totals.proteinG)}g · C {Math.round(totals.carbsG)}g · F {Math.round(totals.fatG)}g
              </span>
            </div>
          </div>

          {/* Meal sections */}
          {MEAL_TYPES.map((mealType) => {
            const meal = meals.find((m) => m.mealType === mealType) ?? {
              mealType,
              itemsPreview: [],
              subtotal: { kcal: 0, p: 0, c: 0, f: 0 },
            };
            const hasItems = meal.itemsPreview?.length > 0;

            return (
              <DesignCard
                key={mealType}
                title={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{MEAL_ICONS[mealType]}</span>
                    {mealLabels[mealType]}
                  </span>
                }
                action={hasItems ? t('dashboard.meals.more') : null}
                onActionClick={() => history.push(`/nutrition/food-log?date=${selectedDate}&meal=${mealType}`)}
              >
                {hasItems ? (
                  <div className="nutrition-meal-entries">
                    {meal.itemsPreview.map((item, i) => (
                      <div key={i} className="nutrition-meal-entry">
                        <span className="nutrition-meal-entry-name">{item.name}</span>
                        <span className="nutrition-meal-entry-kcal">{Math.round(item.kcal)} kcal</span>
                      </div>
                    ))}
                    <div className="nutrition-meal-subtotal">
                      {t('dashboard.meals.subtotalKcal', { kcal: Math.round(meal.subtotal.kcal) })}
                    </div>
                  </div>
                ) : (
                  <DesignEmptyState
                    icon={MEAL_ICONS[mealType]}
                    title={t('dashboard.meals.noItems')}
                    hint={t('dashboard.meals.tapToAdd')}
                    ctaLabel={t('dashboard.meals.addFood')}
                    onCtaClick={() => handleAddFood(mealType)}
                  />
                )}
              </DesignCard>
            );
          })}

          {/* Add Food CTA */}
          <DesignButton
            variant="primary"
            fullWidth
            onClick={() => handleAddFood('breakfast')}
            className="nutrition-add-food-cta"
          >
            <IonIcon icon={addOutline} style={{ marginRight: 8 }} />
            {t('dashboard.meals.addFood')}
          </DesignButton>
        </PageShell>
      </IonContent>
    </IonPage>
  );
}
