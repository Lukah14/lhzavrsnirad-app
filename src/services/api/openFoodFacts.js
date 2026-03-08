// ---------------------------------------------------------------------------
// OpenFoodFacts client — calls the OFF public API directly from the browser.
// OFF is free, requires no API key, and has CORS enabled for GET requests.
// ---------------------------------------------------------------------------

const OFF_BASE    = 'https://world.openfoodfacts.org';
const TIMEOUT_MS  = 10_000;

/** Minimal set of fields to keep payloads small */
const SEARCH_FIELDS = [
  'code',
  'product_name',
  'product_name_en',
  'brands',
  'image_front_url',
  'nutriments',
  'serving_size',
  'serving_quantity',
].join(',');

/**
 * Fetch with a timeout via AbortController.
 * @param {string} url
 * @returns {Promise<any>} Parsed JSON
 */
async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`OFF responded with HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('OFF request timed out.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Look up a single product by its barcode.
 *
 * @param {string} barcode   EAN-13 / EAN-8 / UPC (digits only)
 * @returns {Promise<object>} Raw OFF v3 product response
 */
export async function getProductByBarcode(barcode) {
  if (!barcode || !/^\d{6,14}$/.test(barcode.trim())) {
    throw new Error('Invalid barcode format — expected 6–14 digits.');
  }
  const url = `${OFF_BASE}/api/v3/product/${encodeURIComponent(barcode.trim())}.json`;
  return fetchWithTimeout(url);
}

/**
 * Search OpenFoodFacts by free-text.
 *
 * @param {string} term    Search query (e.g. "chicken breast")
 * @param {number} [page=1]  1-indexed page number
 * @param {object} [filters] Reserved for future filter params
 * @returns {Promise<{products: object[], count: number, page: number, page_size: number}>}
 */
export async function searchProducts(term, page = 1, filters = {}) {
  const params = new URLSearchParams({
    search_terms: term.trim(),
    json:         '1',
    page:         String(page),
    page_size:    '20',
    fields:       SEARCH_FIELDS,
  });
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null) params.set(k, String(v));
  }
  // Use the v2 REST search endpoint — it has reliable CORS headers unlike the legacy cgi/search.pl
  const url = `${OFF_BASE}/api/v2/search?${params}`;
  return fetchWithTimeout(url);
}
