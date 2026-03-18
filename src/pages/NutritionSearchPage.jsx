import { memo, useCallback, useEffect, useState } from 'react';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSearchbar,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAppContext }  from '../context/AppContext';
import { useFoodSearch }  from '../context/FoodSearchContext';

import NutritionSegmentedNav from '../components/nutrition/NutritionSegmentedNav';
import '../theme/dashboard.css';
import '../theme/search.css';
import '../theme/nutrition.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const todayISO = () => new Date().toISOString().split('T')[0];

/** Map source → emoji icon (shown when no imageUrl is available) */
const SOURCE_EMOJI = {
  off:       '🌍',
  usda:      '🇺🇸',
  fatsecret: '🔥',
  internal:  '⭐',
  user:      '👤',
};

/** Map source → short badge label */
const SOURCE_LABEL = {
  off:       'OFF',
  usda:      'USDA',
  fatsecret: 'FS',
  internal:  '★',
  user:      'Me',
};

// ---------------------------------------------------------------------------
// SearchResultCard — single food item row
// ---------------------------------------------------------------------------

const SearchResultCard = memo(function SearchResultCard({ food, onAdd }) {
  const { t } = useTranslation();

  const icon  = SOURCE_EMOJI[food.source] ?? '🥗';
  const badge = SOURCE_LABEL[food.source] ?? '?';

  return (
    <div className="search-result-card">
      {/* Left icon */}
      <div className="search-result-icon" aria-hidden="true">
        {food.imageUrl ? (
          <img src={food.imageUrl} alt="" loading="lazy" />
        ) : (
          icon
        )}
      </div>

      {/* Info */}
      <div className="search-result-info">
        <div className="search-result-name">{food.name || t('common.noData')}</div>
        {food.brand && (
          <div className="search-result-brand">{food.brand}</div>
        )}
        <div className="search-result-kcal-row">
          <span className="search-result-kcal">
            {Math.round(food.per100g?.kcal ?? 0)}
          </span>
          <span className="search-result-kcal-unit">
            {t('search.kcalPer100g')}
          </span>
        </div>
        <div className="search-result-macros">
          <span className="search-result-macro">
            🥩&nbsp;{Math.round(food.per100g?.protein ?? 0)}g
          </span>
          <span className="search-result-macro">
            🌾&nbsp;{Math.round(food.per100g?.carbs ?? 0)}g
          </span>
          <span className="search-result-macro">
            🫐&nbsp;{Math.round(food.per100g?.fat ?? 0)}g
          </span>
        </div>
      </div>

      {/* Source badge */}
      <span className="search-source-badge" aria-label={food.source}>
        {badge}
      </span>

      {/* Add button */}
      <button
        className="search-result-add-btn"
        onClick={() => onAdd(food)}
        aria-label={t('search.addFood', { name: food.name })}
        type="button"
      >
        <IonIcon icon={addOutline} />
      </button>
    </div>
  );
});

// ---------------------------------------------------------------------------
// SearchSkeleton — 3 shimmer cards while loading
// ---------------------------------------------------------------------------

const SearchSkeleton = memo(function SearchSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="search-skeleton-card">
          <div className="search-skel-icon skel-block" />
          <div className="search-skel-info">
            <div className="search-skel-line wide   skel-block" />
            <div className="search-skel-line medium skel-block" />
            <div className="search-skel-line narrow skel-block" />
          </div>
        </div>
      ))}
    </>
  );
});

// ---------------------------------------------------------------------------
// RecentSearchesRow — chips for recent terms
// ---------------------------------------------------------------------------

const RecentSearchesRow = memo(function RecentSearchesRow({ recents, onSelect }) {
  const { t } = useTranslation();
  if (!recents.length) return null;

  return (
    <div style={{ marginBottom: 8 }}>
      <p className="search-section-label">{t('search.recentSearches')}</p>
      <div className="search-recent-chips">
        {recents.map((term) => (
          <button
            key={term}
            className="search-recent-chip"
            onClick={() => onSelect(term)}
            type="button"
          >
            <span className="search-recent-chip-icon" aria-hidden="true">🕐</span>
            {term}
          </button>
        ))}
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

const EmptyState = memo(function EmptyState({ term }) {
  const { t } = useTranslation();
  return (
    <div className="search-empty-state">
      <span className="search-empty-icon" aria-hidden="true">🔍</span>
      <p className="search-empty-title">{t('search.noResults', { term })}</p>
      <p className="search-empty-hint">{t('search.noResultsHint')}</p>
    </div>
  );
});

// ---------------------------------------------------------------------------
// ErrorBanner
// ---------------------------------------------------------------------------

const ErrorBanner = memo(function ErrorBanner({ errorKey }) {
  const { t } = useTranslation();
  return (
    <div className="search-error-banner" role="alert">
      <span className="search-error-icon" aria-hidden="true">⚠️</span>
      <span className="search-error-text">{t(errorKey)}</span>
    </div>
  );
});

// ---------------------------------------------------------------------------
// NutritionSearchPage
// ---------------------------------------------------------------------------

function NutritionSearchPage() {
  const { t }        = useTranslation();
  const location     = useLocation();
  const { addFoodItem } = useAppContext();
  const {
    results,
    loading,
    error,
    recentSearches,
    searchFoods,
    clearResults,
  } = useFoodSearch();

  // Parse URL query params (?mealType=lunch&date=2024-03-05)
  const urlParams = new URLSearchParams(location.search);
  const mealType  = urlParams.get('mealType') ?? 'breakfast';
  const date      = urlParams.get('date')     ?? todayISO();

  const [query,      setQuery]      = useState('');
  const [toastMsg,   setToastMsg]   = useState('');
  const [toastOpen,  setToastOpen]  = useState(false);

  // Trigger search when query changes (IonSearchbar's debounce handles timing)
  const handleSearchChange = useCallback((e) => {
    const val = e.detail.value ?? '';
    setQuery(val);
    if (!val.trim()) {
      clearResults();
    }
  }, [clearResults]);

  // Kick off a search for the given term (used by recent chips too)
  const handleSearch = useCallback((term) => {
    setQuery(term);
    if (term.trim()) searchFoods(term.trim());
    else clearResults();
  }, [searchFoods, clearResults]);

  // Clean up on unmount
  useEffect(() => () => clearResults(), [clearResults]);

  // Add food to the selected meal
  const handleAdd = useCallback((food) => {
    addFoodItem(mealType, date, food, 100);
    const mealLabel = t(`dashboard.meals.${mealType}`, { defaultValue: mealType });
    setToastMsg(t('search.addedToast', { meal: mealLabel }));
    setToastOpen(true);
  }, [addFoodItem, mealType, date, t]);

  const showRecents   = !query && recentSearches.length > 0;
  const showSkeleton  = loading;
  const showResults   = !loading && results.length > 0;
  const showEmpty     = !loading && query.trim() && results.length === 0 && !error;
  const showError     = !loading && !!error;

  return (
    <IonPage className="search-page">
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/nutrition/food-log" />
          </IonButtons>
          <IonSearchbar
            value={query}
            onIonInput={handleSearchChange}
            onIonChange={(e) => {
              const val = e.detail.value?.trim() ?? '';
              if (val) searchFoods(val);
            }}
            debounce={400}
            placeholder={t('foodSearch.placeholder')}
            showClearButton="focus"
            animated
            autofocus
            aria-label={t('search.title')}
          />
        </IonToolbar>
        <IonToolbar>
          <NutritionSegmentedNav />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="search-page">
        <div className="search-scroll">

          {/* Recent searches */}
          {showRecents && (
            <RecentSearchesRow
              recents={recentSearches}
              onSelect={handleSearch}
            />
          )}

          {/* Default hint when page is empty */}
          {!query && !recentSearches.length && (
            <div className="search-empty-state">
              <span className="search-empty-icon" aria-hidden="true">🥗</span>
              <p className="search-empty-title">{t('search.title')}</p>
              <p className="search-empty-hint">{t('search.hint')}</p>
            </div>
          )}

          {/* Loading skeletons */}
          {showSkeleton && <SearchSkeleton />}

          {/* Results */}
          {showResults && (
            <>
              <p className="search-section-label">
                {t('foodSearch.resultsFrom', { sources: 'OFF · USDA · FatSecret' })}
              </p>
              {results.map((food, idx) => (
                <SearchResultCard
                  key={`${food.source}-${food.externalId ?? idx}`}
                  food={food}
                  onAdd={handleAdd}
                />
              ))}
            </>
          )}

          {/* Empty state */}
          {showEmpty && <EmptyState term={query} />}

          {/* Error banner */}
          {showError && <ErrorBanner errorKey={error} />}
        </div>
      </IonContent>

      <IonToast
        isOpen={toastOpen}
        message={toastMsg}
        duration={1800}
        position="bottom"
        positionAnchor="ion-tab-bar"
        onDidDismiss={() => setToastOpen(false)}
      />
    </IonPage>
  );
}

export default NutritionSearchPage;
