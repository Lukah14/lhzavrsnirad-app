// vite-proxy.js
// ---------------------------------------------------------------------------
// Pure ESM Vite dev-server plugin that proxies all /api/* routes.
//
// Replaces the unreliable require(Express app) approach:
//   - No CommonJS dependencies (no require, no Express, no cors package)
//   - Uses Node.js 24 built-in fetch
//   - FatSecret OAuth 2.0 token managed in a closure — no module-cache issues
//   - Falls through to Vite for every non-/api/* request
//
// Production: Firebase Functions (functions/src/app.js) handle /api/* instead.
// ---------------------------------------------------------------------------
import { createReadStream, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ---------------------------------------------------------------------------
// FatSecret OAuth 2.0
// ---------------------------------------------------------------------------
const FS_TOKEN_URL = 'https://oauth.fatsecret.com/connect/token'
const FS_API_BASE  = 'https://platform.fatsecret.com/rest'

let _tokenCache = null // { token: string, expiresAt: number } | null

async function getFsToken() {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) return _tokenCache.token

  const clientId     = process.env.FATSECRET_CLIENT_ID
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw Object.assign(new Error('FATSECRET_CLIENT_ID / FATSECRET_CLIENT_SECRET not set'), { status: 500 })
  }

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res   = await fetch(FS_TOKEN_URL, {
    method:  'POST',
    headers: {
      Authorization:  `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=premier',
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw Object.assign(new Error(`FatSecret token error: HTTP ${res.status} — ${body}`), { status: res.status })
  }
  const data = await res.json()
  _tokenCache = {
    token:     data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }
  return _tokenCache.token
}

async function fsGet(apiPath, retried = false) {
  const token = await getFsToken()
  const res   = await fetch(`${FS_API_BASE}${apiPath}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (res.status === 401 && !retried) {
    _tokenCache = null
    return fsGet(apiPath, true)
  }
  if (!res.ok) {
    throw Object.assign(new Error(`FatSecret API error: HTTP ${res.status}`), { status: res.status })
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// USDA FoodData Central
// ---------------------------------------------------------------------------
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1'
const PAGE_SIZE = 20

async function usdaSearch(term, page = 1) {
  const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY'
  const params = new URLSearchParams({
    query:      term,
    pageNumber: String(page),
    pageSize:   String(PAGE_SIZE),
    api_key:    apiKey,
  })
  // Append each dataType individually — a single comma-joined string gets percent-encoded
  // and the USDA API returns 400.  Repeated params are the correct format for this endpoint.
  params.append('dataType', 'Foundation')
  params.append('dataType', 'Branded')
  params.append('dataType', 'SR Legacy')
  const url = `${USDA_BASE}/foods/search?${params}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`[api-proxy/usda] HTTP ${res.status}: ${body}`)
    throw Object.assign(new Error(`USDA error: HTTP ${res.status}`), { status: res.status })
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Local exercises fallback
// ---------------------------------------------------------------------------
let _localExercises = null
function getLocalExercises() {
  if (!_localExercises) {
    try {
      const p = resolve(__dirname, 'functions/src/data/exercises.json')
      _localExercises = JSON.parse(readFileSync(p, 'utf8'))
    } catch {
      _localExercises = []
    }
  }
  return _localExercises
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------
function jsonReply(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}) }
      catch { resolve({}) }
    })
    req.on('error', reject)
  })
}

// ---------------------------------------------------------------------------
// Vite plugin
// ---------------------------------------------------------------------------
export function apiProxy() {
  return {
    name: 'api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Only intercept /api/* requests
        const raw     = req.url ?? '/'
        const url     = new URL(raw, 'http://localhost')
        const path    = url.pathname
        const q       = url.searchParams

        if (!path.startsWith('/api/')) return next()

        try {
          // ----------------------------------------------------------------
          // FatSecret — legacy food search  (used by FoodSearchContext)
          // GET /api/fatsecret/search?term=&page=
          // ----------------------------------------------------------------
          if (path === '/api/fatsecret/search' && req.method === 'GET') {
            const term = q.get('term') || ''
            const page = q.get('page') || '0'
            const p    = new URLSearchParams({
              expression:  term,
              page_number: page,
              max_results: '20',
              format:      'json',
            })
            const data = await fsGet(`/foods/search/v1?${p}`)
            return jsonReply(res, 200, data)
          }

          // ----------------------------------------------------------------
          // FatSecret — extended food search  (used by FatSecretContext)
          // GET /api/fatsecret/foods/search?q=&page=&maxResults=&region=&includeSubCategories=&defaultServing=
          // ----------------------------------------------------------------
          if (path === '/api/fatsecret/foods/search' && req.method === 'GET') {
            const p = new URLSearchParams({
              search_expression:           q.get('q') || '',
              page_number:                 q.get('page') || '0',
              max_results:                 q.get('maxResults') || '20',
              include_food_sub_categories: q.get('includeSubCategories') === '1' ? '1' : '0',
              flag_default_serving:        q.get('defaultServing') === '0' ? '0' : '1',
              format:                      'json',
            })
            if (q.get('region')) p.set('region', q.get('region'))
            const data = await fsGet(`/foods/search/v3?${p}`)
            return jsonReply(res, 200, data)
          }

          // ----------------------------------------------------------------
          // FatSecret — food brands
          // GET /api/fatsecret/brands?startsWithLetter=&page=
          // ----------------------------------------------------------------
          if (path === '/api/fatsecret/brands' && req.method === 'GET') {
            const p = new URLSearchParams({
              max_results: '50',
              page_number: q.get('page') || '0',
              format:      'json',
            })
            if (q.get('startsWithLetter')) p.set('starts_with', q.get('startsWithLetter').charAt(0))
            const data = await fsGet(`/food_brands?${p}`)
            return jsonReply(res, 200, data)
          }

          // ----------------------------------------------------------------
          // FatSecret — barcode lookup (primary barcode source)
          // GET /api/fatsecret/barcode?code=xxx
          // ----------------------------------------------------------------
          if (path === '/api/fatsecret/barcode' && req.method === 'GET') {
            const code = q.get('code') ?? ''
            if (!code) return jsonReply(res, 400, { code: 'MISSING_PARAM', message: 'code is required', status: 400 })
            const data = await fsGet(`/rest/foods/find_by_barcode.get?format=json&barcode_value=${encodeURIComponent(code)}`)
            return jsonReply(res, 200, data)
          }

          // ----------------------------------------------------------------
          // FatSecret — food categories
          // GET /api/fatsecret/categories
          // ----------------------------------------------------------------
          if (path === '/api/fatsecret/categories' && req.method === 'GET') {
            const data = await fsGet('/food_sub_categories?format=json')
            return jsonReply(res, 200, data)
          }

          // ----------------------------------------------------------------
          // FatSecret — recipe search
          // GET /api/fatsecret/recipes/search
          // ----------------------------------------------------------------
          if (path === '/api/fatsecret/recipes/search' && req.method === 'GET') {
            const p = new URLSearchParams({
              search_expression:      q.get('q') || '',
              page_number:            q.get('page') || '0',
              max_results:            q.get('maxResults') || '20',
              recipe_types_match_all: q.get('recipeTypesMatchAll') === '1' ? '1' : '0',
              must_have_images:       q.get('mustHaveImages') === '1' ? '1' : '0',
              format:                 'json',
            })
            const optional = (pKey, qKey) => { if (q.get(qKey)) p.set(pKey, q.get(qKey)) }
            optional('recipe_types',            'recipeTypes')
            optional('calories.from',           'caloriesFrom')
            optional('calories.to',             'caloriesTo')
            optional('carb_percentage.from',    'carbPctFrom')
            optional('carb_percentage.to',      'carbPctTo')
            optional('protein_percentage.from', 'proteinPctFrom')
            optional('protein_percentage.to',   'proteinPctTo')
            optional('fat_percentage.from',     'fatPctFrom')
            optional('fat_percentage.to',       'fatPctTo')
            optional('prep_time.from',          'prepTimeFrom')
            optional('prep_time.to',            'prepTimeTo')
            const data = await fsGet(`/recipes/search/v3?${p}`)
            return jsonReply(res, 200, data)
          }

          // ----------------------------------------------------------------
          // FatSecret — recipe types
          // GET /api/fatsecret/recipe-types
          // ----------------------------------------------------------------
          if (path === '/api/fatsecret/recipe-types' && req.method === 'GET') {
            const data = await fsGet('/recipe_types/v2?format=json')
            return jsonReply(res, 200, data)
          }

          // ----------------------------------------------------------------
          // FatSecret — exercises (with local JSON fallback)
          // GET /api/fatsecret/exercises?intensity=
          // ----------------------------------------------------------------
          if (path === '/api/fatsecret/exercises' && req.method === 'GET') {
            const intensity = q.get('intensity') || ''
            let exercises
            try {
              const fsData = await fsGet('/exercises.get?format=json')
              const list = fsData?.exercises?.exercise
              if (Array.isArray(list) && list.length > 0) {
                exercises = list.map(e => ({
                  id:                   String(e.exercise_id ?? e.id ?? ''),
                  name:                 e.exercise_name ?? e.name ?? '',
                  intensity:            mapIntensity(e.exercise_category ?? ''),
                  met:                  parseFloat(e.metabolic_equivalent ?? e.met ?? 0) || 0,
                  caloriesPerHourPerKg: parseFloat(e.metabolic_equivalent ?? e.met ?? 0) || 0,
                  source:               'fatsecret',
                }))
              } else {
                throw new Error('empty list')
              }
            } catch {
              exercises = getLocalExercises()
            }
            if (intensity) exercises = exercises.filter(e => e.intensity === intensity)
            return jsonReply(res, 200, exercises)
          }

          // ----------------------------------------------------------------
          // FatSecret — calories burned calculator (pure math)
          // POST /api/fatsecret/calories-burned
          // ----------------------------------------------------------------
          if (path === '/api/fatsecret/calories-burned' && req.method === 'POST') {
            const body = await readBody(req)
            const { weightKg, minutes, met } = body
            if (weightKg == null || minutes == null || met == null) {
              return jsonReply(res, 400, { code: 'MISSING_PARAMS', message: 'weightKg, minutes, and met are required.', status: 400 })
            }
            const w = parseFloat(weightKg)
            const m = parseFloat(minutes)
            const v = parseFloat(met)
            if (isNaN(w) || isNaN(m) || isNaN(v) || w <= 0 || m <= 0 || v <= 0) {
              return jsonReply(res, 400, { code: 'INVALID_PARAMS', message: 'weightKg, minutes, and met must be positive numbers.', status: 400 })
            }
            const caloriesBurned = Math.round(v * w * (m / 60))
            return jsonReply(res, 200, { caloriesBurned, weightKg: w, minutes: m, met: v })
          }

          // ----------------------------------------------------------------
          // USDA FoodData Central
          // GET /api/usda/search?term=&page=
          // ----------------------------------------------------------------
          if (path === '/api/usda/search' && req.method === 'GET') {
            const term = q.get('term') || ''
            const page = parseInt(q.get('page') ?? '1', 10) || 1
            const data = await usdaSearch(term, page)
            return jsonReply(res, 200, data)
          }

          // ----------------------------------------------------------------
          // Unknown /api/* route
          // ----------------------------------------------------------------
          return jsonReply(res, 404, { code: 'NOT_FOUND', message: 'Endpoint not found.', status: 404 })

        } catch (err) {
          const status  = err.status || 500
          const code    = status === 429 ? 'RATE_LIMIT' : 'SERVER_ERROR'
          console.error(`[api-proxy] ${err.message}`)
          return jsonReply(res, status, { code, message: err.message, status })
        }
      })
    },
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function mapIntensity(category) {
  const s = (category || '').toLowerCase()
  if (s.includes('light') || s.includes('rest'))                          return 'light'
  if (s.includes('heavy') || s.includes('vigorous') || s.includes('strenuous')) return 'strenuous'
  return 'moderate'
}
