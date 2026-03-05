import { memo, useCallback, useRef, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonDatetime,
  IonDatetimeButton,
  IonIcon,
  IonModal,
} from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline, calendarOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toISO(date) {
  return date.toISOString().split('T')[0];
}

function offsetDate(isoString, days) {
  const d = new Date(isoString + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return toISO(d);
}

function getWeekNumber(isoString) {
  const d = new Date(isoString + 'T12:00:00');
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
}

/**
 * Returns a human label: "Today", "Yesterday", "Tomorrow", or formatted date.
 * @param {string} isoString
 * @param {(key: string, opts?: object) => string} t
 */
function getDateLabel(isoString, t) {
  const todayISO = toISO(new Date());
  if (isoString === todayISO) return t('common.today');
  if (isoString === offsetDate(todayISO, -1)) return t('common.yesterday');
  if (isoString === offsetDate(todayISO, 1)) return t('common.tomorrow');

  const d = new Date(isoString + 'T12:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
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
const DateHeader = memo(function DateHeader({ selectedDate, onDateChange }) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const modal = useRef(null);

  const todayISO = toISO(new Date());
  const isToday = selectedDate === todayISO;
  const isFuture = selectedDate > todayISO;

  const goBack = useCallback(() => {
    onDateChange(offsetDate(selectedDate, -1));
  }, [selectedDate, onDateChange]);

  const goForward = useCallback(() => {
    onDateChange(offsetDate(selectedDate, 1));
  }, [selectedDate, onDateChange]);

  const goToday = useCallback(() => {
    onDateChange(todayISO);
  }, [todayISO, onDateChange]);

  const handlePickerConfirm = useCallback(
    (e) => {
      const raw = e.detail?.value;
      if (raw) {
        onDateChange(raw.split('T')[0]);
      }
      setPickerOpen(false);
    },
    [onDateChange]
  );

  const label = getDateLabel(selectedDate, t);
  const week = getWeekNumber(selectedDate);

  return (
    <div className="date-header-bar">
      {/* Prev */}
      <button className="date-nav-btn" onClick={goBack} aria-label="Previous day">
        <IonIcon icon={chevronBackOutline} />
      </button>

      {/* Centre: tap to open date picker */}
      <button
        className="date-header-label"
        onClick={() => setPickerOpen(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}
      >
        {label}
        <span>{t('dashboard.weekLabel', { week })}</span>
      </button>

      {/* Today chip — only visible when not on today */}
      {!isToday && (
        <button className="date-today-chip" onClick={goToday}>
          {t('common.today')}
        </button>
      )}

      {/* Calendar icon (pad right side when today chip hidden) */}
      {isToday && (
        <button
          className="date-nav-btn"
          onClick={() => setPickerOpen(true)}
          aria-label="Open date picker"
        >
          <IonIcon icon={calendarOutline} />
        </button>
      )}

      {/* Next */}
      <button className="date-nav-btn" onClick={goForward} aria-label="Next day">
        <IonIcon icon={chevronForwardOutline} />
      </button>

      {/* Date picker modal */}
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

export default DateHeader;
