'use strict';
// ---------------------------------------------------------------------------
// Express application — all /api/* proxy routes
//
// Mounted by functions/src/index.js as a Firebase Cloud Function.
// Routes:
//   OFF:        GET /api/off/product   GET /api/off/search
//   USDA:       GET /api/usda/search
//   FatSecret:  GET /api/fatsecret/foods/search     (primary — v3)
//               GET /api/fatsecret/barcode          (primary barcode lookup)
//               GET /api/fatsecret/search           (legacy v1 — kept for compatibility)
//               GET /api/fatsecret/brands
//               GET /api/fatsecret/categories
//               GET /api/fatsecret/recipes/search
//               GET /api/fatsecret/recipe-types
//               GET /api/fatsecret/exercises
//               POST /api/fatsecret/calories-burned
// ---------------------------------------------------------------------------
const express     = require('express');
const cors        = require('cors');
const { cache, TTL } = require('./cache');
const rateLimiter = require('./rateLimiter');
const off         = require('./providers/off');
const usda        = require('./providers/usda');
const fs          = require('./providers/fatSecret');

const app = express();
app.use(express.json());

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0
    ? (origin, cb) => {
        // Allow requests with no origin (e.g. curl / server-to-server) in dev
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`CORS: origin ${origin} not allowed`));
      }
    : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Request-Id'],
}));

// ---------------------------------------------------------------------------
// Rate limiter
// ---------------------------------------------------------------------------
app.use(rateLimiter);

// ---------------------------------------------------------------------------
// Request-ID middleware
// ---------------------------------------------------------------------------
app.use((req, _res, next) => {
  req.requestId = req.headers['x-request-id']
    || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  next();
});

// ---------------------------------------------------------------------------
// Cache wrapper helper
// ---------------------------------------------------------------------------
/**
 * Wrap a provider function call with LRU caching.
 *
 * @param {string}   key   Cache key (usually the full request URL)
 * @param {Function} fn    Async function that returns data
 * @param {number}   ttl   TTL in ms (from TTL constants)
 */
async function withCache(key, fn, ttl = TTL.DEFAULT) {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const data = await fn();
  cache.set(key, data, { ttl });
  return data;
}

// ---------------------------------------------------------------------------
// Consistent error response
// ---------------------------------------------------------------------------
function sendError(res, err, provider, requestId) {
  const status    = err.status || 500;
  const code      = err.code   || (status === 429 ? 'RATE_LIMIT' : status >= 500 ? 'SERVER_ERROR' : 'REQUEST_ERROR');
  const message   = err.message || 'An unexpected error occurred.';
  console.error(`[${provider}] ${code}: ${message}`);
  return res.status(status).json({ code, message, provider, status, requestId });
}

// ===========================================================================
// OpenFoodFacts routes
// ===========================================================================

// GET /api/off/product?barcode=
app.get('/api/off/product', async (req, res) => {
  const { barcode } = req.query;
  if (!barcode) return res.status(400).json({ code: 'MISSING_PARAM', message: 'barcode is required', provider: 'off' });
  try {
    const data = await withCache(`off:product:${barcode}`, () => off.getProductByBarcode(barcode), TTL.DEFAULT);
    return res.json(data);
  } catch (err) {
    return sendError(res, err, 'off', req.requestId);
  }
});

// GET /api/off/search?term=&page=
app.get('/api/off/search', async (req, res) => {
  const { term = '', page = '1' } = req.query;
  const key = `off:search:${term}:${page}`;
  try {
    const data = await withCache(key, () => off.searchProducts(term, Number(page)), TTL.DEFAULT);
    return res.json(data);
  } catch (err) {
    return sendError(res, err, 'off', req.requestId);
  }
});

// ===========================================================================
// USDA routes
// ===========================================================================

// GET /api/usda/search?term=&page=
app.get('/api/usda/search', async (req, res) => {
  const { term = '', page = '1' } = req.query;
  const key = `usda:search:${term}:${page}`;
  try {
    const data = await withCache(key, () => usda.searchFoods(term, Number(page)), TTL.DEFAULT);
    return res.json(data);
  } catch (err) {
    return sendError(res, err, 'usda', req.requestId);
  }
});

// ===========================================================================
// FatSecret routes
// ===========================================================================

// GET /api/fatsecret/search?term=&page=  (legacy — kept for FoodSearchContext compatibility)
app.get('/api/fatsecret/search', async (req, res) => {
  const { term = '', page = '0' } = req.query;
  const key = `fs:search:${term}:${page}`;
  try {
    const data = await withCache(key, () => fs.searchFoods(term, Number(page)), TTL.SHORT);
    return res.json(data);
  } catch (err) {
    return sendError(res, err, 'fatsecret', req.requestId);
  }
});

// GET /api/fatsecret/foods/search?q=&page=&maxResults=&region=&includeSubCategories=&defaultServing=
app.get('/api/fatsecret/foods/search', async (req, res) => {
  const {
    q = '', page = '0', maxResults = '20',
    region, includeSubCategories = '0', defaultServing = '1',
  } = req.query;
  const key = `fs:foods-search:${q}:${page}:${maxResults}:${region}:${includeSubCategories}:${defaultServing}`;
  try {
    const data = await withCache(key, () => fs.searchFoodsExtended({
      q,
      page:                Number(page),
      maxResults:          Number(maxResults),
      region,
      includeSubCategories: includeSubCategories === '1' || includeSubCategories === 'true',
      defaultServing:       defaultServing === '1' || defaultServing === 'true',
    }), TTL.SHORT);
    return res.json(data);
  } catch (err) {
    return sendError(res, err, 'fatsecret', req.requestId);
  }
});

// GET /api/fatsecret/barcode?code=  (primary barcode lookup)
app.get('/api/fatsecret/barcode', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ code: 'MISSING_PARAM', message: 'code is required', provider: 'fatsecret' });
  const key = `fs:barcode:${code}`;
  try {
    const data = await withCache(key, () => fs.findByBarcode(code), TTL.DEFAULT);
    return res.json(data);
  } catch (err) {
    return sendError(res, err, 'fatsecret', req.requestId);
  }
});

// GET /api/fatsecret/brands?startsWithLetter=&page=
app.get('/api/fatsecret/brands', async (req, res) => {
  const { startsWithLetter, page = '0' } = req.query;
  const key = `fs:brands:${startsWithLetter || ''}:${page}`;
  try {
    const data = await withCache(key, () => fs.getFoodBrands(startsWithLetter, Number(page)), TTL.LONG);
    return res.json(data);
  } catch (err) {
    return sendError(res, err, 'fatsecret', req.requestId);
  }
});

// GET /api/fatsecret/categories
app.get('/api/fatsecret/categories', async (req, res) => {
  try {
    const data = await withCache('fs:categories', () => fs.getFoodCategories(), TTL.LONG);
    return res.json(data);
  } catch (err) {
    return sendError(res, err, 'fatsecret', req.requestId);
  }
});

// GET /api/fatsecret/recipes/search
app.get('/api/fatsecret/recipes/search', async (req, res) => {
  const {
    q = '', page = '0', maxResults = '20',
    recipeTypes, recipeTypesMatchAll = '0', mustHaveImages = '0',
    caloriesFrom, caloriesTo,
    carbPctFrom, carbPctTo,
    proteinPctFrom, proteinPctTo,
    fatPctFrom, fatPctTo,
    prepTimeFrom, prepTimeTo,
  } = req.query;

  const key = `fs:recipes:${JSON.stringify(req.query)}`;
  try {
    const data = await withCache(key, () => fs.searchRecipes({
      q, page: Number(page), maxResults: Number(maxResults),
      recipeTypes,
      recipeTypesMatchAll: recipeTypesMatchAll === '1' || recipeTypesMatchAll === 'true',
      mustHaveImages:      mustHaveImages === '1'      || mustHaveImages === 'true',
      caloriesFrom:   caloriesFrom   != null ? Number(caloriesFrom)   : undefined,
      caloriesTo:     caloriesTo     != null ? Number(caloriesTo)     : undefined,
      carbPctFrom:    carbPctFrom    != null ? Number(carbPctFrom)    : undefined,
      carbPctTo:      carbPctTo      != null ? Number(carbPctTo)      : undefined,
      proteinPctFrom: proteinPctFrom != null ? Number(proteinPctFrom) : undefined,
      proteinPctTo:   proteinPctTo   != null ? Number(proteinPctTo)   : undefined,
      fatPctFrom:     fatPctFrom     != null ? Number(fatPctFrom)     : undefined,
      fatPctTo:       fatPctTo       != null ? Number(fatPctTo)       : undefined,
      prepTimeFrom:   prepTimeFrom   != null ? Number(prepTimeFrom)   : undefined,
      prepTimeTo:     prepTimeTo     != null ? Number(prepTimeTo)     : undefined,
    }), TTL.SHORT);
    return res.json(data);
  } catch (err) {
    return sendError(res, err, 'fatsecret', req.requestId);
  }
});

// GET /api/fatsecret/recipe-types
app.get('/api/fatsecret/recipe-types', async (req, res) => {
  try {
    const data = await withCache('fs:recipe-types', () => fs.getRecipeTypes(), TTL.LONG);
    return res.json(data);
  } catch (err) {
    return sendError(res, err, 'fatsecret', req.requestId);
  }
});

// GET /api/fatsecret/exercises?intensity=
app.get('/api/fatsecret/exercises', async (req, res) => {
  const { intensity } = req.query;
  const key = `fs:exercises:${intensity || 'all'}`;
  try {
    const data = await withCache(key, () => fs.getExercises(intensity), TTL.LONG);
    return res.json(data);
  } catch (err) {
    return sendError(res, err, 'fatsecret', req.requestId);
  }
});

// POST /api/fatsecret/calories-burned
// Body: { weightKg, minutes, met }
app.post('/api/fatsecret/calories-burned', (req, res) => {
  const { weightKg, minutes, met } = req.body || {};
  if (weightKg == null || minutes == null || met == null) {
    return res.status(400).json({
      code:    'MISSING_PARAMS',
      message: 'weightKg, minutes, and met are required.',
      status:  400,
    });
  }
  const w = parseFloat(weightKg);
  const m = parseFloat(minutes);
  const v = parseFloat(met);
  if (isNaN(w) || isNaN(m) || isNaN(v) || w <= 0 || m <= 0 || v <= 0) {
    return res.status(400).json({
      code:    'INVALID_PARAMS',
      message: 'weightKg, minutes, and met must be positive numbers.',
      status:  400,
    });
  }
  // kcal = MET × weight(kg) × time(hours)
  const caloriesBurned = Math.round(v * w * (m / 60));
  return res.json({ caloriesBurned, weightKg: w, minutes: m, met: v });
});

// ---------------------------------------------------------------------------
// 404 catch-all
// ---------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Endpoint not found.', status: 404 });
});

module.exports = app;
