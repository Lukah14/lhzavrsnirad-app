import DesignProgressRing from '../ui/DesignProgressRing';

export default function OnboardingCalculating({ progress, message }) {
  return (
    <div className="onboarding-step onboarding-calculating">
      <DesignProgressRing
        size={120}
        strokeWidth={8}
        value={progress}
        color="var(--ds-accent)"
      />
      <p className="onboarding-calculating__message">{message}</p>
    </div>
  );
}
