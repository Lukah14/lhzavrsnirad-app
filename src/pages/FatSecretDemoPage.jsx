import { memo, useCallback, useEffect, useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  barbellOutline,
  bookOutline,
  flameOutline,
  nutritionOutline,
  searchOutline,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useFatSecret }   from '../context/FatSecretContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const INTENSITY_OPTIONS = ['all', 'light', 'moderate', 'strenuous'];

// ---------------------------------------------------------------------------
// Small reusable card: food result row
// ---------------------------------------------------------------------------
const FoodRow = memo(function FoodRow({ food }) {
  return (
    <div style={styles.row}>
      <div style={styles.rowMain}>
        <strong style={styles.rowName}>{food.name}</strong>
        {food.brand && <span style={styles.rowSub}>{food.brand} · {food.foodType}</span>}
      </div>
      <div style={styles.rowMacros}>
        <span style={styles.macro}>🔥 {food.per100g?.kcal ?? 0} kcal</span>
        <span style={styles.macro}>🥩 {food.per100g?.protein ?? 0}g</span>
        <span style={styles.macro}>🌾 {food.per100g?.carbs ?? 0}g</span>
        <span style={styles.macro}>💧 {food.per100g?.fat ?? 0}g</span>
      </div>
      {food.brandType && (
        <IonChip style={{ marginTop: 4, fontSize: 11 }} color="medium">{food.brandType}</IonChip>
      )}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Small reusable card: recipe result row
// ---------------------------------------------------------------------------
const RecipeRow = memo(function RecipeRow({ recipe }) {
  return (
    <div style={styles.row}>
      {recipe.imageUrl && (
        <img src={recipe.imageUrl} alt="" style={styles.recipeThumb} loading="lazy" />
      )}
      <div style={styles.rowMain}>
        <strong style={styles.rowName}>{recipe.name}</strong>
        {recipe.recipeTypes?.length > 0 && (
          <span style={styles.rowSub}>{recipe.recipeTypes.join(' · ')}</span>
        )}
        {recipe.description && (
          <span style={{ ...styles.rowSub, fontSize: 12 }}>
            {recipe.description.slice(0, 80)}{recipe.description.length > 80 ? '…' : ''}
          </span>
        )}
      </div>
      <div style={styles.rowMacros}>
        <span style={styles.macro}>🔥 {Math.round(recipe.calories)} kcal</span>
        {recipe.prepTimeMinutes > 0 && (
          <span style={styles.macro}>⏱ {recipe.prepTimeMinutes} min</span>
        )}
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Small reusable card: exercise row
// ---------------------------------------------------------------------------
const ExerciseRow = memo(function ExerciseRow({ exercise }) {
  const intensityColor = {
    light:      'success',
    moderate:   'warning',
    strenuous:  'danger',
  }[exercise.intensity] ?? 'medium';

  return (
    <div style={styles.row}>
      <div style={styles.rowMain}>
        <strong style={styles.rowName}>{exercise.name}</strong>
        <IonChip color={intensityColor} style={{ fontSize: 11, marginTop: 4 }}>
          {exercise.intensity}
        </IonChip>
      </div>
      <div style={styles.rowMacros}>
        <span style={styles.macro}>MET {exercise.met}</span>
        <span style={styles.macro}>~{exercise.caloriesPerHourPerKg} kcal/kg/h</span>
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function FatSecretDemoPage() {
  const { t } = useTranslation();

  const {
    // food
    foodResults, foodLoading, foodError, foodHasMore,
    searchFoods, loadMoreFoods,
    // recipe
    recipeResults, recipeLoading, recipeError, recipeHasMore,
    searchRecipes, loadMoreRecipes,
    recipeTypes, recipeTypesLoading, loadRecipeTypes,
    // exercise
    exerciseResults, exerciseLoading, exerciseError,
    searchExercises,
    // calories burned
    caloriesBurnedResult, caloriesBurnedLoading, caloriesBurnedError,
    calculateCaloriesBurned,
  } = useFatSecret();

  // -------------------------------------------------------------------------
  // Food search
  // -------------------------------------------------------------------------
  const [foodQuery, setFoodQuery] = useState('');

  const handleFoodSearch = useCallback((e) => {
    const val = e.detail.value?.trim() ?? '';
    setFoodQuery(val);
    if (val) searchFoods({ q: val, page: 0 });
  }, [searchFoods]);

  // -------------------------------------------------------------------------
  // Recipe search
  // -------------------------------------------------------------------------
  const [recipeQuery,    setRecipeQuery]    = useState('');
  const [recipeTypeFilter, setRecipeTypeFilter] = useState('');

  useEffect(() => { loadRecipeTypes(); }, [loadRecipeTypes]);

  const handleRecipeSearch = useCallback(() => {
    const params = { q: recipeQuery };
    if (recipeTypeFilter) params.recipeTypes = recipeTypeFilter;
    searchRecipes(params);
  }, [recipeQuery, recipeTypeFilter, searchRecipes]);

  // -------------------------------------------------------------------------
  // Exercise search
  // -------------------------------------------------------------------------
  const [exIntensity, setExIntensity] = useState('');

  useEffect(() => {
    searchExercises({});
  }, [searchExercises]);

  const handleExerciseFilter = useCallback((val) => {
    setExIntensity(val);
    searchExercises(val && val !== 'all' ? { intensity: val } : {});
  }, [searchExercises]);

  // -------------------------------------------------------------------------
  // Calories burned calculator
  // -------------------------------------------------------------------------
  const [weight,  setWeight]  = useState('70');
  const [minutes, setMinutes] = useState('30');
  const [selExercise, setSelExercise] = useState(null);

  const handleCalcBurn = useCallback(() => {
    if (!selExercise) return;
    calculateCaloriesBurned({
      weightKg: parseFloat(weight)  || 70,
      minutes:  parseFloat(minutes) || 30,
      met:      selExercise.met,
    });
  }, [selExercise, weight, minutes, calculateCaloriesBurned]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>FatSecret Demo</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">

        {/* ================================================================
            SECTION 1 — Food Search
            ================================================================ */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={nutritionOutline} style={{ marginRight: 8 }} />
              {t('fatSecretCtx.foodSearch.title')}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonSearchbar
              value={foodQuery}
              onIonChange={handleFoodSearch}
              debounce={400}
              placeholder={t('fatSecretCtx.foodSearch.placeholder')}
              animated
            />
            {foodLoading && <div style={styles.center}><IonSpinner /></div>}
            {foodError && <IonText color="danger"><p>{foodError}</p></IonText>}
            {foodResults.map((food, i) => (
              <FoodRow key={`${food.providerId}-${i}`} food={food} />
            ))}
            {foodHasMore && !foodLoading && (
              <IonButton expand="block" fill="outline" onClick={loadMoreFoods} style={{ marginTop: 8 }}>
                {t('fatSecretCtx.loadMore')}
              </IonButton>
            )}
            {!foodLoading && !foodError && foodQuery && foodResults.length === 0 && (
              <IonText color="medium"><p style={{ textAlign: 'center' }}>{t('fatSecretCtx.noResults')}</p></IonText>
            )}
          </IonCardContent>
        </IonCard>

        {/* ================================================================
            SECTION 2 — Recipe Search
            ================================================================ */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={bookOutline} style={{ marginRight: 8 }} />
              {t('fatSecretCtx.recipeSearch.title')}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonSearchbar
              value={recipeQuery}
              onIonChange={(e) => setRecipeQuery(e.detail.value ?? '')}
              debounce={0}
              placeholder={t('fatSecretCtx.recipeSearch.placeholder')}
              animated
            />

            {/* Recipe type filter */}
            {!recipeTypesLoading && recipeTypes.length > 0 && (
              <IonItem lines="none">
                <IonLabel>{t('fatSecretCtx.recipeTypes')}</IonLabel>
                <IonSelect
                  value={recipeTypeFilter}
                  onIonChange={(e) => setRecipeTypeFilter(e.detail.value)}
                  placeholder={t('fatSecretCtx.all')}
                >
                  <IonSelectOption value="">All</IonSelectOption>
                  {recipeTypes.map((rt) => (
                    <IonSelectOption key={rt.id} value={rt.name}>{rt.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            )}

            <IonButton expand="block" onClick={handleRecipeSearch} style={{ marginTop: 8 }}>
              <IonIcon icon={searchOutline} slot="start" />
              {t('fatSecretCtx.search')}
            </IonButton>

            {recipeLoading && <div style={styles.center}><IonSpinner /></div>}
            {recipeError && <IonText color="danger"><p>{recipeError}</p></IonText>}
            {recipeResults.map((recipe, i) => (
              <RecipeRow key={`${recipe.providerId}-${i}`} recipe={recipe} />
            ))}
            {recipeHasMore && !recipeLoading && (
              <IonButton expand="block" fill="outline" onClick={loadMoreRecipes} style={{ marginTop: 8 }}>
                {t('fatSecretCtx.loadMore')}
              </IonButton>
            )}
          </IonCardContent>
        </IonCard>

        {/* ================================================================
            SECTION 3 — Exercise Browser
            ================================================================ */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={barbellOutline} style={{ marginRight: 8 }} />
              {t('fatSecretCtx.exerciseSearch.title')}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {/* Intensity filter chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {INTENSITY_OPTIONS.map((opt) => (
                <IonChip
                  key={opt}
                  color={exIntensity === opt || (!exIntensity && opt === 'all') ? 'primary' : 'medium'}
                  onClick={() => handleExerciseFilter(opt === 'all' ? '' : opt)}
                >
                  {t(`fatSecretCtx.intensity.${opt}`)}
                </IonChip>
              ))}
            </div>

            {exerciseLoading && <div style={styles.center}><IonSpinner /></div>}
            {exerciseError && <IonText color="danger"><p>{exerciseError}</p></IonText>}
            {exerciseResults.map((ex, i) => (
              <ExerciseRow key={`${ex.providerId}-${i}`} exercise={ex} />
            ))}
          </IonCardContent>
        </IonCard>

        {/* ================================================================
            SECTION 4 — Calories Burned Calculator
            ================================================================ */}
        <IonCard style={{ marginBottom: 'calc(env(safe-area-inset-bottom) + 120px)' }}>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={flameOutline} style={{ marginRight: 8 }} />
              {t('fatSecretCtx.caloriesBurned.title')}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {/* Select exercise */}
            <IonItem lines="full">
              <IonLabel position="stacked">{t('fatSecretCtx.caloriesBurned.selectExercise')}</IonLabel>
              <IonSelect
                value={selExercise?.providerId}
                onIonChange={(e) => {
                  const ex = exerciseResults.find((x) => x.providerId === e.detail.value);
                  setSelExercise(ex ?? null);
                }}
                placeholder={t('fatSecretCtx.caloriesBurned.selectExercise')}
              >
                {exerciseResults.map((ex) => (
                  <IonSelectOption key={ex.providerId} value={ex.providerId}>
                    {ex.name} (MET {ex.met})
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem lines="full">
              <IonLabel position="stacked">{t('fatSecretCtx.caloriesBurned.weight')}</IonLabel>
              <IonInput
                type="number"
                value={weight}
                onIonChange={(e) => setWeight(e.detail.value ?? '70')}
                min="20"
                max="300"
                step="0.5"
              />
            </IonItem>

            <IonItem lines="full" style={{ marginBottom: 12 }}>
              <IonLabel position="stacked">{t('fatSecretCtx.caloriesBurned.minutes')}</IonLabel>
              <IonInput
                type="number"
                value={minutes}
                onIonChange={(e) => setMinutes(e.detail.value ?? '30')}
                min="1"
                max="480"
              />
            </IonItem>

            <IonButton
              expand="block"
              onClick={handleCalcBurn}
              disabled={!selExercise || caloriesBurnedLoading}
            >
              {caloriesBurnedLoading
                ? <IonSpinner name="dots" />
                : <><IonIcon icon={flameOutline} slot="start" />{t('fatSecretCtx.caloriesBurned.calculate')}</>
              }
            </IonButton>

            {caloriesBurnedError && (
              <IonText color="danger"><p style={{ marginTop: 8 }}>{caloriesBurnedError}</p></IonText>
            )}

            {caloriesBurnedResult && (
              <div style={styles.resultBox}>
                <span style={styles.resultNumber}>{caloriesBurnedResult.caloriesBurned}</span>
                <span style={styles.resultLabel}>{t('fatSecretCtx.caloriesBurned.result')}</span>
                <span style={styles.resultSub}>
                  {caloriesBurnedResult.met} MET · {caloriesBurnedResult.weightKg} kg · {caloriesBurnedResult.minutes} min
                </span>
              </div>
            )}
          </IonCardContent>
        </IonCard>

      </IonContent>
    </IonPage>
  );
}

// ---------------------------------------------------------------------------
// Inline styles (minimal, dark/light safe)
// ---------------------------------------------------------------------------
const styles = {
  center: { display: 'flex', justifyContent: 'center', padding: '16px 0' },
  row: {
    padding: '10px 0',
    borderBottom: '1px solid var(--ion-color-light)',
  },
  rowMain:  { display: 'flex', flexDirection: 'column', gap: 2 },
  rowName:  { fontSize: 15 },
  rowSub:   { fontSize: 12, color: 'var(--ion-color-medium)', marginTop: 2 },
  rowMacros:{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  macro:    { fontSize: 12, color: 'var(--ion-color-medium)' },
  recipeThumb: {
    width: 64, height: 64, objectFit: 'cover',
    borderRadius: 8, float: 'left', marginRight: 10, marginBottom: 4,
  },
  resultBox: {
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    background: 'var(--ion-color-primary)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  resultNumber: { fontSize: 48, fontWeight: 700, lineHeight: 1 },
  resultLabel:  { fontSize: 14, opacity: 0.9 },
  resultSub:    { fontSize: 12, opacity: 0.7 },
};
