// ---------------------------------------------------------------------------
// HabitContext — single source of truth for habits, logs, moments, and mood
// ---------------------------------------------------------------------------

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAppContext } from './AppContext';
import {
  subscribeHabits,
  addHabit    as svcAddHabit,
  updateHabit as svcUpdateHabit,
  deleteHabit as svcDeleteHabit,
  getLogsForDate,
  setLogEntry,
  getMomentsForDate,
  addMoment   as svcAddMoment,
  deleteMoment as svcDeleteMoment,
  getMoodForDate,
  setMoodForDate,
} from '../services/habits/habitService.js';
import {
  isScheduledForDate,
  isHabitComplete,
  calcStreak,
  MOOD_EMOJIS,
  todayISO,
  HABIT_TYPES,
} from '../models/habits.js';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const HabitContext = createContext(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function HabitProvider({ children }) {
  const { user } = useAppContext();
  const uid = user?.uid ?? null;

  // ── State ────────────────────────────────────────────────────────────────
  const [selectedDate,   setSelectedDate]   = useState(todayISO);
  const [habits,         setHabits]         = useState([]);
  const [logsByDate,     setLogsByDate]     = useState({});   // { [date]: { [habitId]: log } }
  const [momentsByDate,  setMomentsByDate]  = useState({});   // { [date]: { [momentId]: moment } }
  const [moodByDate,     setMoodByDate]     = useState({});   // { [date]: { value, emoji } }
  const [loading,        setLoading]        = useState(true);

  // Track which dates have already been fetched so we don't re-fetch
  const fetchedDates = useRef(new Set());

  // ── Subscribe to habit templates ─────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeHabits(uid, (h) => {
      setHabits(h);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  // ── Fetch logs + moments + mood for a date ────────────────────────────────
  const fetchDateData = useCallback(async (dateISO) => {
    if (fetchedDates.current.has(dateISO)) return;
    fetchedDates.current.add(dateISO);

    const [logs, moments, mood] = await Promise.all([
      getLogsForDate(uid, dateISO),
      getMomentsForDate(uid, dateISO),
      getMoodForDate(uid, dateISO),
    ]);

    setLogsByDate((prev) => ({ ...prev, [dateISO]: logs }));
    setMomentsByDate((prev) => ({ ...prev, [dateISO]: moments }));
    setMoodByDate((prev) => mood ? { ...prev, [dateISO]: mood } : prev);
  }, [uid]);

  useEffect(() => {
    fetchDateData(selectedDate);
  }, [selectedDate, fetchDateData]);

  // ── Selectors ─────────────────────────────────────────────────────────────

  /** Habits that are scheduled for a given date (not archived) */
  const habitsForDate = useCallback((dateISO) => {
    return habits.filter(
      (h) => !h.archived && isScheduledForDate(h, dateISO)
    );
  }, [habits]);

  /** Log map for a given date */
  const logForDate = useCallback((dateISO) => {
    return logsByDate[dateISO] ?? {};
  }, [logsByDate]);

  /** Individual log entry for a habit on a date */
  const habitLogEntry = useCallback((habitId, dateISO) => {
    return (logsByDate[dateISO] ?? {})[habitId] ?? null;
  }, [logsByDate]);

  /** Moments for a given date as array sorted by time */
  const momentsForDate = useCallback((dateISO) => {
    const map = momentsByDate[dateISO] ?? {};
    return Object.values(map).sort((a, b) =>
      (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
    );
  }, [momentsByDate]);

  /** Mood for a given date */
  const moodForDate = useCallback((dateISO) => {
    return moodByDate[dateISO] ?? null;
  }, [moodByDate]);

  /** Streak for a given habit */
  const habitStreak = useCallback((habit) => {
    return calcStreak(habit, logsByDate);
  }, [logsByDate]);

  /** Summary (completed, total, pct) for a given date */
  const summaryForDate = useCallback((dateISO) => {
    const scheduled = habitsForDate(dateISO);
    const logs      = logForDate(dateISO);
    const done      = scheduled.filter((h) => isHabitComplete(h, logs[h.id])).length;
    const total     = scheduled.length;
    const pct       = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }, [habitsForDate, logForDate]);

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Toggle a boolean habit done/undone for a given date (optimistic) */
  const toggleHabit = useCallback(async (habitId, dateISO) => {
    const log     = (logsByDate[dateISO] ?? {})[habitId] ?? {};
    const isDone  = Boolean(log.completed);
    const newLog  = { ...log, completed: !isDone, value: !isDone ? 1 : 0 };

    // Optimistic update
    setLogsByDate((prev) => ({
      ...prev,
      [dateISO]: { ...(prev[dateISO] ?? {}), [habitId]: newLog },
    }));

    await setLogEntry(uid, dateISO, habitId, newLog);
  }, [uid, logsByDate]);

  /** Set a numeric or timer value for a habit on a given date (optimistic) */
  const setHabitValue = useCallback(async (habitId, dateISO, value) => {
    const habit   = habits.find((h) => h.id === habitId);
    const log     = (logsByDate[dateISO] ?? {})[habitId] ?? {};
    const newLog  = {
      ...log,
      value,
      completed: habit ? isHabitComplete(habit, { ...log, value }) : false,
    };

    setLogsByDate((prev) => ({
      ...prev,
      [dateISO]: { ...(prev[dateISO] ?? {}), [habitId]: newLog },
    }));

    await setLogEntry(uid, dateISO, habitId, newLog);
  }, [uid, habits, logsByDate]);

  /** Increment a numeric habit by its step value */
  const incrementHabit = useCallback(async (habitId, dateISO) => {
    const habit  = habits.find((h) => h.id === habitId);
    if (!habit) return;
    const step   = habit.step ?? 1;
    const log    = (logsByDate[dateISO] ?? {})[habitId] ?? {};
    const newVal = (log.value ?? 0) + step;
    await setHabitValue(habitId, dateISO, newVal);
  }, [habits, logsByDate, setHabitValue]);

  /** Add a new habit template */
  const addHabit = useCallback(async (habitData) => {
    const id = await svcAddHabit(uid, habitData);
    // If using in-memory fallback, re-trigger subscription via manual state update
    if (!uid || uid === 'mock-uid') {
      const { MOCK_HABITS: mh } = await import('../models/habits.js');
      // Force re-render with updated mock list
      setHabits((prev) => [
        ...prev,
        { ...habitData, id, archived: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);
    }
    return id;
  }, [uid]);

  /** Update a habit template */
  const updateHabit = useCallback(async (habitId, changes) => {
    setHabits((prev) => prev.map((h) => h.id === habitId ? { ...h, ...changes } : h));
    await svcUpdateHabit(uid, habitId, changes);
  }, [uid]);

  /** Delete a habit template */
  const deleteHabit = useCallback(async (habitId) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    await svcDeleteHabit(uid, habitId);
  }, [uid]);

  /** Archive a habit */
  const archiveHabit = useCallback(async (habitId) => {
    await updateHabit(habitId, { archived: true });
  }, [updateHabit]);

  /** Add a memorable moment for a date */
  const addMoment = useCallback(async (dateISO, momentData) => {
    const id = await svcAddMoment(uid, dateISO, momentData);
    setMomentsByDate((prev) => ({
      ...prev,
      [dateISO]: {
        ...(prev[dateISO] ?? {}),
        [id]: { ...momentData, id, createdAt: new Date().toISOString() },
      },
    }));
    return id;
  }, [uid]);

  /** Delete a memorable moment */
  const deleteMoment = useCallback(async (dateISO, momentId) => {
    setMomentsByDate((prev) => {
      const dateMap = { ...(prev[dateISO] ?? {}) };
      delete dateMap[momentId];
      return { ...prev, [dateISO]: dateMap };
    });
    await svcDeleteMoment(uid, dateISO, momentId);
  }, [uid]);

  /** Save the daily mood for a date */
  const setMood = useCallback(async (dateISO, value) => {
    const emoji = MOOD_EMOJIS[value - 1] ?? '😐';
    setMoodByDate((prev) => ({ ...prev, [dateISO]: { value, emoji, updatedAt: new Date().toISOString() } }));
    await setMoodForDate(uid, dateISO, value, emoji);
  }, [uid]);

  // ── Context value ─────────────────────────────────────────────────────────
  const value = useMemo(() => ({
    // State
    selectedDate,
    setSelectedDate,
    habits,
    loading,
    // Selectors
    habitsForDate,
    logForDate,
    habitLogEntry,
    momentsForDate,
    moodForDate,
    habitStreak,
    summaryForDate,
    // Actions
    toggleHabit,
    setHabitValue,
    incrementHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    addMoment,
    deleteMoment,
    setMood,
    // Helpers re-exported for convenience
    isHabitComplete,
    HABIT_TYPES,
  }), [
    selectedDate, habits, loading,
    habitsForDate, logForDate, habitLogEntry, momentsForDate, moodForDate,
    habitStreak, summaryForDate,
    toggleHabit, setHabitValue, incrementHabit,
    addHabit, updateHabit, deleteHabit, archiveHabit,
    addMoment, deleteMoment, setMood,
  ]);

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useHabitContext() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error('useHabitContext must be used inside <HabitProvider>');
  return ctx;
}
