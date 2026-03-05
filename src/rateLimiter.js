'use strict';
const WINDOW_MS   = 60 * 1000; // 1-minute sliding window
const MAX_REQUESTS = 60;        // requests per window per IP
// In-memory store — fine for a single function instance.
// For multi-instance deploys, consider Firestore or Redis.
const store = new Map();
// Periodic cleanup: remove expired entries to prevent unbounded growth.
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000); // every 5 minutes
// Do not keep the process alive solely for this timer
if (cleanupInterval.unref) cleanupInterval.unref();
/**
 * Express middleware — rate-limits by IP.
 * Returns 429 with a JSON error body on exceed.
 */
function rateLimiter(req, res, next) {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.ip ||
    'unknown';
  const now = Date.now();
  let entry = store.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
  }
  entry.count += 1;
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  res.setHeader('X-RateLimit-Limit',     MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset',     Math.ceil(entry.resetAt / 1000));
  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({
      code:      'RATE_LIMIT_EXCEEDED',
      message:   'Too many requests. Please slow down and try again in a minute.',
      provider:  null,
      status:    429,
      requestId: req.requestId ?? null,
    });
  }
  next();
}
module.exports = rateLimiter;
