import { httpClient } from './http.js';
// ---------------------------------------------------------------------------
// USDA FoodData Central client — calls the server-side proxy
// The proxy injects the API key and handles rate limiting.
// ---------------------------------------------------------------------------
/**
 * Search USDA FoodData Central by keyword.
 *
 * @param {string} term     Search query
 * @param {number} [page=1] 1-indexed page number (proxy passes to USDA as pageNumber)
 * @returns {Promise<{
 *   foods: object[],
 *   totalHits: number,
 *   currentPage: number,
 *   totalPages: number
 * }>}
 * @throws {ApiError}
 */
export async function searchFoods(term, page = 1) {
  const params = new URLSearchParams({ term: term.trim(), page: String(page) });
  return httpClient(`/api/usda/search?${params}`);
}