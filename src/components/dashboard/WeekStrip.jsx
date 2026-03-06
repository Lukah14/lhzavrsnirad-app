import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { IonIcon, IonModal, IonDatetime } from '@ionic/react';
import { calendarOutline } from 'ionicons/icons';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toISO(date) {
  return date.toISOString().split('T')[0];
}

function offsetDate(isoString, days) {
  const d = new Date(isoString + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return toISO(d);
}

/**
 * Returns 7 day descriptors centered on `centerISO`.
 * @param {string} centerISO
 * @returns {{ iso: string, letter: string, date: number }[]}
 */
function buildWeekDays(centerISO) {
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(centerISO + 'T12:00:00');
    d.setDate(d.getDate() + i);
    days.push({
      iso:    toISO(d),
      letter: DAY_LETTERS[d.getDay()],
      date:   d.getDate(),
    });
  }
  return days;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   selectedDate: string,
 *   onDateChange: (isoDate: string) => void
 * }} props
 */
const WeekStrip = memo(function WeekStrip({ selectedDate, onDateChange }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const modal = useRef(null);

  const todayISO = useMemo(() => toISO(new Date()), []);

  // Build 7 days centered on today (not selectedDate) so the strip stays stable;
  // if selectedDate is outside ±3 days, re-centre on it.
  const centerISO = useMemo(() => {
    const diff = Math.abs(
      (new Date(selectedDate + 'T12:00:00') - new Date(todayISO + 'T12:00:00')) /
      86400000
    );
    return diff > 3 ? selectedDate : todayISO;
  }, [selectedDate, todayISO]);

  const days = useMemo(() => buildWeekDays(centerISO), [centerISO]);

  const handleDayClick = useCallback(
    (iso) => onDateChange(iso),
    [onDateChange]
  );

  const handlePickerConfirm = useCallback(
    (e) => {
      const raw = e.detail?.value;
      if (raw) onDateChange(raw.split('T')[0]);
      setPickerOpen(false);
    },
    [onDateChange]
  );

  return (
    <div className="week-strip-row">
      <div className="week-strip">
        {days.map((day) => {
          const isSelected = day.iso === selectedDate;
          const isToday    = day.iso === todayISO;
          const isFuture   = day.iso > todayISO;
          return (
            <button
              key={day.iso}
              className={[
                'week-day',
                isSelected ? 'selected' : '',
                isToday    ? 'today'    : '',
                isFuture   ? 'future'   : '',
              ].join(' ').trim()}
              onClick={() => handleDayClick(day.iso)}
              aria-label={day.iso}
              aria-pressed={isSelected}
            >
              <span className="week-day-letter">{day.letter}</span>
              <span className="week-day-number">{day.date}</span>
            </button>
          );
        })}
      </div>

      {/* Calendar icon opens full date picker */}
      <button
        className="week-strip-cal-btn"
        onClick={() => setPickerOpen(true)}
        aria-label="Open date picker"
      >
        <IonIcon icon={calendarOutline} />
      </button>

      <IonModal
        ref={modal}
        isOpen={pickerOpen}
        onDidDismiss={() => setPickerOpen(false)}
        style={{ '--height': 'auto' }}
      >
        <IonDatetime
          presentation="date"
          value={selectedDate}
          onIonChange={handlePickerConfirm}
          max={offsetDate(todayISO, 30)}
          showDefaultButtons
          doneText="OK"
          cancelText="Cancel"
        />
      </IonModal>
    </div>
  );
});

export default WeekStrip;
