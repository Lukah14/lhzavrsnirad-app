import { memo, useCallback } from 'react';
import { IonIcon } from '@ionic/react';
import { addOutline, sunnyOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { MEAL_ICONS } from '../../models/dashboard';
import DesignEmptyState from '../ui/DesignEmptyState';

// ---------------------------------------------------------------------------
// Single meal row
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   meal: import('../../models/dashboard').Meal,
 *   selectedDate: string,
 *   mealLabel: string,
 * }} props
 */
const MealRow = memo(function MealRow({ meal, selectedDate, mealLabel }) {
  const { t } = useTranslation();
  const history = useHistory();

  const { mealType, itemsPreview, subtotal } = meal;
  const hasItems = itemsPreview.length > 0;

  const goToMealDetail = useCallback(() => {
    history.push(`/nutrition/food-log?date=${selectedDate}&meal=${mealType}`);
  }, [history, selectedDate, mealType]);

  const goAddFood = useCallback(
    (e) => {
      e.stopPropagation();
      history.push(
        `/nutrition/search?mealType=${mealType}&date=${selectedDate}`
      );
    },
    [history, mealType, selectedDate]
  );

  // Build preview string: first 2 item names
  const previewNames = itemsPreview
    .slice(0, 2)
    .map((i) => i.name)
    .join(', ');

  return (
    <div className="meal-row" onClick={goToMealDetail} role="button" tabIndex={0}>
      {/* Icon — sun for breakfast (Figma target), emoji for others */}
      <div className="meal-icon" aria-hidden="true">
        {mealType === 'breakfast' ? (
          <IonIcon icon={sunnyOutline} className="meal-icon-ion" />
        ) : (
          MEAL_ICONS[mealType]
        )}
      </div>

      {/* Info */}
      <div className="meal-info">
        <span className="meal-name">{mealLabel}</span>
        {hasItems ? (
          <>
            {previewNames && (
              <div className="meal-items-preview">{previewNames}</div>
            )}
          </>
        ) : (
          <div className="meal-meta" style={{ color: 'var(--dash-text-muted)' }}>
            {t('dashboard.meals.noItems')}
          </div>
        )}
      </div>

      {/* Right side: kcal (target: "Breakfast" + "415 kcal" layout) + add button */}
      {hasItems && (
        <span className="meal-kcal">{Math.round(subtotal.kcal)} kcal</span>
      )}

      <button
        className="meal-add-btn"
        onClick={goAddFood}
        aria-label={t('dashboard.meals.addFood')}
      >
        <IonIcon icon={addOutline} />
      </button>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   meals: import('../../models/dashboard').Meal[],
 *   selectedDate: string
 * }} props
 */
const MealLogCard = memo(function MealLogCard({ meals, selectedDate }) {
  const { t } = useTranslation();
  const history = useHistory();

  const mealLabelMap = {
    breakfast: t('dashboard.meals.breakfast'),
    lunch:     t('dashboard.meals.lunch'),
    dinner:    t('dashboard.meals.dinner'),
    snack:     t('dashboard.meals.snack'),
  };

  const allEmpty = meals.every((m) => !m.itemsPreview?.length);

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h2 className="dash-card-title">{t('dashboard.meals.todaysMeals')}</h2>
        <button
          className="dash-card-action"
          onClick={() => history.push(`/nutrition/food-log?date=${selectedDate}`)}
        >
          {t('dashboard.meals.fullLog')} &gt;
        </button>
      </div>

      {allEmpty ? (
        <DesignEmptyState
          icon="🍽️"
          title={t('dashboard.meals.noItems')}
          hint={t('dashboard.meals.tapToAdd')}
          ctaLabel={t('dashboard.meals.addFood')}
          onCtaClick={() => history.push(`/nutrition/search?mealType=breakfast&date=${selectedDate}`)}
        />
      ) : (
      <div className="meal-list">
        {meals.map((meal) => (
          <MealRow
            key={meal.mealType}
            meal={meal}
            selectedDate={selectedDate}
            mealLabel={mealLabelMap[meal.mealType] ?? meal.mealType}
          />
        ))}
      </div>
      )}
    </div>
  );
});

export default MealLogCard;
