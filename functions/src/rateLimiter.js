'use strict';
// ---------------------------------------------------------------------------
// Simple in-memory IP rate limiter.
// Allows MAX_REQUESTS per WINDOW_MS per IP address.
// Uses a Map; entries expire automatically on the next clean cycle.
// ---------------------------------------------------------------------------
const MAX_REQUESTS = 60;
const WINDOW_MS    = 60 * 1000; // 1 minute

/** @type {Map<string, { count: number, resetAt: number }>} */
const buckets = new Map();

// Prune expired buckets every 5 minutes to prevent memory leaks.
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(ip);
  }
}, 5 * 60 * 1000).unref();

/**
 * Express middleware.
 * Returns HTTP 429 if the requesting IP exceeds MAX_REQUESTS / WINDOW_MS.
 */
function rateLimiter(req, res, next) {
  const ip  = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();

  let bucket = buckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(ip, bucket);
  }

  bucket.count += 1;

  res.setHeader('X-RateLimit-Limit',     String(MAX_REQUESTS));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS - bucket.count)));
  res.setHeader('X-RateLimit-Reset',     String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > MAX_REQUESTS) {
    return res.status(429).json({
      code:    'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait a moment and try again.',
      status:  429,
    });
  }

  return next();
}

module.exports = rateLimiter;
