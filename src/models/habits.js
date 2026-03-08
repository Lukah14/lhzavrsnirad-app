// ---------------------------------------------------------------------------
// Habit model — constants, helpers, and mock seed data
// ---------------------------------------------------------------------------

/** @readonly */
export const HABIT_TYPES = {
  BOOLEAN:   'boolean',
  NUMERIC:   'numeric',
  TIMER:     'timer',
  CHECKLIST: 'checklist',
};

/** @readonly */
export const REPEAT_TYPES = {
  EVERY_DAY:        'every_day',
  SPECIFIC_WEEKDAYS:'specific_weekdays',
  SPECIFIC_MONTHDAYS:'specific_monthdays',
  SPECIFIC_YEARDAYS: 'specific_yeardays',
  SOME_DAYS:        'some_days',
  CUSTOM:           'custom',
};

/** @readonly */
export const TIME_OF_DAY = {
  ANYTIME:       'anytime',
  START_THE_DAY: 'start_the_day',
  MORNING:       'morning',
  AFTERNOON:     'afternoon',
  EVENING:       'evening',
  BEDTIME:       'bedtime',
};

/** @readonly */
export const HABIT_CATEGORIES = [
  { id: 'quit',          label: 'Quit a bad habit', icon: '🚫' },
  { id: 'art',           label: 'Art',               icon: '✏️' },
  { id: 'meditation',    label: 'Meditation',         icon: '🧘' },
  { id: 'study',         label: 'Study',              icon: '🎓' },
  { id: 'sports',        label: 'Sports',             icon: '🚴' },
  { id: 'entertainment', label: 'Entertainment',      icon: '🎮' },
  { id: 'social',        label: 'Social',             icon: '💬' },
  { id: 'finance',       label: 'Finance',            icon: '💰' },
  { id: 'health',        label: 'Health',             icon: '➕' },
  { id: 'work',          label: 'Work',               icon: '💼' },
  { id: 'nutrition',     label: 'Nutrition',          icon: '🍽️' },
  { id: 'home',          label: 'Home',               icon: '🏠' },
  { id: 'outdoor',       label: 'Outdoor',            icon: '⛰️' },
  { id: 'other',         label: 'Other',              icon: '☰' },
];

/** 10 mood emojis from worst (index 0 = score 1) to best (index 9 = score 10) */
export const MOOD_EMOJIS = ['😭', '😢', '😟', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩'];

/** Achievement tags for memorable moments */
export const ACHIEVEMENT_TAGS = [
  '🏆 Achievement', '💪 Fitness', '📚 Learning', '🍎 Nutrition',
  '🧘 Mindfulness', '💼 Work', '❤️ Relationship', '🎯 Goal', '✨ Gratitude',
];

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Returns today as YYYY-MM-DD */
export const todayISO = () => new Date().toISOString().split('T')[0];

/** Formats a YYYY-MM-DD string as a JS Date at local midnight */
export const parseDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/**
 * Returns true when the habit should appear on the given date.
 * @param {object} habit  habit template
 * @param {string} dateISO  YYYY-MM-DD
 */
export function isScheduledForDate(habit, dateISO) {
  if (!habit || !dateISO) return false;

  // Don't show before start date
  if (habit.startDate && dateISO < habit.startDate) return false;
  // Don't show after end date (if set)
  if (habit.endDate && dateISO > habit.endDate) return false;

  const date = parseDate(dateISO);
  const repeatType = habit.repeatType ?? REPEAT_TYPES.EVERY_DAY;

  switch (repeatType) {
    case REPEAT_TYPES.EVERY_DAY:
      return true;

    case REPEAT_TYPES.SPECIFIC_WEEKDAYS: {
      // repeatConfig.weekdays: number[] — 0=Sun, 1=Mon, …, 6=Sat
      const weekdays = habit.repeatConfig?.weekdays ?? [];
      return weekdays.includes(date.getDay());
    }

    case REPEAT_TYPES.SPECIFIC_MONTHDAYS: {
      // repeatConfig.monthdays: number[] — 1-31
      const monthdays = habit.repeatConfig?.monthdays ?? [];
      return monthdays.includes(date.getDate());
    }

    case REPEAT_TYPES.SOME_DAYS: {
      // repeatConfig.timesPerPeriod: number, period: 'week' | 'month'
      // For MVP, show every day and rely on the user's own discretion
      return true;
    }

    default:
      return true;
  }
}

/**
 * Returns true when the habit's daily log entry is considered "complete".
 * @param {object} habit  habit template
 * @param {object|null} log  daily log entry (or null if no log)
 */
export function isHabitComplete(habit, log) {
  if (!log) return false;

  switch (habit.type) {
    case HABIT_TYPES.BOOLEAN:
      return Boolean(log.completed);

    case HABIT_TYPES.NUMERIC:
      return (log.value ?? 0) >= (habit.targetValue ?? 1);

    case HABIT_TYPES.TIMER:
      return (log.value ?? 0) >= (habit.targetValue ?? 1);

    case HABIT_TYPES.CHECKLIST: {
      const progress = log.checklistProgress ?? {};
      const items = habit.checklistItems ?? [];
      if (items.length === 0) return false;
      return items.every((item) => progress[item.id]);
    }

    default:
      return Boolean(log.completed);
  }
}

/**
 * Calculates the current streak (consecutive completed scheduled days up to today).
 * @param {object} habit  habit template
 * @param {Object.<string, object>} logsByDate  map of YYYY-MM-DD → log entry
 * @returns {number}
 */
export function calcStreak(habit, logsByDate) {
  if (!habit || !logsByDate) return 0;
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().split('T')[0];

    if (!isScheduledForDate(habit, iso)) continue;

    const log = logsByDate[iso];
    if (isHabitComplete(habit, log)) {
      streak++;
    } else {
      // Future dates (today + 1 onward) don't break the streak
      if (i === 0 && !log) continue; // today not yet logged — keep checking
      break;
    }
  }

  return streak;
}

// ---------------------------------------------------------------------------
// Mock seed data (used when Firestore is unavailable)
// ---------------------------------------------------------------------------

const ONE_WEEK_AGO = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
})();

/** @type {Array<object>} */
export const MOCK_HABITS = [
  {
    id:              'habit-water',
    name:            'Drink Water',
    category:        'nutrition',
    icon:            '💧',
    type:            HABIT_TYPES.NUMERIC,
    targetValue:     2000,
    unit:            'ml',
    step:            250,
    checklistItems:  [],
    repeatType:      REPEAT_TYPES.EVERY_DAY,
    repeatConfig:    {},
    startDate:       ONE_WEEK_AGO,
    endDate:         null,
    reminderEnabled: false,
    reminderTime:    '08:00',
    timeOfDay:       TIME_OF_DAY.MORNING,
    priority:        'normal',
    archived:        false,
    createdAt:       new Date().toISOString(),
    updatedAt:       new Date().toISOString(),
  },
  {
    id:              'habit-run',
    name:            'Morning Run',
    category:        'sports',
    icon:            '🏃',
    type:            HABIT_TYPES.BOOLEAN,
    targetValue:     1,
    unit:            '',
    step:            1,
    checklistItems:  [],
    repeatType:      REPEAT_TYPES.EVERY_DAY,
    repeatConfig:    {},
    startDate:       ONE_WEEK_AGO,
    endDate:         null,
    reminderEnabled: false,
    reminderTime:    '07:00',
    timeOfDay:       TIME_OF_DAY.MORNING,
    priority:        'high',
    archived:        false,
    createdAt:       new Date().toISOString(),
    updatedAt:       new Date().toISOString(),
  },
  {
    id:              'habit-meditation',
    name:            'Meditation',
    category:        'meditation',
    icon:            '🧘',
    type:            HABIT_TYPES.TIMER,
    targetValue:     15,
    unit:            'min',
    step:            5,
    checklistItems:  [],
    repeatType:      REPEAT_TYPES.EVERY_DAY,
    repeatConfig:    {},
    startDate:       ONE_WEEK_AGO,
    endDate:         null,
    reminderEnabled: false,
    reminderTime:    '09:00',
    timeOfDay:       TIME_OF_DAY.MORNING,
    priority:        'normal',
    archived:        false,
    createdAt:       new Date().toISOString(),
    updatedAt:       new Date().toISOString(),
  },
  {
    id:              'habit-protein',
    name:            '200g Protein',
    category:        'nutrition',
    icon:            '🥩',
    type:            HABIT_TYPES.NUMERIC,
    targetValue:     200,
    unit:            'g',
    step:            10,
    checklistItems:  [],
    repeatType:      REPEAT_TYPES.EVERY_DAY,
    repeatConfig:    {},
    startDate:       ONE_WEEK_AGO,
    endDate:         null,
    reminderEnabled: false,
    reminderTime:    '12:00',
    timeOfDay:       TIME_OF_DAY.ANYTIME,
    priority:        'normal',
    archived:        false,
    createdAt:       new Date().toISOString(),
    updatedAt:       new Date().toISOString(),
  },
  {
    id:              'habit-nosugar',
    name:            'No Sugar',
    category:        'quit',
    icon:            '🚫',
    type:            HABIT_TYPES.BOOLEAN,
    targetValue:     1,
    unit:            '',
    step:            1,
    checklistItems:  [],
    repeatType:      REPEAT_TYPES.EVERY_DAY,
    repeatConfig:    {},
    startDate:       ONE_WEEK_AGO,
    endDate:         null,
    reminderEnabled: false,
    reminderTime:    '20:00',
    timeOfDay:       TIME_OF_DAY.ANYTIME,
    priority:        'high',
    archived:        false,
    createdAt:       new Date().toISOString(),
    updatedAt:       new Date().toISOString(),
  },
];

/** Mock habit logs for today (some partially done) */
export function createMockLogs(dateISO) {
  const today = todayISO();
  if (dateISO !== today) return {};
  return {
    'habit-water':     { habitId: 'habit-water',     value: 1000, completed: false, updatedAt: new Date().toISOString() },
    'habit-run':       { habitId: 'habit-run',        value: 1,    completed: true,  updatedAt: new Date().toISOString() },
    'habit-meditation':{ habitId: 'habit-meditation', value: 10,   completed: false, updatedAt: new Date().toISOString() },
    'habit-protein':   { habitId: 'habit-protein',    value: 140,  completed: false, updatedAt: new Date().toISOString() },
    'habit-nosugar':   { habitId: 'habit-nosugar',    value: 1,    completed: true,  updatedAt: new Date().toISOString() },
  };
}

/** Mock memorable moments for today */
export function createMockMoments(dateISO) {
  const today = todayISO();
  if (dateISO !== today) return {};
  return {
    'moment-1': {
      id:             'moment-1',
      text:           'Finished a great workout! Feeling strong 💪',
      moodEmoji:      '😄',
      photoUrl:       null,
      achievementTag: '💪 Fitness',
      time:           '08:30',
      createdAt:      new Date().toISOString(),
    },
  };
}
