# Cursor spec — Habit Tracker features only

Implement **Habit Tracker functionality only**.

Do **not** change or redefine:
- the overall app workflow
- the app information architecture outside Habit Tracker
- the global UX design system
- the visual style of the rest of the app

Use the existing app structure and existing UI patterns. Focus only on adding the Habit Tracker logic, screens, behavior, and data model.

---

## Scope

Build the Habit Tracker module with these sections:
- Today
- Habits
- Tasks
- Categories
- Timer

This spec is about **features and behavior**, not redesign.

---

## Core entities

Implement support for these item types:
- Habit
- Recurring Task
- One-time Task
- Category
- Custom List
- Reminder
- Note
- Streak / Statistics record

---

## Habit types

Habits must support these evaluation modes:

1. **Yes / No**
   - completed or not completed for a date

2. **Numeric value**
   - user logs a number for a date
   - examples: steps, glasses of water, money saved, pages read

3. **Timer**
   - user logs duration for a date
   - examples: meditation, study, workout

4. **Checklist**
   - habit contains sub-items
   - each sub-item can be completed separately
   - can be implemented now or flagged as locked / future if needed

---

## Habit creation flow

When creating a new item, support 3 creation paths:
- Habit
- Recurring Task
- Task

### Habit creation fields

#### 1. Category
Support predefined categories and custom categories.

Examples from reference behavior:
- Quit a bad habit
- Art
- Meditation
- Study
- Sports
- Entertainment
- Social
- Finance
- Health
- Work
- Nutrition
- Home
- Outdoor
- Other
- Create category

Each category should support:
- id
- label
- icon
- color
- optional user-created flag

#### 2. Evaluation type
User must choose one of:
- Yes / No
- Numeric value
- Timer
- Checklist

#### 3. Main habit definition
Common fields:
- habit name
- optional description

#### 4. Numeric habit definition
For numeric habits, support:
- comparator
- target value
- optional unit
- optional extra goals

Supported comparator options:
- At least
- Less than
- Exactly
- Any value

Examples:
- At least 10000 steps a day
- Exactly 8 glasses a day
- Any value of practice time a day

#### 5. Extra goals for numeric habits
Support optional goals for:
- Weekly goal
- Monthly goal
- Yearly goal
- All time goal
- Single time goal

Each extra goal should be optional and independently configurable.

#### 6. Frequency rules
Support:
- Every day
- Specific days of the week
- Specific days of the month
- Specific days of the year
- Some days per period
- Custom repeat

#### 7. Schedule and reminders
Support:
- start date
- optional end date
- time and reminders
- priority

Priority values:
- Low
- Default
- High

---

## Today section

Purpose:
- show all scheduled items for selected date
- allow quick completion / logging
- allow filtering
- allow custom list views

Required behavior:
- selected date drives visible items
- items can be marked complete directly from Today
- numeric habits can be logged quickly
- timer habits can be started or logged from Today
- task completion updates state immediately
- empty state when no items exist

Support:
- all items filter
- custom list filter
- creation of new list
- clearing filters

### New list
A custom list should support:
- list name
- icon
- visible activity types
- visible categories

---

## Habits section

Purpose:
- show all habits
- give quick access to history and statistics
- allow quick logging for each habit

Each habit card should support these functional elements:
- name
- category reference
- frequency label
- recent day preview
- streak value
- score / completion summary
- open calendar view
- open statistics view
- open edit view
- more actions

For numeric habits, also support:
- quick add / log action
- logging a raw value for a date

### Day status handling
Habit history must support status values such as:
- done / success
- pending
- failed / missed
- future / not available yet
- not scheduled

Status model must work for both yes/no and numeric habits.

---

## Habit detail

Each habit detail screen must support 3 sections:
- Calendar
- Statistics
- Edit

### Calendar section
Support:
- monthly calendar grid
- previous / next month navigation
- colored day states
- selected day inspection
- streak summary
- monthly notes summary

For numeric habits, calendar days should also be able to represent:
- goal met
- partial / pending
- missed
- logged value if needed

### Notes
Support notes tied to:
- a habit
- a specific date or month

### Statistics section
Statistics must differ by habit type.

#### For yes/no habits
Support:
- habit score
- progress across active duration
- current streak
- best streak
- times completed
- summaries for week / month / year / all time
- timeline chart
- period chart
- success / fail donut
- streak challenge / badges

#### For numeric habits
Support:
- habit score
- current streak
- best streak
- total units
- times completed
- week / month / year / all-time summaries
- per-day or per-period chart
- toggle between total and daily average where relevant
- success / pending or success / fail donut
- streak challenge / badges

### Scoring
Implement a consistent scoring rule per habit type.
Examples:
- yes/no score based on completion rate
- numeric score based on percentage of scheduled entries meeting target

### Edit section
Support editing:
- habit name
- category
- description
- reminders
- priority
- frequency
- start date
- end date
- archive state
- restart progress
- delete habit

Restart progress should:
- clear stats history or start a new stats baseline
- keep configuration unless user chooses otherwise

Archive should:
- hide habit from active lists
- preserve history and stats

Delete should:
- permanently remove habit and associated records, unless you implement soft delete

---

## Tasks section

Support two task types:
- Recurring Task
- One-time Task

### One-time task fields
- task name
- category
- date
- reminders
- optional checklist
- priority
- note
- pending task flag

### Recurring task fields
- task name
- category
- recurrence rule
- reminders
- priority
- note

Recurring tasks do not need full habit statistics.

---

## Categories section

Support:
- predefined categories
- create category
- edit category
- delete user category
- assign icon
- assign color
- count linked activities

Category deletion behavior must be safe.
If a category is used, either:
- prevent deletion until reassigned, or
- move linked items to Other

---

## Timer section

Support timer-based activity flow:
- start timer
- pause timer
- resume timer
- stop timer
- save logged duration
- attach result to selected habit or task
- optional manual duration entry

Timer logs must update habit history and statistics.

---

## Streaks and milestones

Implement streak logic for habits.

Required outputs:
- current streak
- best streak
- streak challenge milestones / badges

Example milestone system:
- 1 day
- 7 days
- 15 days
- 30 days
- 60 days
- 100 days

Milestones should unlock automatically from history.

---

## Data model requirements

Use a Firestore-friendly structure.

### Suggested collections

#### `habit_categories`
Fields:
- id
- userId
- name
- icon
- color
- isSystem
- createdAt
- updatedAt

#### `habit_lists`
Fields:
- id
- userId
- name
- icon
- visibleActivityTypes
- visibleCategoryIds
- createdAt
- updatedAt

#### `habits`
Fields:
- id
- userId
- name
- description
- categoryId
- type (`yes_no`, `numeric`, `timer`, `checklist`)
- comparator (`at_least`, `less_than`, `exactly`, `any_value`) nullable
- targetValue nullable
- unit nullable
- extraGoals object
- frequency object
- reminders array
- priority
- startDate
- endDate nullable
- archived
- deleted nullable
- createdAt
- updatedAt

#### `habit_entries`
One record per habit per date when relevant.
Fields:
- id
- habitId
- userId
- date
- status (`done`, `failed`, `pending`, `skipped`, `not_scheduled`)
- numericValue nullable
- durationSeconds nullable
- checklistProgress nullable
- note nullable
- createdAt
- updatedAt

#### `tasks`
Fields:
- id
- userId
- name
- description
- categoryId
- taskType (`one_time`, `recurring`)
- dueDate nullable
- recurrence nullable
- reminders array
- priority
- checklist nullable
- isPendingUntilDone boolean
- status
- archived
- createdAt
- updatedAt

#### `timer_sessions`
Fields:
- id
- userId
- linkedType (`habit`, `task`, `none`)
- linkedId nullable
- startTime
- endTime
- durationSeconds
- date
- createdAt

#### `habit_notes`
Fields:
- id
- habitId
- userId
- date
- monthKey
- content
- createdAt
- updatedAt

#### `habit_stats_cache` (optional)
Precomputed stats for performance.

---

## Derived logic

Implement helper functions for:
- generate scheduled dates from frequency rule
- determine whether habit is due on a date
- evaluate success for yes/no habits
- evaluate success for numeric habits
- evaluate success for timer habits
- compute current streak
- compute best streak
- compute completion rate
- compute total units
- compute period summaries
- compute chart datasets
- compute badge unlocks

---

## Functional behavior rules

1. Completing an item from Today must update all related habit/task state.
2. Logging a numeric value must immediately recalculate success status for that date.
3. Editing a habit must preserve history unless the user explicitly restarts progress.
4. Archiving must hide items from active sections but keep records.
5. Deleting must remove or soft-delete related records consistently.
6. Reminder settings must be stored even if local notification wiring is added later.
7. Calendar and statistics must read from the same source-of-truth entry data.

---

## Reusable logic / component targets

Cursor should organize the module into reusable units such as:
- Habit creation flow logic
- Frequency rule builder
- Comparator selector
- Extra goals manager
- Habit card logic
- Habit detail tabs
- Calendar history engine
- Stats computation service
- Streak service
- Reminder service
- Task form logic
- Timer logging service

---

## Important implementation constraint

Do **not** rewrite my whole app.
Do **not** redefine my app workflow.
Do **not** create a new UX direction.

Only implement the **Habit Tracker feature set and data behavior** based on this spec.
