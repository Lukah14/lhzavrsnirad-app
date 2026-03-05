import { useCallback, useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';

import { useAppContext } from '../context/AppContext';

import DateHeader          from '../components/dashboard/DateHeader';
import NutritionSummaryCard from '../components/dashboard/NutritionSummaryCard';
import MealLogCard         from '../components/dashboard/MealLogCard';
import ActivityCard        from '../components/dashboard/ActivityCard';
import HabitTrackerCard    from '../components/dashboard/HabitTrackerCard';
import WaterCard           from '../components/dashboard/WaterCard';
import ProgressSnapshotCard from '../components/dashboard/ProgressSnapshotCard';
import DashboardSkeleton   from '../components/dashboard/DashboardSkeleton';

import '../theme/dashboard.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const todayISO = () => new Date().toISOString().split('T')[0];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function HomePage() {
  const { t } = useTranslation();
  const {
    loadDate,
    getDashboardData,
    isDashboardLoading,
    toggleHabit,
    addWater,
  } = useAppContext();

  const [selectedDate, setSelectedDate] = useState(todayISO);

  // Load data whenever the selected date changes
  useEffect(() => {
    loadDate(selectedDate);
  }, [selectedDate, loadDate]);

  const data    = getDashboardData(selectedDate);
  const loading = isDashboardLoading(selectedDate);
  const showSkeleton = loading && !data;

  // Habit toggle — bound to current date
  const handleToggleHabit = useCallback(
    (habitId) => toggleHabit(habitId, selectedDate),
    [toggleHabit, selectedDate]
  );

  // Water add — bound to current date
  const handleAddWater = useCallback(
    (ml) => addWater(ml, selectedDate),
    [addWater, selectedDate]
  );

  return (
    <IonPage className="home-page">
      <IonHeader translucent>
        <IonToolbar>
          <DateHeader
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* Matches header when content scrolls behind it (iOS) */}
        <IonHeader collapse="condense">
          <IonToolbar>
            <DateHeader
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </IonToolbar>
        </IonHeader>

        {showSkeleton && <DashboardSkeleton />}

        {data && (
          <div className="home-scroll-content">
            {/* ① Nutrition summary + macro progress */}
            <NutritionSummaryCard
              goals={data.goals}
              totals={data.totals}
            />

            {/* ② Meal log (4 meals) */}
            <MealLogCard
              meals={data.meals}
              selectedDate={selectedDate}
            />

            {/* ③ Activity */}
            <ActivityCard
              totals={data.totals}
              selectedDate={selectedDate}
            />

            {/* ④ Habit tracker */}
            <HabitTrackerCard
              habits={data.habits}
              onToggle={handleToggleHabit}
              selectedDate={selectedDate}
            />

            {/* ⑤ Water */}
            <WaterCard
              waterMl={data.totals.waterMl}
              waterMlGoal={data.goals.waterMlGoal}
              onAdd={handleAddWater}
            />

            {/* ⑥ Progress snapshot */}
            <ProgressSnapshotCard
              progressSnapshot={data.progressSnapshot}
            />
          </div>
        )}

        {/* Empty state: date has no data and is not loading */}
        {!showSkeleton && !data && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 32px',
              color: 'var(--dash-text-secondary)',
            }}
          >
            <p style={{ fontSize: 16, fontWeight: 600 }}>
              {t('common.noData')}
            </p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}

export default HomePage;
