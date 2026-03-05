import { memo, useCallback } from 'react';
import { IonIcon } from '@ionic/react';
import { addOutline, chevronForwardOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { MEAL_ICONS } from '../../models/dashboard';

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
      {/* Icon */}
      <div className="meal-icon" aria-hidden="true">
        {MEAL_ICONS[mealType]}
      </div>

      {/* Info */}
      <div className="meal-info">
        <span className="meal-name">{mealLabel}</span>
        {hasItems ? (
          <>
            <div className="meal-meta">
              {t('dashboard.meals.subtotalKcal', { kcal: Math.round(subtotal.kcal) })}
              {' · '}
              {t('dashboard.meals.macroShort', {
                p: Math.round(subtotal.p),
                c: Math.round(subtotal.c),
                f: Math.round(subtotal.f),
              })}
            </div>
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

      {/* Right side: kcal + add button */}
      {hasItems && (
        <span className="meal-kcal">{Math.round(subtotal.kcal)}</span>
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

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h2 className="dash-card-title">{t('dashboard.meals.title')}</h2>
        <button
          className="dash-card-action"
          onClick={() => history.push(`/nutrition/food-log?date=${selectedDate}`)}
        >
          {t('dashboard.meals.more')}
        </button>
      </div>

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
    </div>
  );
});

export default MealLogCard;
