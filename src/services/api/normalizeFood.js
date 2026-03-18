// ---------------------------------------------------------------------------
// normalizeFood.js
//
// Converts raw API responses from OpenFoodFacts, USDA FoodData Central,
// FatSecret, and internal Firestore records into a single NormalizedFood shape.
//
// Unified shape:
// {
//   source:       "internal" | "off" | "usda" | "fatsecret" | "user",
//   externalId:   string,           // barcode (OFF) | fdcId (USDA) | food_id (FatSecret)
//   name:         string,
//   brand?:       string,
//   imageUrl?:    string,
//   barcode?:     string,
//   per100g: {
//     kcal:     number,
//     protein:  number,
//     carbs:    number,
//     fat:      number,
//     sugar?:   number,
//     fiber?:   number,
//     salt?:    number,            // grams (sodium × 2.5 / 1000)
//   },
//   servingGrams?: number,
//   raw?:         object           // stripped before Firestore writes
// }
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------
const safeNum = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : undefined;
};
/** sodium mg → salt g  (NaCl = Na × 2.54, rounded convention: × 2.5) */
const sodiumMgToSaltG = (mg) => {
  const n = safeNum(mg);
  return n !== undefined ? n * 2.5 / 1000 : undefined;
};
// ---------------------------------------------------------------------------
// OpenFoodFacts
// ---------------------------------------------------------------------------
/**
 * Normalize a single OFF v3 product object.
 * Handles per-100g values; if only per-serving values exist, scales to 100g.
 *
 * @param {object} product  The `.product` field from OFF API response
 * @returns {NormalizedFood | null}
 */
export function normalizeOFFProduct(product) {
  if (!product) return null;
  const n = product.nutriments ?? {};
  // OFF stores _100g and _serving variants. Prefer _100g; fall back to _serving scaled.
  const get100g = (key) => {
    if (n[`${key}_100g`] !== undefined) return safeNum(n[`${key}_100g`]);
    // Attempt serving → 100g conversion
    const serving = safeNum(n[`${key}_serving`]);
    const servingSize = parseFloat(product.serving_size ?? product.serving_quantity ?? '0');
    if (serving !== undefined && servingSize > 0) {
      return (serving / servingSize) * 100;
    }
    return undefined;
  };
  const kcal    = get100g('energy-kcal') ?? safeNum(n['energy_100g']) ? safeNum(n['energy_100g']) / 4.184 : undefined;
  const protein = get100g('proteins');
  const carbs   = get100g('carbohydrates');
  const fat     = get100g('fat');
  // We need at least kcal + one macro to consider the entry usable
  if (kcal === undefined && protein === undefined) return null;
  const salt    = get100g('salt') ?? sodiumMgToSaltG(get100g('sodium') !== undefined ? get100g('sodium') * 1000 : undefined);
  const serving = parseFloat(product.serving_size ?? product.serving_quantity ?? '0');
  return {
    source:       'off',
    externalId:   String(product.code ?? product._id ?? ''),
    name:         (product.product_name_en || product.product_name || '').trim(),
    brand:        product.brands?.split(',')[0].trim() || undefined,
    imageUrl:     product.image_front_url || undefined,
    barcode:      String(product.code ?? product._id ?? '') || undefined,
    per100g: {
      kcal:    round2(kcal ?? 0),
      protein: round2(protein ?? 0),
      carbs:   round2(carbs ?? 0),
      fat:     round2(fat ?? 0),
      sugar:   roundOpt(get100g('sugars')),
      fiber:   roundOpt(get100g('fiber')),
      salt:    roundOpt(salt),
    },
    servingGrams: serving > 0 ? serving : undefined,
    raw: product,
  };
}
/**
 * Normalize an OFF search response into an array of NormalizedFood.
 *
 * @param {object} offSearchResponse  Raw response from /api/off/search
 * @returns {NormalizedFood[]}
 */
export function normalizeOFFSearchResults(offSearchResponse) {
  const products = offSearchResponse?.products ?? [];
  return products
    .map((p) => normalizeOFFProduct(p))
    .filter(Boolean);
}
// ---------------------------------------------------------------------------
// USDA FoodData Central
// ---------------------------------------------------------------------------
// Nutrient ID → field mapping
const USDA_NUTRIENT_MAP = {
  1008: 'kcal',
  1003: 'protein',
  1005: 'carbs',
  1004: 'fat',
  2000: 'sugar',
  1079: 'fiber',
  1093: 'sodium', // mg — converted to salt below
};
/**
 * Normalize a single USDA food item from the search results array.
 *
 * @param {object} food  One item from `response.foods[]`
 * @returns {NormalizedFood | null}
 */
export function normalizeUSDAFood(food) {
  if (!food) return null;
  const nutrients = {};
  for (const fn of food.foodNutrients ?? []) {
    const field = USDA_NUTRIENT_MAP[fn.nutrientId];
    if (field) nutrients[field] = safeNum(fn.value);
  }
  const { kcal, protein, carbs, fat, sugar, fiber, sodium } = nutrients;
  if (kcal === undefined && protein === undefined) return null;
  return {
    source:     'usda',
    externalId: String(food.fdcId ?? ''),
    name:       (food.description ?? '').trim(),
    brand:      food.brandOwner?.trim() || food.brandName?.trim() || undefined,
    per100g: {
      kcal:    round2(kcal ?? 0),
      protein: round2(protein ?? 0),
      carbs:   round2(carbs ?? 0),
      fat:     round2(fat ?? 0),
      sugar:   roundOpt(sugar),
      fiber:   roundOpt(fiber),
      salt:    roundOpt(sodiumMgToSaltG(sodium)),
    },
    raw: food,
  };
}
/**
 * Normalize a USDA search response.
 *
 * @param {object} usdaResponse  Raw response from /api/usda/search
 * @returns {NormalizedFood[]}
 */
export function normalizeUSDASearchResults(usdaResponse) {
  const foods = usdaResponse?.foods ?? [];
  return foods.map(normalizeUSDAFood).filter(Boolean);
}
// ---------------------------------------------------------------------------
// FatSecret
// ---------------------------------------------------------------------------
/**
 * FatSecret servings.serving can be a single object OR an array.
 * We prefer:
 *  1. A serving whose description contains "100g"
 *  2. Any serving whose metric_serving_unit is "g"
 *  3. The first serving as a fallback
 */
function pickBestServing(servings) {
  const raw = servings?.serving;
  if (!raw) return null;
  const list = Array.isArray(raw) ? raw : [raw];
  const per100g = list.find((s) =>
    (s.serving_description ?? '').toLowerCase().includes('100')
  );
  if (per100g) return per100g;
  const gramsServing = list.find((s) => s.metric_serving_unit === 'g');
  if (gramsServing) return gramsServing;
  return list[0] ?? null;
}
/**
 * Normalize a single FatSecret food item.
 *
 * @param {object} food  One item from `response.foods.food[]`
 * @returns {NormalizedFood | null}
 */
export function normalizeFatSecretFood(food) {
  if (!food) return null;
  const serving = pickBestServing(food.servings);
  if (!serving) return null;
  const servingGrams = parseFloat(serving.metric_serving_amount ?? '100');
  if (!servingGrams || servingGrams <= 0) return null;
  // Convert serving values → per-100g
  const factor = 100 / servingGrams;
  const kcal    = safeNum(serving.calories);
  const protein = safeNum(serving.protein);
  const carbs   = safeNum(serving.carbohydrate);
  const fat     = safeNum(serving.fat);
  const sugar   = safeNum(serving.sugar);
  const fiber   = safeNum(serving.fiber);
  const sodium  = safeNum(serving.sodium); // mg
  if (kcal === undefined && protein === undefined) return null;
  return {
    source:     'fatsecret',
    externalId: String(food.food_id ?? ''),
    name:       (food.food_name ?? '').trim(),
    brand:      food.brand_name?.trim() || undefined,
    per100g: {
      kcal:    round2((kcal   ?? 0) * factor),
      protein: round2((protein ?? 0) * factor),
      carbs:   round2((carbs  ?? 0) * factor),
      fat:     round2((fat    ?? 0) * factor),
      sugar:   roundOpt(sugar  !== undefined ? sugar  * factor : undefined),
      fiber:   roundOpt(fiber  !== undefined ? fiber  * factor : undefined),
      salt:    roundOpt(sodium !== undefined ? sodiumMgToSaltG(sodium * factor) : undefined),
    },
    servingGrams: servingGrams !== 100 ? servingGrams : undefined,
    raw: food,
  };
}
/**
 * Normalize a FatSecret search response.
 *
 * @param {object} fsResponse  Raw response from /api/fatsecret/search
 * @returns {NormalizedFood[]}
 */
export function normalizeFatSecretSearchResults(fsResponse) {
  const raw  = fsResponse?.foods?.food;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(normalizeFatSecretFood).filter(Boolean);
}
// ---------------------------------------------------------------------------
// Internal (Firestore) food record
// ---------------------------------------------------------------------------
/**
 * Normalize a Firestore food document (curated or user-created).
 * Assumes the document already roughly follows the NormalizedFood shape.
 *
 * @param {string} id   Firestore document ID
 * @param {object} data Document data
 * @param {'internal'|'user'} [source]
 * @returns {NormalizedFood}
 */
export function normalizeFirestoreFood(id, data, source = 'internal') {
  return {
    source,
    externalId:   data.externalId ?? id,
    name:         data.name ?? '',
    brand:        data.brand   || undefined,
    imageUrl:     data.imageUrl || undefined,
    barcode:      data.barcode  || undefined,
    per100g: {
      kcal:    round2(data.per100g?.kcal    ?? 0),
      protein: round2(data.per100g?.protein ?? 0),
      carbs:   round2(data.per100g?.carbs   ?? 0),
      fat:     round2(data.per100g?.fat     ?? 0),
      sugar:   roundOpt(data.per100g?.sugar),
      fiber:   roundOpt(data.per100g?.fiber),
      salt:    roundOpt(data.per100g?.salt),
    },
    servingGrams: data.servingGrams || undefined,
    // No `raw` for internal records
  };
}
// ---------------------------------------------------------------------------
// De-duplication
// ---------------------------------------------------------------------------
/**
 * Remove duplicates from a merged list.
 * Priority: internal > off > usda > fatsecret > user
 * Match by: barcode (exact) → name+brand (case-insensitive)
 *
 * @param {NormalizedFood[]} foods
 * @returns {NormalizedFood[]}
 */
export function deduplicateFoods(foods) {
  // FatSecret is the primary external source — it takes priority over OFF and USDA
  const SOURCE_PRIORITY = { internal: 0, fatsecret: 1, off: 2, usda: 3, user: 4 };
  // Dedupe by barcode
  const byBarcode = new Map();
  const noBarcode = [];
  for (const food of foods) {
    if (food.barcode) {
      const existing = byBarcode.get(food.barcode);
      if (!existing || SOURCE_PRIORITY[food.source] < SOURCE_PRIORITY[existing.source]) {
        byBarcode.set(food.barcode, food);
      }
    } else {
      noBarcode.push(food);
    }
  }
  // Among non-barcoded foods, dedupe by normalised name+brand
  const byNameBrand = new Map();
  for (const food of noBarcode) {
    const key = `${food.name.toLowerCase().trim()}|${(food.brand ?? '').toLowerCase().trim()}`;
    const existing = byNameBrand.get(key);
    if (!existing || SOURCE_PRIORITY[food.source] < SOURCE_PRIORITY[existing.source]) {
      byNameBrand.set(key, food);
    }
  }
  return [...byBarcode.values(), ...byNameBrand.values()];
}
// ---------------------------------------------------------------------------
// Compute a per-serving breakdown from per-100g + serving grams
// ---------------------------------------------------------------------------
/**
 * Given a NormalizedFood and a portion in grams, returns the macro breakdown.
 *
 * @param {NormalizedFood} food
 * @param {number} grams
 * @returns {{ kcal: number, protein: number, carbs: number, fat: number, sugar?: number, fiber?: number, salt?: number }}
 */
export function computeServing(food, grams) {
  const factor = grams / 100;
  const p = food.per100g;
  return {
    kcal:    round2(p.kcal    * factor),
    protein: round2(p.protein * factor),
    carbs:   round2(p.carbs   * factor),
    fat:     round2(p.fat     * factor),
    sugar:   p.sugar !== undefined ? round2(p.sugar * factor) : undefined,
    fiber:   p.fiber !== undefined ? round2(p.fiber * factor) : undefined,
    salt:    p.salt  !== undefined ? round2(p.salt  * factor) : undefined,
  };
}
// ---------------------------------------------------------------------------
// Rounding helpers
// ---------------------------------------------------------------------------
function round2(n)    { return Math.round(n * 100) / 100; }
function roundOpt(n)  { return n !== undefined && Number.isFinite(n) ? round2(n) : undefined; }