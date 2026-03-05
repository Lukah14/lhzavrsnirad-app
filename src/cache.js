'use strict';
const { LRUCache } = require('lru-cache');
// ---------------------------------------------------------------------------
// TTL constants (milliseconds)
// ---------------------------------------------------------------------------
const TTL = {
  OFF:     10 * 60 * 1000, // 10 minutes  — OpenFoodFacts
  USDA:    10 * 60 * 1000, // 10 minutes  — USDA FoodData Central
  FS:      30 * 60 * 1000, // 30 minutes  — FatSecret (token-bearing requests)
  DEFAULT: 10 * 60 * 1000,
};
// ---------------------------------------------------------------------------
// Single shared LRU cache (max 500 entries; each has its own TTL on set)
// ---------------------------------------------------------------------------
const lru = new LRUCache({
  max: 500,
  // Default TTL; individual calls can override via the set() wrapper below.
  ttl: TTL.DEFAULT,
  allowStale: false,
  updateAgeOnGet: false,
});
module.exports = {
  /**
   * Return cached value or undefined.
   * @param {string} key
   */
  get(key) {
    return lru.get(key);
  },
  /**
   * Store a value with an optional TTL in milliseconds.
   * @param {string} key
   * @param {any}    value
   * @param {number} [ttl]   Defaults to TTL.DEFAULT
   */
  set(key, value, ttl = TTL.DEFAULT) {
    lru.set(key, value, { ttl });
  },
  /** @param {string} key */
  has(key) {
    return lru.has(key);
  },
  /** Manually evict a key (e.g. after an upstream error on a cached entry). */
  del(key) {
    lru.delete(key);
  },
  TTL,
};