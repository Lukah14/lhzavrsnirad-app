'use strict';
const fetch = require('node-fetch');
// ---------------------------------------------------------------------------
// OpenFoodFacts helpers
// ---------------------------------------------------------------------------
const OFF_BASE    = 'https://world.openfoodfacts.org';
const PAGE_SIZE   = 20;
// Fields requested — keep this narrow to minimise response size
const PRODUCT_FIELDS = [
  'code',
  'product_name',
  'product_name_en',
  'brands',
  'quantity',
  'serving_size',
  'nutrition_data_per',
  'nutriments',
  'image_front_url',
  'categories_tags',
].join(',');
function userAgent() {
  return process.env.OFF_USER_AGENT || 'Makrion/1.0 (contact@example.com)';
}
function offHeaders() {
  return {
    'User-Agent': userAgent(),
    'Accept':     'application/json',
  };
}
// ---------------------------------------------------------------------------
// Product lookup by barcode
// ---------------------------------------------------------------------------
/**
 * Fetch a single product from OFF v3 API.
 * Returns the raw OFF product response (caller normalises).
 *
 * @param {string} barcode  EAN-13 / EAN-8 / UPC
 * @returns {Promise<object>}
 */
async function getProductByBarcode(barcode) {
  const url = `${OFF_BASE}/api/v3/product/${encodeURIComponent(barcode)}.json?fields=${PRODUCT_FIELDS}`;
  const res = await fetch(url, { headers: offHeaders() });
  if (!res.ok) {
    const err = new Error(`OFF product lookup failed: HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  // OFF returns status 0 when product does not exist
  if (data.status === 0 || data.status === 'failure' || !data.product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  return data;
}
// ---------------------------------------------------------------------------
// Text search
// ---------------------------------------------------------------------------
/**
 * Search OFF for foods matching `term`.
 * Returns raw OFF search response (caller normalises).
 *
 * @param {string} term
 * @param {number} [page=1]
 * @returns {Promise<object>}
 */
async function searchProducts(term, page = 1) {
  const params = new URLSearchParams({
    search_terms: term,
    json:         '1',
    page:         String(page),
    page_size:    String(PAGE_SIZE),
    fields:       PRODUCT_FIELDS,
  });
  const url = `${OFF_BASE}/cgi/search.pl?${params}`;
  const res  = await fetch(url, { headers: offHeaders() });
  if (!res.ok) {
    const err = new Error(`OFF search failed: HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
module.exports = { getProductByBarcode, searchProducts, PAGE_SIZE };