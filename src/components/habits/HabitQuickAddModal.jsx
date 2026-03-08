import { memo, useState, useCallback } from 'react';
import { IonIcon, IonModal } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHabitContext } from '../../context/HabitContext';
import {
  HABIT_CATEGORIES,
  HABIT_TYPES,
  REPEAT_TYPES,
  TIME_OF_DAY,
  todayISO,
} from '../../models/habits';

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 5;

const EVAL_TYPES = [
  {
    id:   HABIT_TYPES.BOOLEAN,
    icon: '✅',
    labelKey: 'habits.types.boolean',
    hintKey:  'habits.types.booleanHint',
  },
  {
    id:   HABIT_TYPES.NUMERIC,
    icon: '🔢',
    labelKey: 'habits.types.numeric',
    hintKey:  'habits.types.numericHint',
  },
  {
    id:   HABIT_TYPES.TIMER,
    icon: '⏱️',
    labelKey: 'habits.types.timer',
    hintKey:  'habits.types.timerHint',
  },
];

const REPEAT_OPTIONS = [
  { id: REPEAT_TYPES.EVERY_DAY,         labelKey: 'habits.repeat.everyDay',         icon: '📅' },
  { id: REPEAT_TYPES.SPECIFIC_WEEKDAYS, labelKey: 'habits.repeat.specificWeekDays', icon: '📆' },
  { id: REPEAT_TYPES.SOME_DAYS,         labelKey: 'habits.repeat.someDays',         icon: '🗓️' },
];

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ---------------------------------------------------------------------------
// Step components
// ---------------------------------------------------------------------------

function StepCategory({ selected, onSelect }) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="habit-input-label">{t('habits.steps.category')}</p>
      <div className="habit-category-grid">
        {HABIT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`habit-category-btn${selected === cat.id ? ' habit-category-btn--selected' : ''}`}
            onClick={() => onSelect(cat.id)}
            aria-pressed={selected === cat.id}
          >
            <span className="habit-category-btn__icon">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepEvalType({ selected, onSelect }) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="habit-input-label">{t('habits.steps.evalType')}</p>
      <div className="habit-eval-list">
        {EVAL_TYPES.map((et) => (
          <button
            key={et.id}
            className={`habit-eval-btn${selected === et.id ? ' habit-eval-btn--selected' : ''}`}
            onClick={() => onSelect(et.id)}
            aria-pressed={selected === et.id}
          >
            <span className="habit-eval-btn__icon">{et.icon}</span>
            <div>
              <p className="habit-eval-btn__label">{t(et.labelKey)}</p>
              <p className="habit-eval-btn__hint">{t(et.hintKey)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepName({ type, form, onChange }) {
  const { t } = useTranslation();
  const isNumeric = type === HABIT_TYPES.NUMERIC;
  const isTimer   = type === HABIT_TYPES.TIMER;

  return (
    <div>
      <p className="habit-input-label">{t('habits.steps.name')}</p>

      <div className="habit-input-group">
        <label className="habit-input-label">Habit name *</label>
        <input
          className="habit-input-field"
          type="text"
          placeholder="e.g. Drink Water"
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          maxLength={60}
        />
      </div>

      <div className="habit-input-group">
        <label className="habit-input-label">Icon / Emoji</label>
        <input
          className="habit-input-field"
          type="text"
          placeholder="💧"
          value={form.icon}
          onChange={(e) => onChange('icon', e.target.value)}
          maxLength={4}
        />
      </div>

      {(isNumeric || isTimer) && (
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="habit-input-group" style={{ flex: 1 }}>
            <label className="habit-input-label">
              {isTimer ? 'Target (minutes)' : 'Target value'}
            </label>
            <input
              className="habit-input-field"
              type="number"
              min={1}
              placeholder={isTimer ? '15' : '2000'}
              value={form.targetValue}
              onChange={(e) => onChange('targetValue', Number(e.target.value) || 1)}
            />
          </div>
          <div className="habit-input-group" style={{ flex: 1 }}>
            <label className="habit-input-label">Unit</label>
            <input
              className="habit-input-field"
              type="text"
              placeholder={isTimer ? 'min' : 'ml'}
              value={form.unit}
              onChange={(e) => onChange('unit', e.target.value)}
              maxLength={10}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StepRepeat({ form, onChange }) {
  const { t } = useTranslation();
  const [weekdays, setWeekdays] = useState(form.repeatConfig?.weekdays ?? []);

  const handleRepeatSelect = (id) => {
    onChange('repeatType', id);
  };

  const toggleWeekday = (day) => {
    const next = weekdays.includes(day)
      ? weekdays.filter((d) => d !== day)
      : [...weekdays, day];
    setWeekdays(next);
    onChange('repeatConfig', { weekdays: next });
  };

  return (
    <div>
      <p className="habit-input-label">{t('habits.steps.repeat')}</p>
      <div className="habit-repeat-list">
        {REPEAT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            className={`habit-repeat-btn${form.repeatType === opt.id ? ' habit-repeat-btn--selected' : ''}`}
            onClick={() => handleRepeatSelect(opt.id)}
            aria-pressed={form.repeatType === opt.id}
          >
            <span>{opt.icon}</span>
            {t(opt.labelKey)}
          </button>
        ))}
      </div>

      {form.repeatType === REPEAT_TYPES.SPECIFIC_WEEKDAYS && (
        <div style={{ marginTop: 14 }}>
          <label className="habit-input-label">Select days</label>
          <div className="habit-weekday-row">
            {WEEKDAY_LABELS.map((label, i) => (
              <button
                key={i}
                className={`habit-weekday-btn${weekdays.includes(i) ? ' habit-weekday-btn--selected' : ''}`}
                onClick={() => toggleWeekday(i)}
                aria-pressed={weekdays.includes(i)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StepSchedule({ form, onChange }) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="habit-input-label">{t('habits.steps.schedule')}</p>

      <div className="habit-input-group">
        <label className="habit-input-label">Start date</label>
        <input
          className="habit-input-field"
          type="date"
          value={form.startDate}
          onChange={(e) => onChange('startDate', e.target.value)}
        />
      </div>

      <div className="habit-input-group">
        <label className="habit-input-label">End date (optional)</label>
        <input
          className="habit-input-field"
          type="date"
          value={form.endDate ?? ''}
          min={form.startDate}
          onChange={(e) => onChange('endDate', e.target.value || null)}
        />
      </div>

      <div className="habit-input-group">
        <label className="habit-input-label">Priority</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['normal', 'high'].map((p) => (
            <button
              key={p}
              className={`habit-repeat-btn${form.priority === p ? ' habit-repeat-btn--selected' : ''}`}
              style={{ flex: 1 }}
              onClick={() => onChange('priority', p)}
              aria-pressed={form.priority === p}
            >
              {p === 'high' ? '🔴 High' : '⚪ Normal'}
            </button>
          ))}
        </div>
      </div>

      <div className="habit-input-group">
        <label className="habit-input-label">Reminder time (optional)</label>
        <input
          className="habit-input-field"
          type="time"
          value={form.reminderTime ?? ''}
          onChange={(e) => onChange('reminderTime', e.target.value)}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step dots indicator
// ---------------------------------------------------------------------------

function StepDots({ current, total }) {
  return (
    <div className="habit-modal-steps" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`habit-modal-step-dot${
            i + 1 === current ? ' habit-modal-step-dot--active' :
            i + 1 < current  ? ' habit-modal-step-dot--done'   : ''
          }`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------

const INITIAL_FORM = {
  category:     null,
  type:         null,
  name:         '',
  icon:         '',
  targetValue:  1,
  unit:         '',
  step:         1,
  repeatType:   REPEAT_TYPES.EVERY_DAY,
  repeatConfig: {},
  startDate:    todayISO(),
  endDate:      null,
  priority:     'normal',
  reminderTime: '',
  reminderEnabled: false,
  timeOfDay:    TIME_OF_DAY.ANYTIME,
  checklistItems: [],
};

const HabitQuickAddModal = memo(function HabitQuickAddModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { addHabit } = useHabitContext();

  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const updateForm = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const canAdvance = useCallback(() => {
    switch (step) {
      case 1: return Boolean(form.category);
      case 2: return Boolean(form.type);
      case 3: return form.name.trim().length > 0;
      case 4: return Boolean(form.repeatType);
      case 5: return Boolean(form.startDate);
      default: return true;
    }
  }, [step, form]);

  const handleNext = useCallback(async () => {
    if (!canAdvance()) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    // Step 5 → Save
    setSaving(true);
    try {
      const icon = HABIT_CATEGORIES.find((c) => c.id === form.category)?.icon ?? '⭐';
      await addHabit({
        ...form,
        icon: form.icon || icon,
        name: form.name.trim(),
        archived: false,
      });
      handleClose();
    } finally {
      setSaving(false);
    }
  }, [step, form, canAdvance, addHabit]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
    else handleClose();
  }, [step]);

  const handleClose = useCallback(() => {
    setStep(1);
    setForm(INITIAL_FORM);
    onClose();
  }, [onClose]);

  const stepTitles = [
    t('habits.steps.category'),
    t('habits.steps.evalType'),
    t('habits.steps.name'),
    t('habits.steps.repeat'),
    t('habits.steps.schedule'),
  ];

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={handleClose}
      className="habit-modal"
      breakpoints={[0, 1]}
      initialBreakpoint={1}
    >
      <div className="habit-modal-inner">
        <div className="habit-modal-handle" aria-hidden="true" />

        <div className="habit-modal-header">
          <h2 className="habit-modal-title">{stepTitles[step - 1]}</h2>
          <button className="habit-modal-close" onClick={handleClose} aria-label="Close">
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        <StepDots current={step} total={TOTAL_STEPS} />

        <div className="habit-modal-body">
          {step === 1 && (
            <StepCategory
              selected={form.category}
              onSelect={(cat) => { updateForm('category', cat); setStep(2); }}
            />
          )}
          {step === 2 && (
            <StepEvalType
              selected={form.type}
              onSelect={(type) => { updateForm('type', type); setStep(3); }}
            />
          )}
          {step === 3 && (
            <StepName type={form.type} form={form} onChange={updateForm} />
          )}
          {step === 4 && (
            <StepRepeat form={form} onChange={updateForm} />
          )}
          {step === 5 && (
            <StepSchedule form={form} onChange={updateForm} />
          )}
        </div>

        <div className="habit-modal-actions">
          {step > 1 && (
            <button className="habit-btn-secondary" onClick={handleBack}>
              {t('habits.back')}
            </button>
          )}
          {(step === 3 || step === 4 || step === 5) && (
            <button
              className="habit-btn-primary"
              onClick={handleNext}
              disabled={!canAdvance() || saving}
            >
              {step === TOTAL_STEPS ? (saving ? 'Saving…' : t('habits.save')) : t('habits.next')}
            </button>
          )}
        </div>
      </div>
    </IonModal>
  );
});

export default HabitQuickAddModal;
