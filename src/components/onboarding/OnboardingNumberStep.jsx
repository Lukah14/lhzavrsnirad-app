import { IonInput } from '@ionic/react';

/**
 * Number input step (Age, Height, Weight).
 * Supports unit toggle for height/weight (cm/kg vs ft/lbs).
 */
export default function OnboardingNumberStep({
  title,
  value,
  onChange,
  min = 0,
  max = 999,
  unit,
  unitOptions,
  onUnitChange,
  placeholder,
}) {
  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">{title}</h2>
      <div className="onboarding-number-row">
        <IonInput
          type="number"
          value={value}
          onIonInput={(e) => onChange(Number(e.detail.value) || 0)}
          min={min}
          max={max}
          placeholder={placeholder}
          className="onboarding-number-input"
        />
        {unitOptions && onUnitChange && (
          <div className="onboarding-unit-toggle">
            {unitOptions.map((u) => (
              <button
                key={u.id}
                type="button"
                className={`onboarding-unit-btn ${unit === u.id ? 'onboarding-unit-btn--active' : ''}`}
                onClick={() => onUnitChange(u.id)}
              >
                {u.label}
              </button>
            ))}
          </div>
        )}
        {unit && !unitOptions && (
          <span className="onboarding-unit-label">{unit}</span>
        )}
      </div>
    </div>
  );
}
