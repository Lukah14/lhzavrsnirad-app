'use strict';
const { onRequest } = require('firebase-functions/v2/https');
const app = require('./app');
/**
 * Single Cloud Function that handles all /api/* traffic.
 * Firebase Hosting rewrites /api/** to this function.
 *
 * Secrets are declared here so the Firebase Functions runtime injects them
 * as process.env.* both in the emulator (via functions/.env) and in production
 * (via Firebase Secret Manager after running `firebase functions:secrets:set`).
 *
 * Memory / concurrency can be tuned as traffic grows.
 */
exports.api = onRequest(
  {
    region:         'us-central1',
    memory:         '256MiB',
    timeoutSeconds: 30,
    minInstances:   0,
    // Declare secrets so they're available as process.env.<NAME>
    // In production, create them first:
    //   firebase functions:secrets:set USDA_API_KEY
    //   firebase functions:secrets:set FATSECRET_CLIENT_ID
    //   firebase functions:secrets:set FATSECRET_CLIENT_SECRET
    secrets: ['USDA_API_KEY', 'FATSECRET_CLIENT_ID', 'FATSECRET_CLIENT_SECRET'],
  },
  app
);