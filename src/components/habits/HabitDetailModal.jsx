import { memo, useState, useEffect, useCallback } from 'react';
import { IonIcon, IonModal } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHabitContext } from '../../context/HabitContext';
import {
  HABIT_CATEGORIES,
  HABIT_TYPES,
  REPEAT_TYPES,
  todayISO,
} from '../../models/habits';

// ---------------------------------------------------------------------------
// HabitDetailModal — edit / delete / archive
// ---------------------------------------------------------------------------

const HabitDetailModal = memo(function HabitDetailModal({ habit, isOpen, onClose }) {
  const { t }                              = useTranslation();
  const { updateHabit, deleteHabit, archiveHabit } = useHabitContext();

  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [confirm, setConfirm] = useState(null); // 'delete' | 'archive'

  // Reset form when habit changes
  useEffect(() => {
    if (habit) {
      setForm({
        name:         habit.name ?? '',
        icon:         habit.icon ?? '',
        category:     habit.category ?? 'other',
        type:         habit.type ?? HABIT_TYPES.BOOLEAN,
        targetValue:  habit.targetValue ?? 1,
        unit:         habit.unit ?? '',
        step:         habit.step ?? 1,
        repeatType:   habit.repeatType ?? REPEAT_TYPES.EVERY_DAY,
        startDate:    habit.startDate ?? todayISO(),
        endDate:      habit.endDate ?? '',
        priority:     habit.priority ?? 'normal',
        reminderTime: habit.reminderTime ?? '',
      });
      setConfirm(null);
    }
  }, [habit]);

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!habit) return;
    setSaving(true);
    try {
      await updateHabit(habit.id, {
        ...form,
        name:      form.name.trim(),
        endDate:   form.endDate || null,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }, [habit, form, updateHabit, onClose]);

  const handleDelete = useCallback(async () => {
    if (!habit) return;
    await deleteHabit(habit.id);
    onClose();
  }, [habit, deleteHabit, onClose]);

  const handleArchive = useCallback(async () => {
    if (!habit) return;
    await archiveHabit(habit.id);
    onClose();
  }, [habit, archiveHabit, onClose]);

  if (!habit) return null;

  const isNumericOrTimer =
    form.type === HABIT_TYPES.NUMERIC || form.type === HABIT_TYPES.TIMER;

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="habit-modal"
      breakpoints={[0, 1]}
      initialBreakpoint={1}
    >
      <div className="habit-modal-inner">
        <div className="habit-modal-handle" aria-hidden="true" />

        <div className="habit-modal-header">
          <h2 className="habit-modal-title">{t('habits.editHabit')}</h2>
          <button className="habit-modal-close" onClick={onClose} aria-label="Close">
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        {confirm ? (
          /* Confirmation screen */
          <div className="habit-modal-body" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>
              {confirm === 'delete' ? '🗑️' : '📦'}
            </p>
            <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--dash-text-primary)', marginBottom: 8 }}>
              {confirm === 'delete' ? 'Delete this habit?' : 'Archive this habit?'}
            </p>
            <p style={{ fontSize: 14, color: 'var(--dash-text-secondary)', marginBottom: 24 }}>
              {confirm === 'delete'
                ? 'This will permanently remove the habit and all its logs.'
                : 'Archived habits are hidden but logs are preserved.'}
            </p>
            <div className="habit-modal-actions" style={{ padding: 0 }}>
              <button className="habit-btn-secondary" onClick={() => setConfirm(null)}>
                {t('habits.cancel')}
              </button>
              <button
                className="habit-btn-primary"
                style={{ background: confirm === 'delete' ? '#ff4646' : 'var(--habit-accent)' }}
                onClick={confirm === 'delete' ? handleDelete : handleArchive}
              >
                {confirm === 'delete' ? t('habits.deleteHabit') : t('habits.archiveHabit')}
              </button>
            </div>
          </div>
        ) : (
          /* Edit form */
          <div className="habit-modal-body">
            {/* Name */}
            <div className="habit-input-group">
              <label className="habit-input-label">Habit name</label>
              <input
                className="habit-input-field"
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                maxLength={60}
              />
            </div>

            {/* Icon */}
            <div className="habit-input-group">
              <label className="habit-input-label">Icon / Emoji</label>
              <input
                className="habit-input-field"
                type="text"
                value={form.icon}
                onChange={(e) => updateField('icon', e.target.value)}
                maxLength={4}
              />
            </div>

            {/* Category */}
            <div className="habit-input-group">
              <label className="habit-input-label">Category</label>
              <select
                className="habit-input-field"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
              >
                {HABIT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target + Unit (numeric/timer) */}
            {isNumericOrTimer && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div className="habit-input-group" style={{ flex: 1 }}>
                  <label className="habit-input-label">Target</label>
                  <input
                    className="habit-input-field"
                    type="number"
                    min={1}
                    value={form.targetValue}
                    onChange={(e) => updateField('targetValue', Number(e.target.value) || 1)}
                  />
                </div>
                <div className="habit-input-group" style={{ flex: 1 }}>
                  <label className="habit-input-label">Unit</label>
                  <input
                    className="habit-input-field"
                    type="text"
                    value={form.unit}
                    onChange={(e) => updateField('unit', e.target.value)}
                    maxLength={10}
                  />
                </div>
              </div>
            )}

            {/* Start date */}
            <div className="habit-input-group">
              <label className="habit-input-label">Start date</label>
              <input
                className="habit-input-field"
                type="date"
                value={form.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
              />
            </div>

            {/* End date */}
            <div className="habit-input-group">
              <label className="habit-input-label">End date (optional)</label>
              <input
                className="habit-input-field"
                type="date"
                value={form.endDate ?? ''}
                onChange={(e) => updateField('endDate', e.target.value || null)}
              />
            </div>

            {/* Priority */}
            <div className="habit-input-group">
              <label className="habit-input-label">Priority</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['normal', 'high'].map((p) => (
                  <button
                    key={p}
                    className={`habit-repeat-btn${form.priority === p ? ' habit-repeat-btn--selected' : ''}`}
                    style={{ flex: 1 }}
                    onClick={() => updateField('priority', p)}
                    aria-pressed={form.priority === p}
                  >
                    {p === 'high' ? '🔴 High' : '⚪ Normal'}
                  </button>
                ))}
              </div>
            </div>

            {/* Save */}
            <div className="habit-modal-actions" style={{ padding: 0, marginTop: 20 }}>
              <button className="habit-btn-secondary" onClick={onClose}>
                {t('habits.cancel')}
              </button>
              <button
                className="habit-btn-primary"
                onClick={handleSave}
                disabled={saving || !form.name?.trim()}
              >
                {saving ? 'Saving…' : t('habits.save')}
              </button>
            </div>

            {/* Danger zone */}
            <button
              className="habit-btn-danger"
              onClick={() => setConfirm('archive')}
              style={{ marginTop: 12 }}
            >
              📦 {t('habits.archiveHabit')}
            </button>
            <button
              className="habit-btn-danger"
              onClick={() => setConfirm('delete')}
            >
              🗑️ {t('habits.deleteHabit')}
            </button>
          </div>
        )}
      </div>
    </IonModal>
  );
});

export default HabitDetailModal;
