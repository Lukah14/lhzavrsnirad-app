import { useCallback, useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonToolbar,
} from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { useAppContext }   from '../context/AppContext';

import DashboardHeader     from '../components/dashboard/DashboardHeader';
import DashboardStreakChips from '../components/dashboard/DashboardStreakChips';
import WeekStrip            from '../components/dashboard/WeekStrip';
import NutritionSummaryCard from '../components/dashboard/NutritionSummaryCard';
import MealLogCard          from '../components/dashboard/MealLogCard';
import ActivityCard         from '../components/dashboard/ActivityCard';
import HabitTrackerCard     from '../components/dashboard/HabitTrackerCard';
import WaterCard            from '../components/dashboard/WaterCard';
import ProgressSnapshotCard from '../components/dashboard/ProgressSnapshotCard';
import RecentlyUploadedCard from '../components/dashboard/RecentlyUploadedCard';
import DashboardSkeleton    from '../components/dashboard/DashboardSkeleton';

import '../theme/dashboard.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const todayISO = () => new Date().toISOString().split('T')[0];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function HomePage() {
  const { t }    = useTranslation();
  const history  = useHistory();
  const {
    loadDate,
    getDashboardData,
    isDashboardLoading,
    addWater,
    theme,
    toggleTheme,
  } = useAppContext();

  const [selectedDate, setSelectedDate] = useState(todayISO);

  // Load data whenever the selected date changes — business logic unchanged
  useEffect(() => {
    loadDate(selectedDate);
  }, [selectedDate, loadDate]);

  const data         = getDashboardData(selectedDate);
  const loading      = isDashboardLoading(selectedDate);
  const showSkeleton = loading && !data;

  // Water add bound to current date — unchanged
  const handleAddWater = useCallback(
    (ml) => addWater(ml, selectedDate),
    [addWater, selectedDate]
  );

  return (
    <IonPage className="home-page">
      {/* ── Sticky header: profile + greeting + streak chips + week strip ── */}
      <IonHeader translucent>
        <IonToolbar>
          <DashboardHeader theme={theme} onToggleTheme={toggleTheme} />
        </IonToolbar>
        <IonToolbar>
          <DashboardStreakChips
            nutritionDays={7}
            activityDays={12}
            habitsDays={5}
          />
        </IonToolbar>
        <IonToolbar>
          <WeekStrip
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* iOS collapsing header mirror */}
        <IonHeader collapse="condense">
          <IonToolbar>
            <DashboardHeader theme={theme} onToggleTheme={toggleTheme} />
          </IonToolbar>
          <IonToolbar>
            <DashboardStreakChips
              nutritionDays={7}
              activityDays={12}
              habitsDays={5}
            />
          </IonToolbar>
          <IonToolbar>
            <WeekStrip
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </IonToolbar>
        </IonHeader>

        {showSkeleton && <DashboardSkeleton />}

        {data && (
          <div className="home-scroll-content">
            {/* ① Calorie hero + macro mini-cards */}
            <NutritionSummaryCard
              goals={data.goals}
              totals={data.totals}
            />

            {/* ② Today's Meals (primary meal section) */}
            <MealLogCard
              meals={data.meals}
              selectedDate={selectedDate}
            />

            {/* ③ Recently uploaded feed */}
            <RecentlyUploadedCard
              meals={data.meals}
              selectedDate={selectedDate}
            />

            {/* ④ Activity */}
            <ActivityCard
              totals={data.totals}
              selectedDate={selectedDate}
            />

            {/* ⑤ Habit tracker — self-sources from HabitContext */}
            <HabitTrackerCard selectedDate={selectedDate} />

            {/* ⑥ Water */}
            <WaterCard
              waterMl={data.totals.waterMl}
              waterMlGoal={data.goals.waterMlGoal}
              onAdd={handleAddWater}
            />

            {/* ⑦ Progress snapshot */}
            <ProgressSnapshotCard
              progressSnapshot={data.progressSnapshot}
            />
          </div>
        )}

        {/* Empty state */}
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

      {/* ── Floating action button ── */}
      <button
        className="home-fab"
        aria-label={t('dashboard.addEntry')}
        onClick={(e) => { e.currentTarget.blur(); history.push('/nutrition/search'); }}
      >
        <IonIcon icon={addOutline} />
      </button>
    </IonPage>
  );
}

export default HomePage;
