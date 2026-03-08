import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import * as api from '../services/fatsecret/fatsecretApi.js';
import {
  normalizeFoodSearchResponse,
  normalizeBrandList,
  normalizeCategoryList,
  normalizeRecipeSearchResponse,
  normalizeRecipeTypeList,
  normalizeExerciseList,
} from '../services/fatsecret/normalizeFatSecret.js';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const FatSecretContext = createContext(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function FatSecretProvider({ children }) {
  // -------------------------------------------------------------------------
  // Food search state
  // -------------------------------------------------------------------------
  const [foodResults,   setFoodResults]   = useState([]);
  const [foodPage,      setFoodPage]      = useState(0);
  const [foodTotal,     setFoodTotal]     = useState(0);
  const [foodHasMore,   setFoodHasMore]   = useState(false);
  const [foodLoading,   setFoodLoading]   = useState(false);
  const [foodError,     setFoodError]     = useState(null);
  const [lastFoodParams, setLastFoodParams] = useState(null);

  // -------------------------------------------------------------------------
  // Brands state
  // -------------------------------------------------------------------------
  const [brands,         setBrands]        = useState([]);
  const [brandsLoading,  setBrandsLoading] = useState(false);
  const [brandsError,    setBrandsError]   = useState(null);

  // -------------------------------------------------------------------------
  // Categories state
  // -------------------------------------------------------------------------
  const [categories,        setCategories]       = useState([]);
  const [categoriesLoading, setCategoriesLoading]= useState(false);
  const [categoriesError,   setCategoriesError]  = useState(null);

  // -------------------------------------------------------------------------
  // Recipe search state
  // -------------------------------------------------------------------------
  const [recipeResults,   setRecipeResults]   = useState([]);
  const [recipePage,      setRecipePage]      = useState(0);
  const [recipeTotal,     setRecipeTotal]     = useState(0);
  const [recipeHasMore,   setRecipeHasMore]   = useState(false);
  const [recipeLoading,   setRecipeLoading]   = useState(false);
  const [recipeError,     setRecipeError]     = useState(null);
  const [lastRecipeParams, setLastRecipeParams] = useState(null);

  // -------------------------------------------------------------------------
  // Recipe types state
  // -------------------------------------------------------------------------
  const [recipeTypes,        setRecipeTypes]       = useState([]);
  const [recipeTypesLoading, setRecipeTypesLoading]= useState(false);
  const [recipeTypesError,   setRecipeTypesError]  = useState(null);

  // -------------------------------------------------------------------------
  // Exercise state
  // -------------------------------------------------------------------------
  const [exerciseResults, setExerciseResults] = useState([]);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [exerciseError,   setExerciseError]   = useState(null);

  // -------------------------------------------------------------------------
  // Calories burned state
  // -------------------------------------------------------------------------
  const [caloriesBurnedResult,  setCaloriesBurnedResult]  = useState(null);
  const [caloriesBurnedLoading, setCaloriesBurnedLoading] = useState(false);
  const [caloriesBurnedError,   setCaloriesBurnedError]   = useState(null);

  // =========================================================================
  // Actions
  // =========================================================================

  // -------------------------------------------------------------------------
  // searchFoods
  // -------------------------------------------------------------------------
  const searchFoods = useCallback(async (params = {}, { append = false } = {}) => {
    setFoodLoading(true);
    setFoodError(null);
    if (!append) {
      setFoodResults([]);
      setLastFoodParams(params);
    }
    try {
      const raw        = await api.searchFoods(params);
      const normalised = normalizeFoodSearchResponse(raw);
      setFoodResults((prev) => append ? [...prev, ...normalised.items] : normalised.items);
      setFoodPage(normalised.page);
      setFoodTotal(normalised.totalResults);
      setFoodHasMore(normalised.hasMore);
    } catch (err) {
      setFoodError(err?.message ?? 'errors.fatsecret.food_failed');
    } finally {
      setFoodLoading(false);
    }
  }, []);

  /** Load the next page of food results using the same search params. */
  const loadMoreFoods = useCallback(() => {
    if (!foodLoading && foodHasMore && lastFoodParams) {
      searchFoods({ ...lastFoodParams, page: foodPage + 1 }, { append: true });
    }
  }, [foodLoading, foodHasMore, lastFoodParams, foodPage, searchFoods]);

  // -------------------------------------------------------------------------
  // loadBrands
  // -------------------------------------------------------------------------
  const loadBrands = useCallback(async (startsWithLetter, page = 0) => {
    setBrandsLoading(true);
    setBrandsError(null);
    try {
      const raw = await api.getBrands(startsWithLetter, page);
      setBrands(normalizeBrandList(raw));
    } catch (err) {
      setBrandsError(err?.message ?? 'errors.fatsecret.brands_failed');
    } finally {
      setBrandsLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // loadCategories
  // -------------------------------------------------------------------------
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const raw = await api.getCategories();
      setCategories(normalizeCategoryList(raw));
    } catch (err) {
      setCategoriesError(err?.message ?? 'errors.fatsecret.categories_failed');
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // searchRecipes
  // -------------------------------------------------------------------------
  const searchRecipes = useCallback(async (params = {}, { append = false } = {}) => {
    setRecipeLoading(true);
    setRecipeError(null);
    if (!append) {
      setRecipeResults([]);
      setLastRecipeParams(params);
    }
    try {
      const raw        = await api.searchRecipes(params);
      const normalised = normalizeRecipeSearchResponse(raw);
      setRecipeResults((prev) => append ? [...prev, ...normalised.items] : normalised.items);
      setRecipePage(normalised.page);
      setRecipeTotal(normalised.totalResults);
      setRecipeHasMore(normalised.hasMore);
    } catch (err) {
      setRecipeError(err?.message ?? 'errors.fatsecret.recipe_failed');
    } finally {
      setRecipeLoading(false);
    }
  }, []);

  /** Load the next page of recipe results. */
  const loadMoreRecipes = useCallback(() => {
    if (!recipeLoading && recipeHasMore && lastRecipeParams) {
      searchRecipes({ ...lastRecipeParams, page: recipePage + 1 }, { append: true });
    }
  }, [recipeLoading, recipeHasMore, lastRecipeParams, recipePage, searchRecipes]);

  // -------------------------------------------------------------------------
  // loadRecipeTypes
  // -------------------------------------------------------------------------
  const loadRecipeTypes = useCallback(async () => {
    setRecipeTypesLoading(true);
    setRecipeTypesError(null);
    try {
      const raw = await api.getRecipeTypes();
      setRecipeTypes(normalizeRecipeTypeList(raw));
    } catch (err) {
      setRecipeTypesError(err?.message ?? 'errors.fatsecret.recipe_types_failed');
    } finally {
      setRecipeTypesLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // searchExercises
  // -------------------------------------------------------------------------
  const searchExercises = useCallback(async (params = {}) => {
    setExerciseLoading(true);
    setExerciseError(null);
    try {
      const raw = await api.getExercises(params);
      setExerciseResults(normalizeExerciseList(raw));
    } catch (err) {
      setExerciseError(err?.message ?? 'errors.fatsecret.exercise_failed');
    } finally {
      setExerciseLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // calculateCaloriesBurned
  // -------------------------------------------------------------------------
  const calculateCaloriesBurned = useCallback(async ({ weightKg, minutes, met }) => {
    setCaloriesBurnedLoading(true);
    setCaloriesBurnedError(null);
    setCaloriesBurnedResult(null);
    try {
      const result = await api.calculateCaloriesBurned({ weightKg, minutes, met });
      setCaloriesBurnedResult(result);
      return result;
    } catch (err) {
      setCaloriesBurnedError(err?.message ?? 'errors.fatsecret.calc_failed');
      return null;
    } finally {
      setCaloriesBurnedLoading(false);
    }
  }, []);

  // =========================================================================
  // Context value
  // =========================================================================
  const value = useMemo(() => ({
    // Food
    foodResults,
    foodPage,
    foodTotal,
    foodHasMore,
    foodLoading,
    foodError,
    searchFoods,
    loadMoreFoods,
    // Brands
    brands,
    brandsLoading,
    brandsError,
    loadBrands,
    // Categories
    categories,
    categoriesLoading,
    categoriesError,
    loadCategories,
    // Recipes
    recipeResults,
    recipePage,
    recipeTotal,
    recipeHasMore,
    recipeLoading,
    recipeError,
    searchRecipes,
    loadMoreRecipes,
    // Recipe types
    recipeTypes,
    recipeTypesLoading,
    recipeTypesError,
    loadRecipeTypes,
    // Exercises
    exerciseResults,
    exerciseLoading,
    exerciseError,
    searchExercises,
    // Calories burned
    caloriesBurnedResult,
    caloriesBurnedLoading,
    caloriesBurnedError,
    calculateCaloriesBurned,
  }), [
    foodResults, foodPage, foodTotal, foodHasMore, foodLoading, foodError,
    searchFoods, loadMoreFoods,
    brands, brandsLoading, brandsError, loadBrands,
    categories, categoriesLoading, categoriesError, loadCategories,
    recipeResults, recipePage, recipeTotal, recipeHasMore, recipeLoading, recipeError,
    searchRecipes, loadMoreRecipes,
    recipeTypes, recipeTypesLoading, recipeTypesError, loadRecipeTypes,
    exerciseResults, exerciseLoading, exerciseError, searchExercises,
    caloriesBurnedResult, caloriesBurnedLoading, caloriesBurnedError, calculateCaloriesBurned,
  ]);

  return (
    <FatSecretContext.Provider value={value}>
      {children}
    </FatSecretContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useFatSecret() {
  const ctx = useContext(FatSecretContext);
  if (!ctx) throw new Error('useFatSecret must be used inside <FatSecretProvider>');
  return ctx;
}
