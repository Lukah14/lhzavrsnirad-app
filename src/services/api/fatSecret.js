import { httpClient } from './http.js';
// ---------------------------------------------------------------------------
// FatSecret Platform client — calls the server-side proxy
// The proxy handles OAuth 2.0 client-credentials flow.
// Note: FatSecret uses 0-based page numbers; the proxy API also accepts 0-based.
// ---------------------------------------------------------------------------
/**
 * Search FatSecret Platform API by keyword.
 *
 * @param {string} term     Search query
 * @param {number} [page=0] 0-indexed page number (FatSecret convention)
 * @returns {Promise<{
 *   foods: {
 *     food: object | object[],
 *     max_results: string,
 *     total_results: string,
 *     page_number: string
 *   }
 * }>}
 * @throws {ApiError}
 */
export async function searchFoods(term, page = 0) {
  const params = new URLSearchParams({ term: term.trim(), page: String(page) });
  return httpClient(`/api/fatsecret/search?${params}`);
}