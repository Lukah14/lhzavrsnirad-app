import { IonInput } from '@ionic/react';
import DesignButton from '../ui/DesignButton';

export default function OnboardingResults({ goals, onGoalsChange, onContinue }) {
  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">Your Plan</h2>
      <p className="onboarding-results__hint">You can adjust these values anytime.</p>
      <div className="onboarding-results__grid">
        <div className="onboarding-results__field">
          <label>Daily calories</label>
          <IonInput
            type="number"
            value={goals.caloriesGoal}
            onIonInput={(e) => onGoalsChange({ ...goals, caloriesGoal: Number(e.detail.value) || 2000 })}
            className="onboarding-results__input"
          />
        </div>
        <div className="onboarding-results__field">
          <label>Protein (g)</label>
          <IonInput
            type="number"
            value={goals.proteinGoal}
            onIonInput={(e) => onGoalsChange({ ...goals, proteinGoal: Number(e.detail.value) || 150 })}
            className="onboarding-results__input"
          />
        </div>
        <div className="onboarding-results__field">
          <label>Carbs (g)</label>
          <IonInput
            type="number"
            value={goals.carbsGoal}
            onIonInput={(e) => onGoalsChange({ ...goals, carbsGoal: Number(e.detail.value) || 220 })}
            className="onboarding-results__input"
          />
        </div>
        <div className="onboarding-results__field">
          <label>Fat (g)</label>
          <IonInput
            type="number"
            value={goals.fatGoal}
            onIonInput={(e) => onGoalsChange({ ...goals, fatGoal: Number(e.detail.value) || 65 })}
            className="onboarding-results__input"
          />
        </div>
      </div>
      <DesignButton variant="primary" fullWidth onClick={onContinue}>
        Continue
      </DesignButton>
    </div>
  );
}
