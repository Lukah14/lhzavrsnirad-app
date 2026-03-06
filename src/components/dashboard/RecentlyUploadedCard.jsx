import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { MEAL_ICONS } from '../../models/dashboard';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Flatten all meal itemsPreview into a flat list, tag each with meal emoji. */
function flattenItems(meals) {
  const items = [];
  for (const meal of meals) {
    for (const item of meal.itemsPreview) {
      items.push({ ...item, mealType: meal.mealType });
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// Single recently-uploaded row
// ---------------------------------------------------------------------------

const RecentItemRow = memo(function RecentItemRow({ item, selectedDate }) {
  const history = useHistory();

  const handleClick = () => {
    history.push(
      `/nutrition/food-log?date=${selectedDate}&meal=${item.mealType}`
    );
  };

  return (
    <div className="recent-item-card" onClick={handleClick} role="button" tabIndex={0}>
      {/* Food emoji in a rounded box */}
      <div className="recent-item-emoji" aria-hidden="true">
        {MEAL_ICONS[item.mealType]}
      </div>

      {/* Info block */}
      <div className="recent-item-info">
        <div className="recent-item-top">
          <span className="recent-item-name">{item.name}</span>
        </div>

        <div className="recent-item-kcal-row">
          <span className="recent-item-kcal-icon" aria-hidden="true">🔥</span>
          <span className="recent-item-kcal">{Math.round(item.kcal)} calories</span>
        </div>

        <div className="recent-item-macros">
          <span className="recent-macro-chip">
            <span aria-hidden="true">🥩</span> {Math.round(item.p)}g
          </span>
          <span className="recent-macro-chip">
            <span aria-hidden="true">🌾</span> {Math.round(item.c)}g
          </span>
          <span className="recent-macro-chip">
            <span aria-hidden="true">🫐</span> {Math.round(item.f)}g
          </span>
        </div>
      </div>
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
const RecentlyUploadedCard = memo(function RecentlyUploadedCard({ meals, selectedDate }) {
  const { t } = useTranslation();

  const items = useMemo(() => flattenItems(meals).slice(0, 4), [meals]);

  return (
    <div className="recently-uploaded-section">
      <h2 className="recently-uploaded-title">
        {t('dashboard.recentlyUploaded')}
      </h2>

      {items.length === 0 ? (
        <div className="recent-empty-card">
          <span className="recent-empty-icon" aria-hidden="true">🥗</span>
          <p className="recent-empty-text">{t('dashboard.meals.tapToAdd')}</p>
        </div>
      ) : (
        items.map((item, idx) => (
          <RecentItemRow
            key={`${item.mealType}-${idx}`}
            item={item}
            selectedDate={selectedDate}
          />
        ))
      )}
    </div>
  );
});

export default RecentlyUploadedCard;
