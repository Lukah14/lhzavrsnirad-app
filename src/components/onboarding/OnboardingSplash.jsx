import DesignButton from '../ui/DesignButton';

export default function OnboardingSplash({ onGetStarted, onLogIn }) {
  return (
    <div className="onboarding-step onboarding-splash">
      <div className="onboarding-splash__hero">
        <span className="onboarding-splash__icon" aria-hidden="true">🌿</span>
        <h1 className="onboarding-splash__title">Makrion</h1>
        <p className="onboarding-splash__tagline">Your personal health companion</p>
      </div>
      <div className="onboarding-splash__actions">
        <DesignButton variant="primary" fullWidth onClick={onGetStarted}>
          Get Started
        </DesignButton>
        <DesignButton variant="ghost" fullWidth onClick={onLogIn}>
          Log in
        </DesignButton>
      </div>
    </div>
  );
}
