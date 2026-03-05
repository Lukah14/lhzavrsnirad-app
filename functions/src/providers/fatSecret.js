'use strict';
const fetch = require('node-fetch');
const FS_TOKEN_URL  = 'https://oauth.fatsecret.com/connect/token';
const FS_API_BASE   = 'https://platform.fatsecret.com/rest';
const PAGE_SIZE     = 20;
// ---------------------------------------------------------------------------
// OAuth 2.0 client-credentials token — cached in memory until near expiry
// ---------------------------------------------------------------------------
/** @type {{ token: string, expiresAt: number } | null} */
let tokenCache = null;
/**
 * Obtain a Bearer token using client credentials.
 * The token is cached in-memory and reused until 60 seconds before expiry.
 *
 * @returns {Promise<string>} access_token
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  const clientId     = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    const err = new Error('FATSECRET_CLIENT_ID / FATSECRET_CLIENT_SECRET are not configured');
    err.status = 500;
    throw err;
  }
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(FS_TOKEN_URL, {
    method:  'POST',
    headers: {
      Authorization:  `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=basic',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err  = new Error(`FatSecret token request failed: HTTP ${res.status} — ${body}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  // Cache token, subtract 60s buffer before expiry
  tokenCache = {
    token:     data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return tokenCache.token;
}
// ---------------------------------------------------------------------------
// Food search
// ---------------------------------------------------------------------------
/**
 * Search FatSecret Platform API v4.
 * Uses OAuth 2.0 Bearer token (auto-refreshed).
 *
 * @param {string} term
 * @param {number} [page=0]  0-indexed page (FatSecret convention)
 * @returns {Promise<object>} Raw FatSecret search response
 */
async function searchFoods(term, page = 0) {
  const token = await getAccessToken();
  const params = new URLSearchParams({
    expression:  term,
    page_number: String(page),
    max_results: String(PAGE_SIZE),
    format:      'json',
  });
  const url = `${FS_API_BASE}/foods/search/v1?${params}`;
  const res  = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:        'application/json',
    },
  });
  if (res.status === 401) {
    // Token may have been revoked — clear cache and retry once
    tokenCache = null;
    const freshToken = await getAccessToken();
    const retry      = await fetch(url, {
      headers: {
        Authorization: `Bearer ${freshToken}`,
        Accept:        'application/json',
      },
    });
    if (!retry.ok) {
      const err = new Error(`FatSecret search failed after token refresh: HTTP ${retry.status}`);
      err.status = retry.status;
      throw err;
    }
    return retry.json();
  }
  if (res.status === 429) {
    const err = new Error('FatSecret rate limit exceeded');
    err.status = 429;
    throw err;
  }
  if (!res.ok) {
    const err = new Error(`FatSecret search failed: HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
// Exposed for testing
function _clearTokenCache() {
  tokenCache = null;
}
module.exports = { searchFoods, PAGE_SIZE, _clearTokenCache };
