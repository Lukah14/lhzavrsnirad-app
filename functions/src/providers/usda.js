'use strict';
const fetch = require('node-fetch');
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const PAGE_SIZE = 20;
/**
 * Search USDA FoodData Central.
 * API key is read from process.env.USDA_API_KEY.
 *
 * @param {string} term      Search query
 * @param {number} [page=1]  1-indexed page number
 * @returns {Promise<object>} Raw USDA search response
 */
async function searchFoods(term, page = 1) {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    const err = new Error('USDA_API_KEY is not configured');
    err.status = 500;
    throw err;
  }
  const params = new URLSearchParams({
    query:      term,
    pageNumber: String(page),
    pageSize:   String(PAGE_SIZE),
    api_key:    apiKey,
    // Prefer Survey (FNDDS) + Foundation + Branded in that order
    dataType:   'Survey (FNDDS),Foundation,Branded',
  });
  const url = `${USDA_BASE}/foods/search?${params}`;
  const res  = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (res.status === 403) {
    const err = new Error('Invalid USDA API key');
    err.status = 403;
    throw err;
  }
  if (res.status === 429) {
    const err = new Error('USDA rate limit exceeded');
    err.status = 429;
    throw err;
  }
  if (!res.ok) {
    const err = new Error(`USDA search failed: HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
module.exports = { searchFoods, PAGE_SIZE };