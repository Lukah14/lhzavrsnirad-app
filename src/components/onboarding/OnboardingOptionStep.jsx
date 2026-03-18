/**
 * Reusable option-card step (Goal, Gender, Activity, Diet).
 * options: [{ id, label, icon? }]
 */
export default function OnboardingOptionStep({ title, options, selectedId, onSelect }) {
  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">{title}</h2>
      <div className="onboarding-options">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`onboarding-option ${selectedId === opt.id ? 'onboarding-option--selected' : ''}`}
            onClick={() => onSelect(opt.id)}
          >
            {opt.icon && <span className="onboarding-option__icon">{opt.icon}</span>}
            <span className="onboarding-option__label">{opt.label}</span>
            {selectedId === opt.id && (
              <span className="onboarding-option__check" aria-hidden="true">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
