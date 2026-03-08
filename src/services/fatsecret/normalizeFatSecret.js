// ---------------------------------------------------------------------------
// FatSecret response normalizers (client-side)
//
// These consume the raw JSON returned by the Firebase Functions proxy and
// convert it to our internal shapes.
//
// NOTE: The existing normalizeFatSecretSearchResults in
// src/services/api/normalizeFood.js is kept untouched — it handles the
// legacy /api/fatsecret/search response used by FoodSearchContext.
// These new normalizers handle the richer v3 responses from the extended
// endpoints (/api/fatsecret/foods/search, recipes, brands, etc.).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const safeNum = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const safeStr = (v) => (typeof v === 'string' ? v.trim() : String(v ?? '').trim());

/**
 * Extract a nutrient value from a FatSecret serving object.
 * FatSecret stores macros directly on the serving: e.g. serving.calories, serving.protein, etc.
 */
function servingVal(serving, key) {
  return safeNum(serving?.[key]);
}

// ---------------------------------------------------------------------------
// Food — extended v3 response
// ---------------------------------------------------------------------------

/**
 * Normalize a single food object from the v3 foods/search/v3 endpoint.
 *
 * Raw food shape (food_type "Brand"):
 *   { food_id, food_name, brand_name, food_type, brand_type,
 *     food_description, servings: { serving: [...] } }
 *
 * @param {object} food  Raw food from FatSecret v3
 * @returns {NormalizedFSFood}
 */
export function normalizeFSFood(food) {
  if (!food) return null;

  // Pick the default serving (first in list, or only one)
  const servingsRaw = food.servings?.serving;
  const servingArr  = Array.isArray(servingsRaw) ? servingsRaw : servingsRaw ? [servingsRaw] : [];
  const serving     = servingArr.find((s) => s.is_default === '1') ?? servingArr[0] ?? null;

  // Attempt per-100g values if available (v3 sometimes includes them as serving_description "per 100g")
  const per100gServing = servingArr.find(
    (s) => (s.serving_description || '').toLowerCase().includes('100g')
  );

  const ref = per100gServing ?? serving;

  // Scale to per-100g if we have a metric_serving_amount
  const metricAmt = safeNum(ref?.metric_serving_amount);
  const scale = metricAmt > 0 ? 100 / metricAmt : 1;

  const calories = safeNum(ref?.calories)  * scale;
  const protein  = safeNum(ref?.protein)   * scale;
  const carbs    = safeNum(ref?.carbohydrate) * scale;
  const fat      = safeNum(ref?.fat)       * scale;
  const sugar    = safeNum(ref?.sugar)     * scale || undefined;
  const fiber    = safeNum(ref?.fiber)     * scale || undefined;

  return {
    source:      'fatsecret',
    providerId:  safeStr(food.food_id),
    name:        safeStr(food.food_name),
    brand:       safeStr(food.brand_name) || undefined,
    foodType:    safeStr(food.food_type),    // 'Brand' | 'Generic'
    brandType:   safeStr(food.brand_type),   // 'restaurant' | 'supermarket' | ''
    description: safeStr(food.food_description) || undefined,
    imageUrl:    safeStr(food.food_image_url) || undefined,
    region:      safeStr(food.region) || undefined,
    per100g: {
      kcal:    Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs:   Math.round(carbs   * 10) / 10,
      fat:     Math.round(fat     * 10) / 10,
      sugar:   sugar != null ? Math.round(sugar * 10) / 10 : undefined,
      fiber:   fiber != null ? Math.round(fiber * 10) / 10 : undefined,
    },
    serving: serving ? {
      description: safeStr(serving.serving_description),
      grams:       safeNum(serving.metric_serving_amount) || undefined,
      calories:    safeNum(serving.calories),
      protein:     safeNum(serving.protein),
      carbs:       safeNum(serving.carbohydrate),
      fat:         safeNum(serving.fat),
    } : undefined,
    raw: food,
  };
}

/**
 * Normalize the full foods/search/v3 response.
 *
 * Raw response: { foods_search: { results: { food: [...] }, max_results, total_results, page_number } }
 *
 * @param {object} response   Raw proxy response
 * @returns {{ items: NormalizedFSFood[], page: number, pageSize: number, totalResults: number, hasMore: boolean }}
 */
export function normalizeFoodSearchResponse(response) {
  const root       = response?.foods_search ?? {};
  const results    = root.results ?? {};
  const rawFoods   = results.food ?? [];
  const foodArr    = Array.isArray(rawFoods) ? rawFoods : [rawFoods];

  const page        = safeNum(root.page_number);
  const pageSize    = safeNum(root.max_results)   || 20;
  const totalResults= safeNum(root.total_results) || foodArr.length;

  const items = foodArr.map(normalizeFSFood).filter(Boolean);

  return {
    items,
    page,
    pageSize,
    totalResults,
    hasMore: (page + 1) * pageSize < totalResults,
  };
}

// ---------------------------------------------------------------------------
// Brands
// ---------------------------------------------------------------------------

/**
 * Normalize the food_brands response.
 * Raw: { food_brands: { food_brand: [...] } }
 *
 * @returns {{ id: string, name: string }[]}
 */
export function normalizeBrandList(response) {
  const raw = response?.food_brands?.food_brand ?? [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .map((b) => ({ id: safeStr(b.brand_id), name: safeStr(b.brand_name) }))
    .filter((b) => b.id && b.name);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

/**
 * Normalize the food_sub_categories response.
 * Raw: { food_sub_categories: { food_sub_category: [...] } }
 *
 * @returns {{ id: string, name: string }[]}
 */
export function normalizeCategoryList(response) {
  const raw = response?.food_sub_categories?.food_sub_category ?? [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .map((c) => ({ id: safeStr(c.food_sub_category_id ?? c.id), name: safeStr(c.food_sub_category_name ?? c.name) }))
    .filter((c) => c.name);
}

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------

/**
 * Normalize a single recipe object from FatSecret v3.
 *
 * @param {object} recipe  Raw recipe from FatSecret
 * @returns {NormalizedFSRecipe}
 */
export function normalizeFSRecipe(recipe) {
  if (!recipe) return null;

  const types = recipe.recipe_types?.recipe_type ?? [];
  const typeArr = Array.isArray(types) ? types : [types];

  // Nutrition is in recipe.recipe_nutrition
  const n = recipe.recipe_nutrition ?? {};

  return {
    source:          'fatsecret',
    providerId:      safeStr(recipe.recipe_id),
    name:            safeStr(recipe.recipe_name),
    description:     safeStr(recipe.recipe_description) || undefined,
    imageUrl:        safeStr(recipe.recipe_image) || undefined,
    recipeTypes:     typeArr.map(safeStr).filter(Boolean),
    calories:        safeNum(n.calories),
    protein:         safeNum(n.protein),
    carbs:           safeNum(n.carbohydrate),
    fat:             safeNum(n.fat),
    prepTimeMinutes: safeNum(recipe.preparation_time_min),
    raw:             recipe,
  };
}

/**
 * Normalize the full recipes/search/v3 response.
 *
 * Raw: { recipes: { recipe: [...], max_results, total_results, page_number } }
 *
 * @returns {{ items: NormalizedFSRecipe[], page: number, pageSize: number, totalResults: number, hasMore: boolean }}
 */
export function normalizeRecipeSearchResponse(response) {
  const root       = response?.recipes ?? {};
  const rawRecipes = root.recipe ?? [];
  const recipeArr  = Array.isArray(rawRecipes) ? rawRecipes : rawRecipes ? [rawRecipes] : [];

  const page         = safeNum(root.page_number);
  const pageSize     = safeNum(root.max_results)   || 20;
  const totalResults = safeNum(root.total_results) || recipeArr.length;

  const items = recipeArr.map(normalizeFSRecipe).filter(Boolean);

  return {
    items,
    page,
    pageSize,
    totalResults,
    hasMore: (page + 1) * pageSize < totalResults,
  };
}

// ---------------------------------------------------------------------------
// Recipe types
// ---------------------------------------------------------------------------

/**
 * Normalize the recipe_types/v2 response.
 * Raw: { recipe_types: { recipe_type: [...] } }
 *
 * @returns {{ id: string, name: string }[]}
 */
export function normalizeRecipeTypeList(response) {
  const raw = response?.recipe_types?.recipe_type ?? [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .map((t) => ({ id: safeStr(t.recipe_type_id ?? t.id ?? t), name: safeStr(t.recipe_type_name ?? t.name ?? t) }))
    .filter((t) => t.name);
}

// ---------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------

/**
 * Normalize the exercises list returned by the proxy
 * (either from FatSecret or from the local fallback JSON).
 *
 * Each item already has: { id, name, intensity, met, caloriesPerHourPerKg, source?, raw? }
 *
 * @returns {NormalizedFSExercise[]}
 */
export function normalizeExerciseList(response) {
  if (!Array.isArray(response)) return [];
  return response.map((e) => ({
    source:              e.source ?? 'local',
    providerId:          safeStr(e.id),
    name:                safeStr(e.name),
    intensity:           e.intensity ?? 'moderate',
    met:                 safeNum(e.met),
    caloriesPerHourPerKg: safeNum(e.caloriesPerHourPerKg ?? e.met),
    raw:                 e.raw ?? null,
  }));
}
