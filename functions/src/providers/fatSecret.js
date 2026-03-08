'use strict';
// ---------------------------------------------------------------------------
// FatSecret Platform API provider — OAuth 2.0 client credentials
//
// All endpoints use Bearer tokens obtained via:
//   POST https://oauth.fatsecret.com/connect/token
//   body: grant_type=client_credentials&scope=basic
//   auth: Basic base64(clientId:clientSecret)
//
// Token is cached in memory until near expiry and refreshed automatically.
// ---------------------------------------------------------------------------
const fetch = require('node-fetch');
const path  = require('path');

const FS_TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';
const FS_API_BASE  = 'https://platform.fatsecret.com/rest';
const PAGE_SIZE    = 20;

// ---------------------------------------------------------------------------
// OAuth 2.0 token cache
// ---------------------------------------------------------------------------
/** @type {{ token: string, expiresAt: number } | null} */
let tokenCache = null;

async function getAccessToken() {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  const clientId     = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    const err = new Error('FATSECRET_CLIENT_ID / FATSECRET_CLIENT_SECRET are not configured');
    err.status = 500;
    throw err;
  }
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(FS_TOKEN_URL, {
    method:  'POST',
    headers: {
      Authorization:  `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=basic',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err  = new Error(`FatSecret token request failed: HTTP ${res.status} — ${body}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  tokenCache = {
    token:     data.access_token,
    // Expire 60 s before real expiry to avoid race conditions
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return tokenCache.token;
}

// ---------------------------------------------------------------------------
// Shared fetch helper — handles 401 token-refresh retry
// ---------------------------------------------------------------------------
async function fetchWithToken(url, retried = false) {
  const token = await getAccessToken();
  const res   = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:        'application/json',
    },
  });

  if (res.status === 401 && !retried) {
    // Invalidate cached token and retry once
    tokenCache = null;
    return fetchWithToken(url, true);
  }
  if (res.status === 429) {
    const err = new Error('FatSecret rate limit exceeded');
    err.status = 429;
    throw err;
  }
  if (!res.ok) {
    const err = new Error(`FatSecret API error: HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Food search (original — used by FoodSearchContext via /api/fatsecret/search)
// ---------------------------------------------------------------------------
async function searchFoods(term, page = 0) {
  const params = new URLSearchParams({
    expression:  term,
    page_number: String(page),
    max_results: String(PAGE_SIZE),
    format:      'json',
  });
  return fetchWithToken(`${FS_API_BASE}/foods/search/v1?${params}`);
}

// ---------------------------------------------------------------------------
// Extended food search — v3 with food_type / brand_type fields
// ---------------------------------------------------------------------------
/**
 * @param {object} params
 * @param {string}  params.q
 * @param {number}  [params.page=0]
 * @param {number}  [params.maxResults=20]
 * @param {string}  [params.region]           e.g. 'US'
 * @param {boolean} [params.includeSubCategories=false]
 * @param {boolean} [params.defaultServing=true]
 */
async function searchFoodsExtended(params = {}) {
  const {
    q,
    page           = 0,
    maxResults     = PAGE_SIZE,
    region,
    includeSubCategories = false,
    defaultServing = true,
  } = params;

  const p = new URLSearchParams({
    search_expression:          q || '',
    page_number:                String(page),
    max_results:                String(maxResults),
    include_food_sub_categories: includeSubCategories ? '1' : '0',
    flag_default_serving:       defaultServing ? '1' : '0',
    format:                     'json',
  });
  if (region) p.set('region', region);

  return fetchWithToken(`${FS_API_BASE}/foods/search/v3?${p}`);
}

// ---------------------------------------------------------------------------
// Food brands
// ---------------------------------------------------------------------------
/**
 * @param {string} [startsWithLetter] Single letter filter (optional)
 * @param {number} [page=0]
 */
async function getFoodBrands(startsWithLetter, page = 0) {
  const p = new URLSearchParams({
    max_results:  String(50),
    page_number:  String(page),
    format:       'json',
  });
  if (startsWithLetter) p.set('starts_with', startsWithLetter.charAt(0));
  return fetchWithToken(`${FS_API_BASE}/food_brands?${p}`);
}

// ---------------------------------------------------------------------------
// Food categories (sub-categories)
// ---------------------------------------------------------------------------
async function getFoodCategories() {
  return fetchWithToken(`${FS_API_BASE}/food_sub_categories?format=json`);
}

// ---------------------------------------------------------------------------
// Recipe search — v3
// ---------------------------------------------------------------------------
/**
 * @param {object} params
 * @param {string}  [params.q]
 * @param {number}  [params.page=0]
 * @param {number}  [params.maxResults=20]
 * @param {string}  [params.recipeTypes]      Comma-separated type names
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
async function searchRecipes(params = {}) {
  const {
    q                   = '',
    page                = 0,
    maxResults          = PAGE_SIZE,
    recipeTypes,
    recipeTypesMatchAll = false,
    mustHaveImages      = false,
    caloriesFrom,  caloriesTo,
    carbPctFrom,   carbPctTo,
    proteinPctFrom,proteinPctTo,
    fatPctFrom,    fatPctTo,
    prepTimeFrom,  prepTimeTo,
  } = params;

  const p = new URLSearchParams({
    search_expression:       q,
    page_number:             String(page),
    max_results:             String(maxResults),
    recipe_types_match_all:  recipeTypesMatchAll ? '1' : '0',
    must_have_images:        mustHaveImages ? '1' : '0',
    format:                  'json',
  });
  if (recipeTypes)   p.set('recipe_types', recipeTypes);
  if (caloriesFrom != null) p.set('calories.from', String(caloriesFrom));
  if (caloriesTo   != null) p.set('calories.to',   String(caloriesTo));
  if (carbPctFrom  != null) p.set('carb_percentage.from', String(carbPctFrom));
  if (carbPctTo    != null) p.set('carb_percentage.to',   String(carbPctTo));
  if (proteinPctFrom != null) p.set('protein_percentage.from', String(proteinPctFrom));
  if (proteinPctTo   != null) p.set('protein_percentage.to',   String(proteinPctTo));
  if (fatPctFrom   != null) p.set('fat_percentage.from', String(fatPctFrom));
  if (fatPctTo     != null) p.set('fat_percentage.to',   String(fatPctTo));
  if (prepTimeFrom != null) p.set('prep_time.from', String(prepTimeFrom));
  if (prepTimeTo   != null) p.set('prep_time.to',   String(prepTimeTo));

  return fetchWithToken(`${FS_API_BASE}/recipes/search/v3?${p}`);
}

// ---------------------------------------------------------------------------
// Recipe types
// ---------------------------------------------------------------------------
async function getRecipeTypes() {
  return fetchWithToken(`${FS_API_BASE}/recipe_types/v2?format=json`);
}

// ---------------------------------------------------------------------------
// Exercises — try FatSecret endpoint first, fall back to local JSON
// ---------------------------------------------------------------------------
const LOCAL_EXERCISES = require('../data/exercises.json');

/**
 * @param {string} [intensity]  'light' | 'moderate' | 'strenuous' | undefined (= all)
 */
async function getExercises(intensity) {
  // Attempt FatSecret's exercise utility endpoint (may not be available on all plans)
  try {
    const p = new URLSearchParams({ format: 'json' });
    const data = await fetchWithToken(`${FS_API_BASE}/exercises.get?${p}`);
    // If FatSecret returned a usable list, normalise and return it
    const list = data?.exercises?.exercise;
    if (Array.isArray(list) && list.length > 0) {
      const normalised = list.map((e) => ({
        id:                  String(e.exercise_id ?? e.id ?? ''),
        name:                e.exercise_name  ?? e.name ?? '',
        intensity:           mapFSIntensity(e.exercise_category ?? ''),
        met:                 parseFloat(e.metabolic_equivalent ?? e.met ?? 0) || 0,
        caloriesPerHourPerKg: parseFloat(e.metabolic_equivalent ?? e.met ?? 0) || 0,
        source:              'fatsecret',
        raw:                 e,
      }));
      return intensity
        ? normalised.filter((e) => e.intensity === intensity)
        : normalised;
    }
  } catch (_) {
    // FatSecret endpoint unavailable — use local fallback silently
  }

  // Local fallback
  return intensity
    ? LOCAL_EXERCISES.filter((e) => e.intensity === intensity)
    : LOCAL_EXERCISES;
}

/** Map FatSecret exercise_category strings to our three intensity levels */
function mapFSIntensity(category) {
  const lower = (category || '').toLowerCase();
  if (lower.includes('light') || lower.includes('rest')) return 'light';
  if (lower.includes('heavy') || lower.includes('vigorous') || lower.includes('strenuous')) return 'strenuous';
  return 'moderate';
}

// ---------------------------------------------------------------------------
// Test helper
// ---------------------------------------------------------------------------
function _clearTokenCache() { tokenCache = null; }

module.exports = {
  // original
  searchFoods,
  // extended food
  searchFoodsExtended,
  getFoodBrands,
  getFoodCategories,
  // recipes
  searchRecipes,
  getRecipeTypes,
  // exercises
  getExercises,
  // utils
  PAGE_SIZE,
  _clearTokenCache,
};
