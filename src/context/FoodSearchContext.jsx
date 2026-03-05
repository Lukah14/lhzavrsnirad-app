import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { collection, getDocs, limit, orderBy, query, startAt, endAt, where } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { useAppContext } from './AppContext.jsx';
import { searchProducts  as offSearch       } from '../services/api/openFoodFacts.js';
import { searchFoods     as usdaSearch      } from '../services/api/usda.js';
import { searchFoods     as fatSecretSearch } from '../services/api/fatSecret.js';
import { getProductByBarcode as offBarcode  } from '../services/api/openFoodFacts.js';
import {
  normalizeOFFSearchResults,
  normalizeOFFProduct,
  normalizeUSDASearchResults,
  normalizeFatSecretSearchResults,
  normalizeFirestoreFood,
  deduplicateFoods,
} from '../services/api/normalizeFood.js';
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
/** If Firestore returns fewer than this many results, also hit external APIs. */
const FIRESTORE_THRESHOLD = 5;
/** How many recent search terms to store locally. */
const MAX_RECENTS = 10;
const RECENTS_KEY = 'makrion_recent_searches';
// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const FoodSearchContext = createContext(null);
// ---------------------------------------------------------------------------
// Recent searches (localStorage)
// ---------------------------------------------------------------------------
function loadRecents() {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]');
  } catch {
    return [];
  }
}
function saveRecent(term) {
  if (!term?.trim()) return;
  const recents = loadRecents().filter((t) => t !== term);
  recents.unshift(term);
  recents.splice(MAX_RECENTS); // keep only MAX_RECENTS
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
  } catch {
    // localStorage may be full or unavailable
  }
}
// ---------------------------------------------------------------------------
// Firestore helpers
// ---------------------------------------------------------------------------
/**
 * Query the curated `foods` collection + user's `myFoods` subcollection.
 * Uses a simple alphabetical startAt / endAt prefix match on the lowercased name.
 *
 * @param {string} term
 * @param {string|null} uid
 * @returns {Promise<NormalizedFood[]>}
 */
async function queryFirestore(term, uid) {
  const lower = term.toLowerCase();
  const buildQuery = (ref) =>
    query(
      ref,
      orderBy('nameLower'),
      startAt(lower),
      endAt(lower + '\uf8ff'),
      limit(20)
    );
  const results = [];
  // 1. Curated foods collection
  try {
    const snap = await getDocs(buildQuery(collection(db, 'foods')));
    for (const doc of snap.docs) {
      const norm = normalizeFirestoreFood(doc.id, doc.data(), 'internal');
      if (norm) results.push(norm);
    }
  } catch (err) {
    // Firebase not yet configured or offline — degrade gracefully
    if (import.meta.env.DEV) {
      console.warn('[FoodSearchContext] Firestore curated query failed:', err.message);
    }
  }
  // 2. User's own foods
  if (uid) {
    try {
      const snap = await getDocs(buildQuery(collection(db, 'users', uid, 'myFoods')));
      for (const doc of snap.docs) {
        const norm = normalizeFirestoreFood(doc.id, doc.data(), 'user');
        if (norm) results.push(norm);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[FoodSearchContext] Firestore myFoods query failed:', err.message);
      }
    }
  }
  return results;
}
// ---------------------------------------------------------------------------
// External API fallback — all three providers in parallel
// ---------------------------------------------------------------------------
/**
 * @param {string} term
 * @param {number} page
 * @returns {Promise<{ foods: NormalizedFood[], hasMore: boolean, errors: string[] }>}
 */
async function queryExternalAPIs(term, page) {
  const [offResult, usdaResult, fsResult] = await Promise.allSettled([
    offSearch(term, page).then(normalizeOFFSearchResults),
    usdaSearch(term, page).then(normalizeUSDASearchResults),
    fatSecretSearch(term, page > 1 ? page - 1 : 0).then(normalizeFatSecretSearchResults),
  ]);
  const foods  = [];
  const errors = [];
  if (offResult.status  === 'fulfilled')  foods.push(...offResult.value);
  else errors.push('off');
  if (usdaResult.status === 'fulfilled')  foods.push(...usdaResult.value);
  else errors.push('usda');
  if (fsResult.status   === 'fulfilled')  foods.push(...fsResult.value);
  else errors.push('fatsecret');
  // hasMore: conservative — assume more if any provider returned results
  const hasMore = foods.length >= 15;
  return { foods, hasMore, errors };
}
// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function FoodSearchProvider({ children }) {
  const { user } = useAppContext();
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);  // i18n key string
  const [hasMore,  setHasMore]  = useState(false);
  const [page,     setPage]     = useState(1);
  const [lastTerm, setLastTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState(loadRecents);
  // Abort controller to cancel in-flight searches
  const abortRef = useRef(null);
  // ---------------------------------------------------------------------------
  // searchFoods — main entry point (debounce handled in UI layer)
  // ---------------------------------------------------------------------------
  const searchFoods = useCallback(
    async (term, { page: pageParam = 1, filters = {} } = {}) => {
      const trimmed = term?.trim();
      if (!trimmed) {
        setResults([]);
        setError(null);
        setHasMore(false);
        return;
      }
      // Cancel any previous in-flight search
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setLoading(true);
      setError(null);
      setLastTerm(trimmed);
      setPage(pageParam);
      try {
        // --- Step 1: Firestore (curated + myFoods) ---
        const firestoreResults = await queryFirestore(trimmed, user?.uid ?? null);
        // --- Step 2: External fallback if not enough Firestore results ---
        let externalFoods  = [];
        let externalErrors = [];
        let externalHasMore = false;
        if (firestoreResults.length < FIRESTORE_THRESHOLD) {
          const ext = await queryExternalAPIs(trimmed, pageParam);
          externalFoods   = ext.foods;
          externalErrors  = ext.errors;
          externalHasMore = ext.hasMore;
        }
        // --- Step 3: Merge + de-dupe ---
        // Firestore results first (higher trust), then external
        const merged    = deduplicateFoods([...firestoreResults, ...externalFoods]);
        const finalList = pageParam > 1
          // On pagination, append to previous results
          ? deduplicateFoods([...results, ...merged])
          : merged;
        setResults(finalList);
        setHasMore(externalHasMore);
        // Surface a non-fatal warning if some providers failed
        if (externalErrors.length > 0 && externalFoods.length === 0 && firestoreResults.length === 0) {
          setError('errors.api.network');
        }
        // --- Step 4: Store recent search ---
        saveRecent(trimmed);
        setRecentSearches(loadRecents());
      } catch (err) {
        if (err.name === 'AbortError') return; // intentionally cancelled
        console.error('[FoodSearchContext] searchFoods error:', err);
        setError(err.code === 'TIMEOUT' ? 'errors.api.timeout' : 'errors.api.network');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [user?.uid, results]
  );
  // ---------------------------------------------------------------------------
  // loadMore — fetch next page of external results
  // ---------------------------------------------------------------------------
  const loadMore = useCallback(() => {
    if (!loading && hasMore && lastTerm) {
      searchFoods(lastTerm, { page: page + 1 });
    }
  }, [loading, hasMore, lastTerm, page, searchFoods]);
  // ---------------------------------------------------------------------------
  // getFoodByBarcode — barcode scanner entry point
  // ---------------------------------------------------------------------------
  const getFoodByBarcode = useCallback(async (barcode) => {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      // 1. Check Firestore first by barcode field
      let firestoreMatch = null;
      try {
        const snap = await getDocs(
          query(collection(db, 'foods'), where('barcode', '==', barcode), limit(1))
        );
        if (!snap.empty) {
          firestoreMatch = normalizeFirestoreFood(
            snap.docs[0].id,
            snap.docs[0].data(),
            'internal'
          );
        }
      } catch {
        // Firestore unavailable — fall through to OFF
      }
      if (firestoreMatch) {
        setResults([firestoreMatch]);
        return firestoreMatch;
      }
      // 2. Fallback to OpenFoodFacts (primary barcode DB)
      const raw        = await offBarcode(barcode);
      const normalized = normalizeOFFProduct(raw?.product);
      if (!normalized) {
        setError('errors.api.barcode_not_found');
        return null;
      }
      setResults([normalized]);
      return normalized;
    } catch (err) {
      if (err.isNotFound) {
        setError('errors.api.barcode_not_found');
      } else if (err.isTimeout) {
        setError('errors.api.timeout');
      } else {
        setError('errors.api.off_failed');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  // ---------------------------------------------------------------------------
  // clearResults
  // ---------------------------------------------------------------------------
  const clearResults = useCallback(() => {
    abortRef.current?.abort();
    setResults([]);
    setError(null);
    setHasMore(false);
    setLastTerm('');
    setPage(1);
  }, []);
  // ---------------------------------------------------------------------------
  const value = useMemo(
    () => ({
      results,
      loading,
      error,
      hasMore,
      page,
      lastTerm,
      recentSearches,
      searchFoods,
      loadMore,
      getFoodByBarcode,
      clearResults,
    }),
    [
      results, loading, error, hasMore, page, lastTerm, recentSearches,
      searchFoods, loadMore, getFoodByBarcode, clearResults,
    ]
  );
  return (
    <FoodSearchContext.Provider value={value}>
      {children}
    </FoodSearchContext.Provider>
  );
}
// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useFoodSearch() {
  const ctx = useContext(FoodSearchContext);
  if (!ctx) throw new Error('useFoodSearch must be used inside <FoodSearchProvider>');
  return ctx;
}