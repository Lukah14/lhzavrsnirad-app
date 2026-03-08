// ---------------------------------------------------------------------------
// Habit Service — Firestore CRUD with in-memory fallback
// ---------------------------------------------------------------------------
// Firestore paths:
//   users/{uid}/habits/{habitId}            — habit templates
//   users/{uid}/habitLogs/{date}/items/{id} — daily log entries
//   users/{uid}/memorableMoments/{date}/items/{id} — moments
//   users/{uid}/moods/{date}                — daily mood { value, emoji, updatedAt }
// ---------------------------------------------------------------------------

import {
  collection,
  collectionGroup,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import {
  MOCK_HABITS,
  createMockLogs,
  createMockMoments,
  todayISO,
} from '../../models/habits.js';

// ---------------------------------------------------------------------------
// In-memory store (fallback when Firestore is not configured)
// ---------------------------------------------------------------------------

let _memHabits   = [...MOCK_HABITS];
let _memLogs     = {};     // { [date]: { [habitId]: logEntry } }
let _memMoments  = {};     // { [date]: { [momentId]: momentEntry } }
let _memMoods    = {};     // { [date]: { value, emoji, updatedAt } }

const isFirestoreReady = () => {
  try {
    return db && db.app?.options?.projectId !== 'YOUR_PROJECT_ID';
  } catch {
    return false;
  }
};

// ---------------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------------

/**
 * Subscribe to the user's habit templates.
 * Returns an unsubscribe function.
 * Falls back to mock data when Firestore is unavailable.
 * @param {string} uid
 * @param {(habits: object[]) => void} onChange
 */
export function subscribeHabits(uid, onChange) {
  if (!isFirestoreReady() || !uid) {
    onChange([..._memHabits]);
    return () => {};
  }
  try {
    const ref = collection(db, 'users', uid, 'habits');
    const q   = query(ref, where('archived', '==', false), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      const habits = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onChange(habits);
    }, (err) => {
      console.warn('[habitService] subscribeHabits failed, using mock:', err.message);
      onChange([..._memHabits]);
    });
  } catch (err) {
    console.warn('[habitService] subscribeHabits error, using mock:', err.message);
    onChange([..._memHabits]);
    return () => {};
  }
}

/**
 * Add a new habit template.
 * @param {string} uid
 * @param {object} habit  (without id)
 * @returns {Promise<string>}  new habit id
 */
export async function addHabit(uid, habit) {
  const id = `habit-${Date.now()}`;
  const doc_ = { ...habit, id, archived: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

  if (!isFirestoreReady() || !uid) {
    _memHabits = [..._memHabits, doc_];
    return id;
  }
  try {
    const ref = doc(db, 'users', uid, 'habits', id);
    await setDoc(ref, { ...doc_, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return id;
  } catch (err) {
    console.warn('[habitService] addHabit failed, using memory:', err.message);
    _memHabits = [..._memHabits, doc_];
    return id;
  }
}

/**
 * Update an existing habit template.
 * @param {string} uid
 * @param {string} habitId
 * @param {Partial<object>} changes
 */
export async function updateHabit(uid, habitId, changes) {
  const updated = { ...changes, updatedAt: new Date().toISOString() };

  if (!isFirestoreReady() || !uid) {
    _memHabits = _memHabits.map((h) => h.id === habitId ? { ...h, ...updated } : h);
    return;
  }
  try {
    const ref = doc(db, 'users', uid, 'habits', habitId);
    await setDoc(ref, { ...updated, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn('[habitService] updateHabit failed, using memory:', err.message);
    _memHabits = _memHabits.map((h) => h.id === habitId ? { ...h, ...updated } : h);
  }
}

/**
 * Delete a habit template and all its logs.
 * @param {string} uid
 * @param {string} habitId
 */
export async function deleteHabit(uid, habitId) {
  if (!isFirestoreReady() || !uid) {
    _memHabits = _memHabits.filter((h) => h.id !== habitId);
    return;
  }
  try {
    await deleteDoc(doc(db, 'users', uid, 'habits', habitId));
  } catch (err) {
    console.warn('[habitService] deleteHabit failed, using memory:', err.message);
    _memHabits = _memHabits.filter((h) => h.id !== habitId);
  }
}

// ---------------------------------------------------------------------------
// Habit Logs
// ---------------------------------------------------------------------------

/**
 * Get all log entries for a given date.
 * @param {string} uid
 * @param {string} dateISO  YYYY-MM-DD
 * @returns {Promise<Object.<string, object>>}  { [habitId]: logEntry }
 */
export async function getLogsForDate(uid, dateISO) {
  if (!isFirestoreReady() || !uid) {
    if (!_memLogs[dateISO]) _memLogs[dateISO] = createMockLogs(dateISO);
    return { ..._memLogs[dateISO] };
  }
  try {
    const col  = collection(db, 'users', uid, 'habitLogs', dateISO, 'items');
    const snap = await getDocs(col);
    const result = {};
    snap.forEach((d) => { result[d.id] = { id: d.id, ...d.data() }; });
    return result;
  } catch (err) {
    console.warn('[habitService] getLogsForDate failed, using memory:', err.message);
    if (!_memLogs[dateISO]) _memLogs[dateISO] = createMockLogs(dateISO);
    return { ..._memLogs[dateISO] };
  }
}

/**
 * Set (upsert) a log entry for a specific habit on a given date.
 * @param {string} uid
 * @param {string} dateISO
 * @param {string} habitId
 * @param {object} logEntry
 */
export async function setLogEntry(uid, dateISO, habitId, logEntry) {
  const entry = { ...logEntry, habitId, updatedAt: new Date().toISOString() };

  if (!isFirestoreReady() || !uid) {
    if (!_memLogs[dateISO]) _memLogs[dateISO] = {};
    _memLogs[dateISO][habitId] = entry;
    return;
  }
  try {
    const ref = doc(db, 'users', uid, 'habitLogs', dateISO, 'items', habitId);
    await setDoc(ref, { ...entry, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn('[habitService] setLogEntry failed, using memory:', err.message);
    if (!_memLogs[dateISO]) _memLogs[dateISO] = {};
    _memLogs[dateISO][habitId] = entry;
  }
}

// ---------------------------------------------------------------------------
// Memorable Moments
// ---------------------------------------------------------------------------

/**
 * Get all memorable moments for a given date.
 * @param {string} uid
 * @param {string} dateISO
 * @returns {Promise<Object.<string, object>>}
 */
export async function getMomentsForDate(uid, dateISO) {
  if (!isFirestoreReady() || !uid) {
    if (!_memMoments[dateISO]) _memMoments[dateISO] = createMockMoments(dateISO);
    return { ..._memMoments[dateISO] };
  }
  try {
    const col  = collection(db, 'users', uid, 'memorableMoments', dateISO, 'items');
    const snap = await getDocs(col);
    const result = {};
    snap.forEach((d) => { result[d.id] = { id: d.id, ...d.data() }; });
    return result;
  } catch (err) {
    console.warn('[habitService] getMomentsForDate failed, using memory:', err.message);
    if (!_memMoments[dateISO]) _memMoments[dateISO] = createMockMoments(dateISO);
    return { ..._memMoments[dateISO] };
  }
}

/**
 * Add a memorable moment for a given date.
 * @param {string} uid
 * @param {string} dateISO
 * @param {object} moment  (without id)
 * @returns {Promise<string>}  new moment id
 */
export async function addMoment(uid, dateISO, moment) {
  const id     = `moment-${Date.now()}`;
  const entry  = { ...moment, id, createdAt: new Date().toISOString() };

  if (!isFirestoreReady() || !uid) {
    if (!_memMoments[dateISO]) _memMoments[dateISO] = {};
    _memMoments[dateISO][id] = entry;
    return id;
  }
  try {
    const ref = doc(db, 'users', uid, 'memorableMoments', dateISO, 'items', id);
    await setDoc(ref, { ...entry, createdAt: serverTimestamp() });
    return id;
  } catch (err) {
    console.warn('[habitService] addMoment failed, using memory:', err.message);
    if (!_memMoments[dateISO]) _memMoments[dateISO] = {};
    _memMoments[dateISO][id] = entry;
    return id;
  }
}

/**
 * Delete a memorable moment.
 * @param {string} uid
 * @param {string} dateISO
 * @param {string} momentId
 */
export async function deleteMoment(uid, dateISO, momentId) {
  if (!isFirestoreReady() || !uid) {
    if (_memMoments[dateISO]) delete _memMoments[dateISO][momentId];
    return;
  }
  try {
    await deleteDoc(doc(db, 'users', uid, 'memorableMoments', dateISO, 'items', momentId));
  } catch (err) {
    console.warn('[habitService] deleteMoment failed, using memory:', err.message);
    if (_memMoments[dateISO]) delete _memMoments[dateISO][momentId];
  }
}

// ---------------------------------------------------------------------------
// Daily Mood
// ---------------------------------------------------------------------------

/**
 * Get the mood for a given date.
 * @param {string} uid
 * @param {string} dateISO
 * @returns {Promise<{value: number, emoji: string, updatedAt: string}|null>}
 */
export async function getMoodForDate(uid, dateISO) {
  if (!isFirestoreReady() || !uid) {
    return _memMoods[dateISO] ?? null;
  }
  try {
    const ref  = doc(db, 'users', uid, 'moods', dateISO);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn('[habitService] getMoodForDate failed, using memory:', err.message);
    return _memMoods[dateISO] ?? null;
  }
}

/**
 * Save the mood for a given date.
 * @param {string} uid
 * @param {string} dateISO
 * @param {number} value  1–10
 * @param {string} emoji
 */
export async function setMoodForDate(uid, dateISO, value, emoji) {
  const entry = { value, emoji, updatedAt: new Date().toISOString() };

  if (!isFirestoreReady() || !uid) {
    _memMoods[dateISO] = entry;
    return;
  }
  try {
    const ref = doc(db, 'users', uid, 'moods', dateISO);
    await setDoc(ref, { ...entry, updatedAt: serverTimestamp() });
  } catch (err) {
    console.warn('[habitService] setMoodForDate failed, using memory:', err.message);
    _memMoods[dateISO] = entry;
  }
}
