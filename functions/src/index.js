'use strict';
// ---------------------------------------------------------------------------
// Firebase Cloud Functions entry point
//
// Exports a single `api` function that mounts the Express app.
// All routes live in ./app.js.
//
// Local dev (emulator):
//   firebase emulators:start --only functions
//   → available at http://127.0.0.1:5001/{PROJECT_ID}/us-central1/api
//
// Production deploy:
//   firebase deploy --only functions
// ---------------------------------------------------------------------------
const functions = require('firebase-functions');
const app       = require('./app');

exports.api = functions.https.onRequest(app);
