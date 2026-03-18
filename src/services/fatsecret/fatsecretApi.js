// ---------------------------------------------------------------------------
// FatSecret client-side API service
//
// All functions call the Firebase Functions proxy — no secrets in the client.
// Base URL is controlled by VITE_API_BASE_URL (empty = same-origin production).
// ---------------------------------------------------------------------------
import { httpClient } from '../api/http.js';

// ---------------------------------------------------------------------------
// Food
// ---------------------------------------------------------------------------

/**
 * Extended food search via FatSecret v3 endpoint.
 *
 * @param {object} params
 * @param {string}  params.q
 * @param {number}  [params.page=0]
 * @param {number}  [params.maxResults=20]
 * @param {string}  [params.region]                e.g. 'US'
 * @param {boolean} [params.includeSubCategories=false]
 * @param {boolean} [params.defaultServing=true]
 */
export function searchFoods(params = {}) {
  const p = new URLSearchParams();
  if (params.q)                    p.set('q',                    params.q);
  if (params.page != null)         p.set('page',                 String(params.page));
  if (params.maxResults != null)   p.set('maxResults',           String(params.maxResults));
  if (params.region)               p.set('region',               params.region);
  if (params.includeSubCategories) p.set('includeSubCategories', '1');
  if (params.defaultServing === false) p.set('defaultServing',   '0');
  return httpClient(`/api/fatsecret/foods/search?${p}`);
}

/**
 * Fetch food brands (static list, heavily cached by proxy).
 * @param {string} [startsWithLetter]  Optional single letter filter
 * @param {number} [page=0]
 */
export function getBrands(startsWithLetter, page = 0) {
  const p = new URLSearchParams({ page: String(page) });
  if (startsWithLetter) p.set('startsWithLetter', startsWithLetter);
  return httpClient(`/api/fatsecret/brands?${p}`);
}

/**
 * Fetch food categories (static list, heavily cached by proxy).
 */
export function getCategories() {
  return httpClient('/api/fatsecret/categories');
}

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------

/**
 * Recipe search via FatSecret v3 endpoint.
 *
 * @param {object} params
 * @param {string}  [params.q]
 * @param {number}  [params.page=0]
 * @param {number}  [params.maxResults=20]
 * @param {string}  [params.recipeTypes]          Comma-separated
 * @param {boolean} [params.recipeTypesMatchAll=false]
 * @param {boolean} [params.mustHaveImages=false]
 * @param {number}  [params.caloriesFrom]
 * @param {number}  [params.caloriesTo]
 * @param {number}  [params.carbPctFrom]
 * @param {number}  [params.carbPctTo]
 * @param {number}  [params.proteinPctFrom]
 * @param {number}  [params.proteinPctTo]
 * @param {number}  [params.fatPctFrom]
 * @param {number}  [params.fatPctTo]
 * @param {number}  [params.prepTimeFrom]
 * @param {number}  [params.prepTimeTo]
 */
export function searchRecipes(params = {}) {
  const p = new URLSearchParams();
  const optional = (key, val) => { if (val != null) p.set(key, String(val)); };

  optional('q',                   params.q);
  optional('page',                params.page);
  optional('maxResults',          params.maxResults);
  optional('recipeTypes',         params.recipeTypes);
  optional('recipeTypesMatchAll', params.recipeTypesMatchAll ? '1' : undefined);
  optional('mustHaveImages',      params.mustHaveImages      ? '1' : undefined);
  optional('caloriesFrom',        params.caloriesFrom);
  optional('caloriesTo',          params.caloriesTo);
  optional('carbPctFrom',         params.carbPctFrom);
  optional('carbPctTo',           params.carbPctTo);
  optional('proteinPctFrom',      params.proteinPctFrom);
  optional('proteinPctTo',        params.proteinPctTo);
  optional('fatPctFrom',          params.fatPctFrom);
  optional('fatPctTo',            params.fatPctTo);
  optional('prepTimeFrom',        params.prepTimeFrom);
  optional('prepTimeTo',          params.prepTimeTo);

  return httpClient(`/api/fatsecret/recipes/search?${p}`);
}

/**
 * Fetch recipe types (static list, heavily cached by proxy).
 */
export function getRecipeTypes() {
  return httpClient('/api/fatsecret/recipe-types');
}

// ---------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------

/**
 * Fetch exercises (FatSecret endpoint with local fallback).
 * @param {object} [params]
 * @param {string} [params.intensity]  'light' | 'moderate' | 'strenuous'
 */
export function getExercises(params = {}) {
  const p = new URLSearchParams();
  if (params.intensity) p.set('intensity', params.intensity);
  return httpClient(`/api/fatsecret/exercises?${p}`);
}

// ---------------------------------------------------------------------------
// Barcode lookup
// ---------------------------------------------------------------------------

/**
 * Look up a food by barcode via the FatSecret proxy.
 * Returns the raw proxy response: { food: { food_id, food_name, servings... } }
 * or null-ish when not found.
 *
 * @param {string} barcode  EAN-13 / UPC barcode string
 */
export function getFoodByBarcode(barcode) {
  const params = new URLSearchParams({ code: String(barcode) });
  return httpClient(`/api/fatsecret/barcode?${params}`);
}

// ---------------------------------------------------------------------------
// Calories burned calculator
// ---------------------------------------------------------------------------

/**
 * Calculate calories burned via proxy (pure math, no upstream API).
 * @param {{ weightKg: number, minutes: number, met: number }} payload
 */
export function calculateCaloriesBurned(payload) {
  return httpClient('/api/fatsecret/calories-burned', {
    method: 'POST',
    body:   payload,
  });
}
