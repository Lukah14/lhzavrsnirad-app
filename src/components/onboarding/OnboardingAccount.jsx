import DesignButton from '../ui/DesignButton';

export default function OnboardingAccount({ onSignIn, onSkip }) {
  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">Create Account</h2>
      <p className="onboarding-account__hint">Save your progress and sync across devices.</p>
      <div className="onboarding-account__actions">
        <DesignButton variant="primary" fullWidth onClick={onSignIn}>
          Sign in with Email
        </DesignButton>
        <DesignButton variant="secondary" fullWidth onClick={onSignIn}>
          Sign in with Google
        </DesignButton>
        <DesignButton variant="ghost" fullWidth onClick={onSkip}>
          Skip for now
        </DesignButton>
      </div>
    </div>
  );
}
