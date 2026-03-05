// ---------------------------------------------------------------------------
// Thin fetch wrapper used by all API client modules.
// Never import this directly from UI — use the provider modules instead.
// ---------------------------------------------------------------------------
/** Base URL for all /api/* calls.
 *  - Leave empty (default) in production — same origin via Firebase Hosting rewrite.
 *  - Set VITE_API_BASE_URL=http://127.0.0.1:5001/PROJECT/us-central1/api during
 *    local emulator development so the client can reach the function emulator. */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const DEFAULT_TIMEOUT_MS = 10_000; // 10 seconds
// ---------------------------------------------------------------------------
// Normalised error class
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  /**
   * @param {number}      status   HTTP status (0 = network/offline, 408 = timeout)
   * @param {string}      code     Machine-readable code from the proxy or synthetic
   * @param {string}      message  Human-readable message
   * @param {string|null} provider 'off' | 'usda' | 'fatsecret' | null
   * @param {string|null} requestId
   */
  constructor(status, code, message, provider = null, requestId = null) {
    super(message);
    this.name      = 'ApiError';
    this.status    = status;
    this.code      = code;
    this.provider  = provider;
    this.requestId = requestId;
  }
  get isNetworkError() { return this.status === 0; }
  get isTimeout()      { return this.status === 408; }
  get isNotFound()     { return this.status === 404; }
  get isRateLimit()    { return this.status === 429; }
  get isServerError()  { return this.status >= 500; }
}
// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------
/**
 * Fetches a JSON endpoint and returns the parsed body.
 * Throws an `ApiError` on any non-2xx response, network failure, or timeout.
 *
 * @param {string} path     Relative path e.g. '/api/off/search?term=chicken'
 * @param {object} [opts]
 * @param {number}  [opts.timeout]   Override default 10 s timeout
 * @param {string}  [opts.method]
 * @param {object}  [opts.headers]
 * @param {any}     [opts.body]
 * @returns {Promise<any>}
 */
export async function httpClient(path, opts = {}) {
  const {
    timeout  = DEFAULT_TIMEOUT_MS,
    method   = 'GET',
    headers  = {},
    body,
    ...rest
  } = opts;
  const requestId = generateRequestId();
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal:  controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });
    // Attempt to parse body regardless of status (error responses include JSON)
    let json;
    try {
      json = await response.json();
    } catch {
      json = null;
    }
    if (!response.ok) {
      throw new ApiError(
        response.status,
        json?.code     ?? `HTTP_${response.status}`,
        json?.message  ?? `Request failed with status ${response.status}`,
        json?.provider ?? null,
        json?.requestId ?? requestId,
      );
    }
    return json;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'AbortError') {
      throw new ApiError(408, 'TIMEOUT', 'The request timed out.', null, requestId);
    }
    // Network errors (offline, DNS failure, etc.)
    throw new ApiError(0, 'NETWORK', err.message || 'Network error', null, requestId);
  } finally {
    clearTimeout(timeoutHandle);
  }
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function generateRequestId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}