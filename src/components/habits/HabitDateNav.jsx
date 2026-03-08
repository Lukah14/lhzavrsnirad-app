import { memo, useCallback } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { useHabitContext } from '../../context/HabitContext';
import { todayISO } from '../../models/habits';

// Short weekday names
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatLabel(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  if (isoDate === todayISO()) return 'Today';
  if (d === tomorrow.getDate() && m - 1 === tomorrow.getMonth() && y === tomorrow.getFullYear()) return 'Tomorrow';
  if (d === yesterday.getDate() && m - 1 === yesterday.getMonth() && y === yesterday.getFullYear()) return 'Yesterday';

  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

function getWeekday(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

function shiftDate(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

const HabitDateNav = memo(function HabitDateNav() {
  const { selectedDate, setSelectedDate } = useHabitContext();
  const isToday = selectedDate === todayISO();

  const prev   = useCallback(() => setSelectedDate((d) => shiftDate(d, -1)), [setSelectedDate]);
  const next   = useCallback(() => setSelectedDate((d) => shiftDate(d, +1)), [setSelectedDate]);
  const goToday = useCallback(() => setSelectedDate(todayISO()), [setSelectedDate]);

  return (
    <nav className="habit-date-nav" aria-label="Date navigation">
      <button
        className="habit-date-nav__arrow"
        onClick={prev}
        aria-label="Previous day"
      >
        <IonIcon icon={chevronBackOutline} />
      </button>

      <div className="habit-date-nav__center">
        <span className="habit-date-nav__label">{formatLabel(selectedDate)}</span>
        <span className="habit-date-nav__weekday">{getWeekday(selectedDate)}</span>
        {!isToday && (
          <button
            className="habit-date-nav__today-pill"
            onClick={goToday}
            aria-label="Go to today"
          >
            Today
          </button>
        )}
      </div>

      <button
        className="habit-date-nav__arrow"
        onClick={next}
        aria-label="Next day"
      >
        <IonIcon icon={chevronForwardOutline} />
      </button>
    </nav>
  );
});

export default HabitDateNav;
