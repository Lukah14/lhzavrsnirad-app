# Activity Module Blueprint

This document defines the **Activity** section of the application as a clean 3-part structure:

- **Today**
- **Exercises**
- **Plans**

The goal is to keep the Activity module simple, scalable, and easy to use on mobile devices, while still allowing future expansion into a richer fitness ecosystem.

This structure fits the app's **multi-platform, mobile-first** concept and supports the overall health-tracking workflow.

---

## 1. Today

**Today** is the main daily Activity dashboard and activity log.

Its purpose is to help the user quickly understand:
- what they have already done today,
- what is still planned,
- how active they have been,
- and how close they are to their daily movement or training goals.

### Main goals of this screen
- act as the **Activity home screen**
- display the user's **daily activity summary**
- show **planned vs completed activities**
- support quick logging and quick start actions

### Core elements
- **Calories Burned**
- **Activities Done**
- **Planned Activities**
- **Workout Minutes**
- **Steps**
- **Distance**
- **Active Time**
- **Today's Goal Progress**
- **Completed vs Remaining**
- **Next Planned Workout**

### Activity log section
The screen should include a clear **Activity Log** for the selected day.

Example:
- 08:00 Walk – done
- 14:00 Stretching – done
- 18:00 Upper Body Workout – planned

### Extra ideas
- **Today's streak**
- **Best activity today**
- **Most trained body part**
- **Missed planned workout**
- **Weekly mini summary**
- **Mood before / after workout**
- **Energy level**
- **Recovery status**
- **Daily movement score**

### Quick actions
- **Quick Add Activity**
- **Start Planned Workout**
- **Repeat Last Workout**
- **Add Walk**
- **Add Gym Session**

### UI ideas
- progress ring for daily goal
- summary cards at the top
- mini timeline or log feed
- icons for cardio, strength, mobility, stretching
- body highlight preview for trained areas
- clean mobile-first card layout

---

## 2. Exercises

**Exercises** is the searchable exercise library of the app.

Its purpose is to help the user:
- discover exercises,
- learn how to perform them,
- filter exercises based on their needs,
- and add them into workouts or plans.

### Main goals of this screen
- provide a fast and useful **exercise search**
- allow filtering by important fitness attributes
- act as the source for building workouts and programs

### Search options
The user should be able to search by:
- **name**
- **body part**
- **muscle group**
- **difficulty**
- **equipment**
- **duration**
- **goal**
- **workout type**
- **home / gym**
- **beginner / intermediate / advanced**

### Suggested categories
- Chest
- Back
- Arms
- Shoulders
- Legs
- Core
- Full Body
- Cardio
- Stretching
- Mobility
- Warm-up
- Cool-down

### Filters
Recommended filters:
- No equipment
- Home
- Gym
- Beginner
- Intermediate
- Advanced
- Under 5 min
- Under 10 min
- Strength
- Cardio
- Stretching
- Mobility
- Fat loss
- Muscle building
- Recovery

### Exercise card content
Each exercise card can show:
- exercise name
- image or animation preview
- difficulty
- target body part
- equipment needed
- short exercise type label

### Exercise detail page
When the user opens an exercise, it can show:
- **name**
- **target muscles**
- **difficulty**
- **equipment**
- **step-by-step instructions**
- **animation / image / video**
- **suggested reps or duration**
- **common mistakes**
- **tips**
- **easier variation**
- **harder variation**
- **similar exercises**
- **Add to Workout**
- **Add to Plan**
- **Favorite**

### Extra ideas
- recently viewed exercises
- saved favorites
- recommended exercises
- trending exercises
- best exercises for home workouts
- exercises based on user goals

Example exercises:
- Dynamic Chest
- Triceps Dips
- Push-ups
- Standing Biceps Stretch Right

---

## 3. Plans

**Plans** is the part of the Activity module where the user creates, organizes, and follows workouts and training programs.

Its purpose is to allow the user to:
- build workouts,
- plan their week,
- create training programs,
- and save routines for repeated use.

### Main goals of this screen
- combine **workout planning** and **program creation**
- help users structure their training
- allow users to reuse and improve their routines over time

### Main sections inside Plans
- **My Workouts**
- **My Programs**
- **Weekly Planner**
- **Saved Plans**
- **Public Plans**

### What users can create
- a single workout
- a weekly split
- a short challenge
- a structured multi-day or multi-week training program

### Workout builder
A workout can include:
- workout name
- goal
- difficulty
- duration
- exercise list
- sets
- reps
- time-based exercises
- rest time
- notes
- warm-up
- cool-down

Example:
**Upper Body Day**
- 10x Dynamic Chest
- 10x Triceps Dips
- 12x Push-ups
- Standing Biceps Stretch Right – 30s

### Program builder
A program can include:
- program title
- description
- goal
- duration (days/weeks)
- difficulty
- weekly structure
- daily workouts
- recovery days
- notes

Example programs:
- 7-Day Beginner Program
- 14-Day Home Workout Plan
- 30-Day Fat Burn Challenge
- Upper Body Strength Program
- Morning Mobility Program

### Planning and scheduling features
- assign workouts to dates
- week view
- calendar view
- reminders
- drag and reorder exercises
- duplicate workout
- copy last week
- save as template
- archive old plans

### Public / community plans
This can later support:
- browsing plans created by others
- saving public plans
- rating plans
- showing trending plans
- showing beginner-friendly plans
- examples similar to content from fitness publishers such as Leap Fitness Group

---

## Why this 3-part structure works

This structure is strong because it is simple and intuitive:

- **Today** = what is happening now
- **Exercises** = what the user can search and use
- **Plans** = how the user organizes workouts and programs

This creates a natural user flow:
1. check today's progress,
2. search exercises,
3. build or follow a plan.

It is also scalable for future upgrades such as:
- active workout mode,
- AI suggestions,
- coach-created activity plans,
- community workouts,
- activity analytics,
- sleep and recovery integration.

---

## Suggested internal sub-sections

### Today
- Summary
- Planned
- Done
- Activity Log

### Exercises
- Search
- Categories
- Filters
- Favorites
- Exercise Details

### Plans
- Workouts
- Programs
- Calendar
- Saved
- Public

---

## UX direction

The Activity module should feel:
- modern
- clean
- mobile-first
- quick to use
- visually motivating

### Recommended style
- card-based layout
- simple top summary
- fast filters
- strong visual hierarchy
- clean exercise cards
- light/dark mode support
- minimal taps for logging and planning

---

## MVP recommendation

A good first implementation order is:

### Phase 1
- Today
- Exercise search
- Exercise details
- Basic workout creation

### Phase 2
- Weekly planner
- Program creation
- Favorites and saved workouts

### Phase 3
- Public plans
- Ratings
- AI suggestions
- Community features

---

## Final structure

The final Activity section should be:

- **Today**
- **Exercises**
- **Plans**

This is the cleanest 3-part version for the application and gives a strong foundation for future development.
