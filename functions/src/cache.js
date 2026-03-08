'use strict';
// ---------------------------------------------------------------------------
// Shared LRU cache — used by all proxy route handlers in app.js.
//
// lru-cache v10 API:
//   cache.get(key)           → value | undefined
//   cache.set(key, value, { ttl }) → cache (ttl in ms, overrides default)
//   cache.has(key)           → boolean
// ---------------------------------------------------------------------------
const { LRUCache } = require('lru-cache');

/** Default TTL: 10 minutes */
const DEFAULT_TTL_MS = 10 * 60 * 1000;

const cache = new LRUCache({
  max:            500,           // max number of cached entries
  ttl:            DEFAULT_TTL_MS,
  allowStale:     false,
  updateAgeOnGet: false,
});

// Pre-defined TTL constants for callers to use
const TTL = {
  SHORT:     5  * 60 * 1000,   //  5 min  — search results
  DEFAULT:   10 * 60 * 1000,   // 10 min  — general
  LONG:      60 * 60 * 1000,   // 60 min  — static lists (brands, categories, recipe types)
};

module.exports = { cache, TTL };
