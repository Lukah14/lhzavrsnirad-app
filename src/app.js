'use strict';
const express    = require('express');
const cors       = require('cors');
const { v4: uuidv4 } = require('crypto'); // Node built-in; used for request IDs
const cache      = require('./cache');
const rateLimiter = require('./rateLimiter');
const off        = require('./providers/off');
const usda       = require('./providers/usda');
const fatSecret  = require('./providers/fatSecret');
// ---------------------------------------------------------------------------
// CORS configuration
// ---------------------------------------------------------------------------
function buildCorsOptions() {
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    origin(origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl) or matching origins
      if (!origin || allowed.length === 0 || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Request-Id'],
    maxAge: 86400,
  };
}
// ---------------------------------------------------------------------------
// Error shape factory
// ---------------------------------------------------------------------------
function apiError(res, { code, message, provider, status, requestId }) {
  return res.status(status).json({ code, message, provider, status, requestId });
}
// ---------------------------------------------------------------------------
// Wrapper: check LRU cache, fetch on miss, store on success
// ---------------------------------------------------------------------------
/**
 * @param {string}   cacheKey   unique string for this request
 * @param {number}   ttl        cache TTL in ms
 * @param {Function} fetchFn    () => Promise<any>
 */
async function withCache(cacheKey, ttl, fetchFn) {
  const hit = cache.get(cacheKey);
  if (hit !== undefined) return { data: hit, fromCache: true };
  const data = await fetchFn();
  cache.set(cacheKey, data, ttl);
  return { data, fromCache: false };
}
// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = express();
app.use(cors(buildCorsOptions()));
app.options('*', cors(buildCorsOptions()));
// Attach a request-ID to every request
app.use((req, _res, next) => {
  // crypto.randomUUID is available in Node 14.17+ / 15+
  req.requestId = crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  next();
});
// Rate limiter applied to all /api/* routes
app.use('/api', rateLimiter);
// ---------------------------------------------------------------------------
// GET /api/off/product?barcode=...
// ---------------------------------------------------------------------------
app.get('/api/off/product', async (req, res) => {
  const { barcode } = req.query;
  if (!barcode || !/^[\d]{6,14}$/.test(barcode.trim())) {
    return apiError(res, {
      code:      'INVALID_BARCODE',
      message:   'A valid numeric barcode (6–14 digits) is required.',
      provider:  'off',
      status:    400,
      requestId: req.requestId,
    });
  }
  const cacheKey = `off:product:${barcode}`;
  try {
    const { data } = await withCache(cacheKey, cache.TTL.OFF, () =>
      off.getProductByBarcode(barcode)
    );
    return res.json({ ...data, _requestId: req.requestId });
  } catch (err) {
    if (err.status === 404) {
      return apiError(res, {
        code:      'PRODUCT_NOT_FOUND',
        message:   `No product found for barcode ${barcode}.`,
        provider:  'off',
        status:    404,
        requestId: req.requestId,
      });
    }
    console.error('[off/product]', err.message);
    return apiError(res, {
      code:      'OFF_ERROR',
      message:   'OpenFoodFacts is currently unavailable. Please try again.',
      provider:  'off',
      status:    err.status >= 400 ? err.status : 502,
      requestId: req.requestId,
    });
  }
});
// ---------------------------------------------------------------------------
// GET /api/off/search?term=...&page=...
// ---------------------------------------------------------------------------
app.get('/api/off/search', async (req, res) => {
  const term = (req.query.term || '').trim();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  if (!term) {
    return apiError(res, {
      code:      'MISSING_TERM',
      message:   'Query parameter `term` is required.',
      provider:  'off',
      status:    400,
      requestId: req.requestId,
    });
  }
  const cacheKey = `off:search:${term.toLowerCase()}:${page}`;
  try {
    const { data } = await withCache(cacheKey, cache.TTL.OFF, () =>
      off.searchProducts(term, page)
    );
    return res.json({ ...data, _requestId: req.requestId });
  } catch (err) {
    console.error('[off/search]', err.message);
    return apiError(res, {
      code:      'OFF_ERROR',
      message:   'OpenFoodFacts is currently unavailable. Please try again.',
      provider:  'off',
      status:    err.status >= 400 ? err.status : 502,
      requestId: req.requestId,
    });
  }
});
// ---------------------------------------------------------------------------
// GET /api/usda/search?term=...&page=...
// ---------------------------------------------------------------------------
app.get('/api/usda/search', async (req, res) => {
  const term = (req.query.term || '').trim();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  if (!term) {
    return apiError(res, {
      code:      'MISSING_TERM',
      message:   'Query parameter `term` is required.',
      provider:  'usda',
      status:    400,
      requestId: req.requestId,
    });
  }
  const cacheKey = `usda:search:${term.toLowerCase()}:${page}`;
  try {
    const { data } = await withCache(cacheKey, cache.TTL.USDA, () =>
      usda.searchFoods(term, page)
    );
    return res.json({ ...data, _requestId: req.requestId });
  } catch (err) {
    if (err.status === 403) {
      console.error('[usda/search] Invalid API key');
      return apiError(res, {
        code:      'USDA_AUTH_ERROR',
        message:   'USDA API key is invalid or missing.',
        provider:  'usda',
        status:    502,
        requestId: req.requestId,
      });
    }
    if (err.status === 429) {
      return apiError(res, {
        code:      'USDA_RATE_LIMIT',
        message:   'USDA API rate limit reached. Try again shortly.',
        provider:  'usda',
        status:    429,
        requestId: req.requestId,
      });
    }
    console.error('[usda/search]', err.message);
    return apiError(res, {
      code:      'USDA_ERROR',
      message:   'USDA FoodData Central is currently unavailable.',
      provider:  'usda',
      status:    err.status >= 400 ? err.status : 502,
      requestId: req.requestId,
    });
  }
});
// ---------------------------------------------------------------------------
// GET /api/fatsecret/search?term=...&page=...
// ---------------------------------------------------------------------------
app.get('/api/fatsecret/search', async (req, res) => {
  const term = (req.query.term || '').trim();
  // FatSecret uses 0-based page numbers
  const page = Math.max(0, parseInt(req.query.page, 10) || 0);
  if (!term) {
    return apiError(res, {
      code:      'MISSING_TERM',
      message:   'Query parameter `term` is required.',
      provider:  'fatsecret',
      status:    400,
      requestId: req.requestId,
    });
  }
  const cacheKey = `fs:search:${term.toLowerCase()}:${page}`;
  try {
    const { data } = await withCache(cacheKey, cache.TTL.FS, () =>
      fatSecret.searchFoods(term, page)
    );
    return res.json({ ...data, _requestId: req.requestId });
  } catch (err) {
    if (err.status === 500) {
      console.error('[fatsecret/search] Credentials not configured');
      return apiError(res, {
        code:      'FS_CONFIG_ERROR',
        message:   'FatSecret credentials are not configured.',
        provider:  'fatsecret',
        status:    502,
        requestId: req.requestId,
      });
    }
    if (err.status === 429) {
      return apiError(res, {
        code:      'FS_RATE_LIMIT',
        message:   'FatSecret rate limit reached. Try again shortly.',
        provider:  'fatsecret',
        status:    429,
        requestId: req.requestId,
      });
    }
    console.error('[fatsecret/search]', err.message);
    return apiError(res, {
      code:      'FS_ERROR',
      message:   'FatSecret is currently unavailable.',
      provider:  'fatsecret',
      status:    err.status >= 400 ? err.status : 502,
      requestId: req.requestId,
    });
  }
});
// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});
// ---------------------------------------------------------------------------
// 404 catch-all for /api/*
// ---------------------------------------------------------------------------
app.use('/api', (req, res) => {
  res.status(404).json({
    code:      'NOT_FOUND',
    message:   `Unknown API route: ${req.method} ${req.path}`,
    provider:  null,
    status:    404,
    requestId: req.requestId,
  });
});
// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[express]', err.message);
  res.status(500).json({
    code:      'INTERNAL_ERROR',
    message:   'An unexpected server error occurred.',
    provider:  null,
    status:    500,
    requestId: req.requestId ?? null,
  });
});
module.exports = app;
