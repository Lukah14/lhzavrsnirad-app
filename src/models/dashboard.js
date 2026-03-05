// ---------------------------------------------------------------------------
// Data shapes, constants, and mock generators for the Dashboard
// ---------------------------------------------------------------------------

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

/** Emoji icons per meal type */
export const MEAL_ICONS = {
  breakfast: '☕',
  lunch: '🥗',
  dinner: '🍽️',
  snack: '🍎',
};

// ---------------------------------------------------------------------------
// JSDoc typedefs (used as documentation & IDE hints in plain JS)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Goals
 * @property {number} caloriesGoal
 * @property {number} proteinGoal
 * @property {number} carbsGoal
 * @property {number} fatGoal
 * @property {number} waterMlGoal
 */

/**
 * @typedef {Object} Totals
 * @property {number} consumedKcal
 * @property {number} burnedKcal
 * @property {number} proteinG
 * @property {number} carbsG
 * @property {number} fatG
 * @property {number} waterMl
 * @property {number} workoutsCount
 * @property {number} workoutsMinutes
 */

/**
 * @typedef {Object} MacroSubtotal
 * @property {number} kcal
 * @property {number} p  - protein grams
 * @property {number} c  - carbs grams
 * @property {number} f  - fat grams
 */

/**
 * @typedef {Object} MealItem
 * @property {string} name
 * @property {number} kcal
 * @property {number} p
 * @property {number} c
 * @property {number} f
 */

/**
 * @typedef {Object} Meal
 * @property {'breakfast'|'lunch'|'dinner'|'snack'} mealType
 * @property {MealItem[]} itemsPreview  - first 2–3 items for card display
 * @property {MacroSubtotal} subtotal
 */

/**
 * @typedef {Object} Habit
 * @property {string} id
 * @property {string} title
 * @property {boolean} done
 */

/**
 * @typedef {Object} ProgressSnapshot
 * @property {number|null} lastWeightKg
 * @property {number|null} deltaKg       - negative = lost weight
 * @property {number[]} trendPoints      - recent weight readings for sparkline
 */

/**
 * @typedef {Object} DashboardData
 * @property {string}          selectedDate
 * @property {Goals}           goals
 * @property {Totals}          totals
 * @property {Meal[]}          meals
 * @property {Habit[]}         habits
 * @property {ProgressSnapshot} progressSnapshot
 */

// ---------------------------------------------------------------------------
// Empty / zero state factories
// ---------------------------------------------------------------------------

export const EMPTY_GOALS = {
  caloriesGoal: 2000,
  proteinGoal: 150,
  carbsGoal: 220,
  fatGoal: 65,
  waterMlGoal: 2500,
};

export const EMPTY_TOTALS = {
  consumedKcal: 0,
  burnedKcal: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  waterMl: 0,
  workoutsCount: 0,
  workoutsMinutes: 0,
};

export const createEmptyMeals = () =>
  MEAL_TYPES.map((mealType) => ({
    mealType,
    itemsPreview: [],
    subtotal: { kcal: 0, p: 0, c: 0, f: 0 },
  }));

export const EMPTY_PROGRESS_SNAPSHOT = {
  lastWeightKg: null,
  deltaKg: null,
  trendPoints: [],
};

// ---------------------------------------------------------------------------
// Mock data generator (replaces Firestore calls during development)
// ---------------------------------------------------------------------------

/**
 * Returns a fully-populated DashboardData object.
 * @param {string} [date] - ISO date string, defaults to today
 * @returns {DashboardData}
 */
export function createMockDashboardData(date) {
  const d = date ?? new Date().toISOString().split('T')[0];

  return {
    selectedDate: d,
    goals: {
      caloriesGoal: 2000,
      proteinGoal: 150,
      carbsGoal: 220,
      fatGoal: 65,
      waterMlGoal: 2500,
    },
    totals: {
      consumedKcal: 1340,
      burnedKcal: 280,
      proteinG: 89,
      carbsG: 142,
      fatG: 38,
      waterMl: 1250,
      workoutsCount: 1,
      workoutsMinutes: 45,
    },
    meals: [
      {
        mealType: 'breakfast',
        itemsPreview: [
          { name: 'Oatmeal with berries', kcal: 158, p: 6, c: 28, f: 3 },
          { name: 'Banana', kcal: 89, p: 1, c: 23, f: 0 },
          { name: 'Black coffee', kcal: 5, p: 0, c: 1, f: 0 },
        ],
        subtotal: { kcal: 420, p: 22, c: 58, f: 8 },
      },
      {
        mealType: 'lunch',
        itemsPreview: [
          { name: 'Grilled chicken breast', kcal: 165, p: 31, c: 0, f: 4 },
          { name: 'Brown rice (180g)', kcal: 216, p: 5, c: 45, f: 2 },
          { name: 'Broccoli', kcal: 55, p: 4, c: 10, f: 0 },
        ],
        subtotal: { kcal: 620, p: 48, c: 68, f: 9 },
      },
      {
        mealType: 'dinner',
        itemsPreview: [],
        subtotal: { kcal: 0, p: 0, c: 0, f: 0 },
      },
      {
        mealType: 'snack',
        itemsPreview: [
          { name: 'Greek yogurt (200g)', kcal: 130, p: 17, c: 9, f: 3 },
          { name: 'Mixed nuts (30g)', kcal: 170, p: 5, c: 6, f: 15 },
        ],
        subtotal: { kcal: 300, p: 19, c: 16, f: 21 },
      },
    ],
    habits: [
      { id: 'h1', title: 'Morning walk', done: true },
      { id: 'h2', title: 'Drink 2L water', done: true },
      { id: 'h3', title: 'No sugar', done: false },
      { id: 'h4', title: 'Read 20 min', done: false },
      { id: 'h5', title: 'Sleep by 23:00', done: false },
    ],
    progressSnapshot: {
      lastWeightKg: 82.4,
      deltaKg: -0.6,
      trendPoints: [85.2, 84.8, 84.3, 83.9, 83.5, 83.1, 82.8, 82.4],
    },
  };
}

// ---------------------------------------------------------------------------
// Utility: remaining calories formula
// ---------------------------------------------------------------------------

/** @param {Goals} goals @param {Totals} totals @returns {number} */
export function calcRemaining(goals, totals) {
  return goals.caloriesGoal - totals.consumedKcal + totals.burnedKcal;
}

/** @param {number} value @param {number} goal @returns {number} 0–1 */
export function calcRatio(value, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(value / goal, 1);
}
