import { memo, useState, useCallback } from 'react';
import { IonIcon, IonModal } from '@ionic/react';
import { closeOutline, trashOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHabitContext } from '../../context/HabitContext';
import { ACHIEVEMENT_TAGS, MOOD_EMOJIS } from '../../models/habits';

// ---------------------------------------------------------------------------
// Add Moment Modal
// ---------------------------------------------------------------------------

const MOMENT_MOODS = ['😊', '😄', '🤩', '💪', '🙏', '❤️', '😌', '🎉', '🔥', '✨'];

const INITIAL_MOMENT = {
  text:           '',
  moodEmoji:      '😊',
  photoUrl:       null,
  achievementTag: null,
};

function AddMomentModal({ isOpen, onClose, onSave }) {
  const { t }    = useTranslation();
  const [form, setForm] = useState(INITIAL_MOMENT);
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.text.trim()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        text: form.text.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setForm(INITIAL_MOMENT);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_MOMENT);
    onClose();
  };

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
          <h2 className="habit-modal-title">Add Moment</h2>
          <button className="habit-modal-close" onClick={handleClose} aria-label="Close">
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        <div className="habit-modal-body">
          {/* Text */}
          <div className="habit-input-group">
            <label className="habit-input-label">{t('moments.placeholder')}</label>
            <textarea
              className="habit-input-field"
              rows={3}
              placeholder={t('moments.placeholder')}
              value={form.text}
              onChange={(e) => update('text', e.target.value)}
              maxLength={300}
              style={{ resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
          </div>

          {/* Mood emoji */}
          <div className="habit-input-group">
            <label className="habit-input-label">{t('moments.moodLabel')}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {MOMENT_MOODS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => update('moodEmoji', emoji)}
                  aria-pressed={form.moodEmoji === emoji}
                  style={{
                    fontSize:       22,
                    padding:        '6px 8px',
                    borderRadius:   10,
                    border:         form.moodEmoji === emoji
                      ? '2px solid var(--habit-accent)'
                      : '2px solid transparent',
                    background:     form.moodEmoji === emoji
                      ? 'var(--habit-accent-muted)'
                      : 'transparent',
                    cursor:         'pointer',
                    transition:     'border-color 0.15s, background 0.15s',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Achievement tag */}
          <div className="habit-input-group">
            <label className="habit-input-label">{t('moments.tagLabel')}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ACHIEVEMENT_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => update('achievementTag', form.achievementTag === tag ? null : tag)}
                  aria-pressed={form.achievementTag === tag}
                  style={{
                    padding:       '5px 12px',
                    borderRadius:  20,
                    border:        form.achievementTag === tag
                      ? '1.5px solid var(--habit-accent)'
                      : '1.5px solid var(--dash-card-border)',
                    background:    form.achievementTag === tag
                      ? 'var(--habit-accent-muted)'
                      : 'transparent',
                    color:         form.achievementTag === tag
                      ? 'var(--habit-accent)'
                      : 'var(--dash-text-secondary)',
                    fontSize:      12,
                    fontWeight:    700,
                    cursor:        'pointer',
                    transition:    'all 0.15s',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="habit-modal-actions">
          <button className="habit-btn-secondary" onClick={handleClose}>
            {t('moments.cancel')}
          </button>
          <button
            className="habit-btn-primary"
            onClick={handleSave}
            disabled={saving || !form.text.trim()}
          >
            {saving ? 'Saving…' : t('moments.save')}
          </button>
        </div>
      </div>
    </IonModal>
  );
}

// ---------------------------------------------------------------------------
// Moment Card
// ---------------------------------------------------------------------------

function MomentCard({ moment, onDelete }) {
  return (
    <div className="moment-card">
      <span className="moment-card__emoji" aria-hidden="true">{moment.moodEmoji}</span>
      <div className="moment-card__body">
        <p className="moment-card__text">{moment.text}</p>
        <div className="moment-card__meta">
          {moment.achievementTag && (
            <span className="moment-card__tag">{moment.achievementTag}</span>
          )}
          {moment.time && (
            <span className="moment-card__time">{moment.time}</span>
          )}
        </div>
      </div>
      <button
        className="moment-card__delete"
        onClick={onDelete}
        aria-label="Delete moment"
      >
        <IonIcon icon={trashOutline} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

const MemorableMomentsSection = memo(function MemorableMomentsSection() {
  const { t }           = useTranslation();
  const { selectedDate, momentsForDate, addMoment, deleteMoment } = useHabitContext();

  const [showModal, setShowModal] = useState(false);
  const moments = momentsForDate(selectedDate);

  const handleSave = useCallback(async (momentData) => {
    await addMoment(selectedDate, momentData);
  }, [selectedDate, addMoment]);

  const handleDelete = useCallback(async (momentId) => {
    await deleteMoment(selectedDate, momentId);
  }, [selectedDate, deleteMoment]);

  return (
    <div className="moments-section">
      <div className="moments-section__header">
        <h2 className="moments-section__title">{t('moments.title')}</h2>
        <button
          className="moments-add-btn"
          onClick={() => setShowModal(true)}
          aria-label="Add memorable moment"
        >
          {t('moments.addMoment')}
        </button>
      </div>

      <p className="moments-subtitle">{t('moments.subtitle')}</p>

      {moments.length === 0 ? (
        <div className="moments-empty">
          <div className="moments-empty__icon">📷</div>
          <p>{t('moments.emptyState')}</p>
        </div>
      ) : (
        <div className="moments-list">
          {moments.map((moment) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              onDelete={() => handleDelete(moment.id)}
            />
          ))}
        </div>
      )}

      <AddMomentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </div>
  );
});

export default MemorableMomentsSection;
