import { httpClient } from './http.js';
// ---------------------------------------------------------------------------
// OpenFoodFacts client — calls the server-side proxy
// Never calls OFF directly from the browser (CORS + User-Agent rules)
// ---------------------------------------------------------------------------
/**
 * Look up a single product by its barcode.
 * The proxy calls OFF v3 API and passes back the raw product JSON.
 *
 * @param {string} barcode   EAN-13 / EAN-8 / UPC (digits only)
 * @returns {Promise<object>} Raw OFF v3 product response
 * @throws {ApiError}
 */
export async function getProductByBarcode(barcode) {
  if (!barcode || !/^\d{6,14}$/.test(barcode.trim())) {
    throw new Error('Invalid barcode format — expected 6–14 digits.');
  }
  return httpClient(`/api/off/product?barcode=${encodeURIComponent(barcode.trim())}`);
}
/**
 * Search OpenFoodFacts by free-text.
 *
 * @param {string} term    Search query (e.g. "chicken breast")
 * @param {number} [page=1]  1-indexed page number
 * @param {object} [filters] Reserved for future filter params
 * @returns {Promise<{products: object[], count: number, page: number, page_size: number}>}
 * @throws {ApiError}
 */
export async function searchProducts(term, page = 1, filters = {}) {
  const params = new URLSearchParams({ term: term.trim(), page: String(page) });
  // Forward any extra filter params (reserved for future use)
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null) params.set(k, String(v));
  }
  return httpClient(`/api/off/search?${params}`);
}
