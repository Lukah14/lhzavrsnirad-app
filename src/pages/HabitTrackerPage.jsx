import { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonToolbar,
  IonSpinner,
} from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useHabitContext }            from '../context/HabitContext';
import HabitDateNav                   from '../components/habits/HabitDateNav';
import DailyMoodSection               from '../components/habits/DailyMoodSection';
import HabitSummaryBar                from '../components/habits/HabitSummaryBar';
import HabitCard                      from '../components/habits/HabitCard';
import HabitQuickAddModal             from '../components/habits/HabitQuickAddModal';
import HabitDetailModal               from '../components/habits/HabitDetailModal';
import MemorableMomentsSection        from '../components/habits/MemorableMomentsSection';
import DesignEmptyState               from '../components/ui/DesignEmptyState';

import '../components/habits/habits.css';
import '../theme/dashboard.css';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function HabitTrackerPage() {
  const { t } = useTranslation();
  const location = useLocation();

  const {
    selectedDate,
    setSelectedDate,
    habitsForDate,
    loading,
  } = useHabitContext();

  // Sync date from ?date= query param on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dateParam = params.get('date');
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      setSelectedDate(dateParam);
    }
  }, []); // only on mount

  const [showAddModal,    setShowAddModal]    = useState(false);
  const [detailHabit,     setDetailHabit]     = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const habits = habitsForDate(selectedDate);

  const handleOpenDetail = useCallback((habit) => {
    setDetailHabit(habit);
    setShowDetailModal(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetailModal(false);
    setDetailHabit(null);
  }, []);

  const handleOpenAdd = useCallback((e) => {
    e.currentTarget.blur();
    setShowAddModal(true);
  }, []);

  return (
    <IonPage className="habit-page">
      {/* ── Sticky header: date navigation ── */}
      <IonHeader translucent>
        <IonToolbar>
          <div className="habit-page-header">
            <h1 className="habit-page-title">{t('habits.title')}</h1>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="habit-page-scroll">
        {/* iOS collapsing header mirror */}
        <IonHeader collapse="condense">
          <IonToolbar>
            <div className="habit-page-header">
              <h1 className="habit-page-title">{t('habits.title')}</h1>
            </div>
          </IonToolbar>
        </IonHeader>

        {/* ① Date navigation bar */}
        <HabitDateNav />

        <div className="habit-section-gap" />

        {loading ? (
          <div className="habit-loading">
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <>
            {/* ② Daily mood — 10 emoji check-in */}
            <div className="habit-section">
              <DailyMoodSection />
            </div>

            <div className="habit-section-gap habit-section-gap--sm" />

            {/* ③ Habit summary bar */}
            <div className="habit-section">
              <HabitSummaryBar date={selectedDate} />
            </div>

            {/* ③ Habit list */}
            <div className="habit-list-section">
              {habits.length === 0 ? (
                <div className="habit-list-empty">
                  <div className="habit-list-empty__icon">🌱</div>
                  <p className="habit-list-empty__title">{t('habits.emptyState')}</p>
                  <p className="habit-list-empty__hint">{t('habits.emptyStateHint')}</p>
                  <button
                    className="habit-btn-primary"
                    style={{ marginTop: 0, padding: '12px 28px', width: 'auto' }}
                    onClick={() => setShowAddModal(true)}
                  >
                    {t('habits.addHabit')}
                  </button>
                </div>
              ) : (
                <div role="list" aria-label="Habit list">
                  {habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      date={selectedDate}
                      onOpenDetail={handleOpenDetail}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="habit-section-gap habit-section-gap--lg" />

            {/* ④ Memorable moments */}
            <MemorableMomentsSection />

            <div className="habit-section-gap habit-section-gap--lg" />
          </>
        )}
      </IonContent>

      {/* ── Floating add habit button ── */}
      <button
        className="habit-fab"
        aria-label={t('habits.addHabit')}
        onClick={handleOpenAdd}
      >
        <IonIcon icon={addOutline} />
      </button>

      {/* ── Modals ── */}
      <HabitQuickAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <HabitDetailModal
        habit={detailHabit}
        isOpen={showDetailModal}
        onClose={handleCloseDetail}
      />
    </IonPage>
  );
}

export default HabitTrackerPage;
