import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createMockDashboardData,
  createEmptyMeals,
  EMPTY_GOALS,
  EMPTY_TOTALS,
  EMPTY_PROGRESS_SNAPSHOT,
} from '../models/dashboard';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

const AppContext = createContext(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const today = () => new Date().toISOString().split('T')[0];

/**
 * In real implementation this will call Firestore.
 * Returns a promise that resolves to DashboardData for the given date.
 * @param {string} _uid
 * @param {string} date
 * @returns {Promise<import('../models/dashboard').DashboardData>}
 */
async function fetchDashboardData(_uid, date) {
  // TODO: replace with Firestore fetch
  //   const snap = await getDoc(doc(db, 'users', uid, 'logs', date));
  //   return snap.exists() ? snap.data() : createEmptyDayData(date);

  // Simulate network latency during development
  await new Promise((r) => setTimeout(r, 600));

  // Return mock data only for "today", empty for other dates
  const todayStr = today();
  if (date === todayStr) return createMockDashboardData(date);

  return {
    selectedDate: date,
    goals: EMPTY_GOALS,
    totals: EMPTY_TOTALS,
    meals: createEmptyMeals(),
    habits: [],
    progressSnapshot: EMPTY_PROGRESS_SNAPSHOT,
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AppProvider({ children }) {
  // --- Auth (placeholder) ---
  const [user] = useState({ uid: 'mock-uid', displayName: 'Alex', email: 'alex@example.com' });

  // --- App mode ---
  const [mode, setMode] = useState('user'); // 'user' | 'coach'

  // --- Theme ---
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('makrion_theme');
    return saved ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('makrion_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  // --- Dashboard data (per-date cache) ---
  const [dataByDate, setDataByDate] = useState({});
  const [loadingDates, setLoadingDates] = useState({});

  const loadDate = useCallback(
    async (date) => {
      if (dataByDate[date] || loadingDates[date]) return;
      setLoadingDates((prev) => ({ ...prev, [date]: true }));
      try {
        const data = await fetchDashboardData(user?.uid, date);
        setDataByDate((prev) => ({ ...prev, [date]: data }));
      } finally {
        setLoadingDates((prev) => ({ ...prev, [date]: false }));
      }
    },
    [dataByDate, loadingDates, user?.uid]
  );

  const getDashboardData = useCallback(
    (date) => dataByDate[date] ?? null,
    [dataByDate]
  );

  const isDashboardLoading = useCallback(
    (date) => Boolean(loadingDates[date]),
    [loadingDates]
  );

  // --- Actions ---

  /** Toggle a habit done/undone for a given date */
  const toggleHabit = useCallback((habitId, date) => {
    setDataByDate((prev) => {
      const entry = prev[date];
      if (!entry) return prev;
      return {
        ...prev,
        [date]: {
          ...entry,
          habits: entry.habits.map((h) =>
            h.id === habitId ? { ...h, done: !h.done } : h
          ),
        },
      };
    });
    // TODO: persist to Firestore
    // updateDoc(doc(db, 'users', uid, 'logs', date), { habits: updatedHabits })
  }, []);

  /** Add water (ml) to a date's log */
  const addWater = useCallback((ml, date) => {
    setDataByDate((prev) => {
      const entry = prev[date];
      if (!entry) return prev;
      return {
        ...prev,
        [date]: {
          ...entry,
          totals: {
            ...entry.totals,
            waterMl: entry.totals.waterMl + ml,
          },
        },
      };
    });
    // TODO: persist to Firestore
  }, []);

  /** Add a quick workout preset to a date's log */
  const addQuickWorkout = useCallback((workout, date) => {
    setDataByDate((prev) => {
      const entry = prev[date];
      if (!entry) return prev;
      return {
        ...prev,
        [date]: {
          ...entry,
          totals: {
            ...entry.totals,
            workoutsCount: entry.totals.workoutsCount + 1,
            workoutsMinutes: entry.totals.workoutsMinutes + workout.minutes,
            burnedKcal: entry.totals.burnedKcal + workout.kcal,
          },
        },
      };
    });
    // TODO: persist to Firestore
  }, []);

  // ---------------------------------------------------------------------------
  const value = useMemo(
    () => ({
      user,
      mode,
      setMode,
      theme,
      toggleTheme,
      loadDate,
      getDashboardData,
      isDashboardLoading,
      toggleHabit,
      addWater,
      addQuickWorkout,
    }),
    [
      user,
      mode,
      theme,
      toggleTheme,
      loadDate,
      getDashboardData,
      isDashboardLoading,
      toggleHabit,
      addWater,
      addQuickWorkout,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/** @returns {ReturnType<typeof AppProvider> extends React.FC<{children: any, value: infer V}> ? V : never} */
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
}
