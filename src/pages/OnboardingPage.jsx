import { useState, useEffect, useCallback } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';

import OnboardingSplash from '../components/onboarding/OnboardingSplash';
import OnboardingOptionStep from '../components/onboarding/OnboardingOptionStep';
import OnboardingNumberStep from '../components/onboarding/OnboardingNumberStep';
import OnboardingCalculating from '../components/onboarding/OnboardingCalculating';
import OnboardingResults from '../components/onboarding/OnboardingResults';
import OnboardingAccount from '../components/onboarding/OnboardingAccount';
import DesignButton from '../components/ui/DesignButton';

import { calcGoals, lbsToKg, ftInToCm } from '../utils/onboardingCalc';

import '../components/onboarding/onboarding.css';

const STORAGE_KEY = 'makrion_onboarding_complete';
const GOALS_KEY = 'makrion_goals';

const GOAL_OPTIONS = [
  { id: 'lose', label: 'Lose weight', icon: '📉' },
  { id: 'maintain', label: 'Maintain weight', icon: '⚖️' },
  { id: 'gain', label: 'Gain weight', icon: '📈' },
];

const GENDER_OPTIONS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
];

const ACTIVITY_OPTIONS = [
  { id: 'sedentary', label: 'Sedentary' },
  { id: 'light', label: 'Light' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'active', label: 'Active' },
  { id: 'very', label: 'Very Active' },
  { id: 'extremely', label: 'Extremely Active' },
];

const CALC_MESSAGES = ['Calculating your needs...', 'Almost there...', 'Done!'];

export default function OnboardingPage() {
  const history = useHistory();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    goal: 'maintain',
    gender: 'male',
    age: 25,
    heightCm: 170,
    heightUnit: 'cm',
    heightFt: 5,
    heightIn: 7,
    currentWeightKg: 70,
    weightUnit: 'kg',
    currentWeightLbs: 154,
    targetWeightKg: 70,
    targetWeightLbs: 154,
    activityLevel: 'moderate',
    goals: null,
  });
  const [calcProgress, setCalcProgress] = useState(0);
  const [calcMessage, setCalcMessage] = useState(CALC_MESSAGES[0]);

  const totalSteps = 12;
  const isLastStep = step === totalSteps - 1;
  const isCalculating = step === 9;
  const isSplash = step === 0;
  const isAccount = step === 11;

  const goNext = useCallback(() => {
    if (isLastStep) return;
    if (isCalculating) return;
    setStep((s) => Math.min(totalSteps - 1, s + 1));
  }, [isLastStep, isCalculating, totalSteps]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const handleGetStarted = useCallback(() => setStep(1), []);
  const handleLogIn = useCallback(() => history.push('/login'), [history]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    if (data.goals) {
      localStorage.setItem(GOALS_KEY, JSON.stringify(data.goals));
    }
    history.replace('/home');
  }, [data.goals, history]);

  const handleSkipAccount = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  // Calculating step: animate progress over 2.5s
  useEffect(() => {
    if (!isCalculating) return;
    const start = Date.now();
    const duration = 2500;
    const msgInterval = duration / CALC_MESSAGES.length;

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setCalcProgress(pct);
      const msgIdx = Math.min(
        CALC_MESSAGES.length - 1,
        Math.floor(elapsed / msgInterval)
      );
      setCalcMessage(CALC_MESSAGES[msgIdx]);

      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        setStep(10); // Results
      }
    };
    requestAnimationFrame(tick);
  }, [isCalculating]);

  // When entering Results step, compute goals if not yet done
  useEffect(() => {
    if (step === 10 && !data.goals) {
      const weightKg = data.weightUnit === 'kg' ? data.currentWeightKg : lbsToKg(data.currentWeightLbs);
      const heightCm = data.heightUnit === 'cm'
        ? data.heightCm
        : ftInToCm(data.heightFt, data.heightIn);

      const goals = calcGoals({
        weightKg,
        heightCm,
        age: data.age,
        gender: data.gender,
        activityLevel: data.activityLevel,
        goal: data.goal,
      });
      setData((prev) => ({ ...prev, goals }));
    }
  }, [step, data.goals, data.weightUnit, data.currentWeightKg, data.currentWeightLbs, data.heightUnit, data.heightCm, data.heightFt, data.heightIn, data.age, data.gender, data.activityLevel, data.goal]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <OnboardingSplash onGetStarted={handleGetStarted} onLogIn={handleLogIn} />
        );
      case 1:
        return (
          <OnboardingOptionStep
            title="What's your goal?"
            options={GOAL_OPTIONS}
            selectedId={data.goal}
            onSelect={(id) => setData((p) => ({ ...p, goal: id }))}
          />
        );
      case 2:
        return (
          <OnboardingOptionStep
            title="What's your gender?"
            options={GENDER_OPTIONS}
            selectedId={data.gender}
            onSelect={(id) => setData((p) => ({ ...p, gender: id }))}
          />
        );
      case 3:
        return (
          <OnboardingNumberStep
            title="How old are you?"
            value={data.age}
            onChange={(v) => setData((p) => ({ ...p, age: v }))}
            min={13}
            max={120}
            placeholder="25"
          />
        );
      case 4:
        return (
          <OnboardingNumberStep
            title="What's your height?"
            value={data.heightUnit === 'cm' ? data.heightCm : data.heightFt * 12 + data.heightIn}
            onChange={(v) => {
              if (data.heightUnit === 'cm') {
                setData((p) => ({ ...p, heightCm: v }));
              } else {
                setData((p) => ({ ...p, heightFt: Math.floor(v / 12), heightIn: v % 12 }));
              }
            }}
            unit={data.heightUnit}
            unitOptions={[
              { id: 'cm', label: 'cm' },
              { id: 'ft', label: 'ft/in' },
            ]}
            onUnitChange={(id) => setData((p) => ({ ...p, heightUnit: id }))}
            placeholder={data.heightUnit === 'cm' ? '170' : '67'}
          />
        );
      case 5:
        return (
          <OnboardingNumberStep
            title="Current weight"
            value={data.weightUnit === 'kg' ? data.currentWeightKg : data.currentWeightLbs}
            onChange={(v) => {
              if (data.weightUnit === 'kg') {
                setData((p) => ({ ...p, currentWeightKg: v }));
              } else {
                setData((p) => ({ ...p, currentWeightLbs: v }));
              }
            }}
            unit={data.weightUnit}
            unitOptions={[
              { id: 'kg', label: 'kg' },
              { id: 'lbs', label: 'lbs' },
            ]}
            onUnitChange={(id) => setData((p) => ({ ...p, weightUnit: id }))}
            placeholder={data.weightUnit === 'kg' ? '70' : '154'}
          />
        );
      case 6:
        return (
          <OnboardingNumberStep
            title="Target weight"
            value={data.weightUnit === 'kg' ? data.targetWeightKg : data.targetWeightLbs}
            onChange={(v) => {
              if (data.weightUnit === 'kg') {
                setData((p) => ({ ...p, targetWeightKg: v }));
              } else {
                setData((p) => ({ ...p, targetWeightLbs: v }));
              }
            }}
            unit={data.weightUnit}
            unitOptions={[
              { id: 'kg', label: 'kg' },
              { id: 'lbs', label: 'lbs' },
            ]}
            onUnitChange={(id) => setData((p) => ({ ...p, weightUnit: id }))}
            placeholder={data.weightUnit === 'kg' ? '70' : '154'}
          />
        );
      case 7:
        return (
          <OnboardingOptionStep
            title="Activity level"
            options={ACTIVITY_OPTIONS}
            selectedId={data.activityLevel}
            onSelect={(id) => setData((p) => ({ ...p, activityLevel: id }))}
          />
        );
      case 8:
        return (
          <OnboardingOptionStep
            title="Diet preference"
            options={[
              { id: 'standard', label: 'Standard', icon: '🍽️' },
              { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
              { id: 'vegan', label: 'Vegan', icon: '🌱' },
            ]}
            selectedId={data.diet || 'standard'}
            onSelect={(id) => setData((p) => ({ ...p, diet: id }))}
          />
        );
      case 9:
        return (
          <OnboardingCalculating progress={calcProgress} message={calcMessage} />
        );
      case 10:
        return (
          <OnboardingResults
            goals={data.goals || { caloriesGoal: 2000, proteinGoal: 150, carbsGoal: 220, fatGoal: 65, waterMlGoal: 2500 }}
            onGoalsChange={(g) => setData((p) => ({ ...p, goals: g }))}
            onContinue={goNext}
          />
        );
      case 11:
        return (
          <OnboardingAccount onSignIn={handleComplete} onSkip={handleSkipAccount} />
        );
      default:
        return null;
    }
  };

  return (
    <IonPage className="onboarding-page">
      <IonContent fullscreen>
        <div className="onboarding-container">
          {renderStep()}

          {!isSplash && !isCalculating && !isAccount && step !== 10 && (
            <div className="onboarding-nav">
              <button
                type="button"
                className="onboarding-nav__back"
                onClick={goBack}
              >
                Back
              </button>
              {step !== 10 && (
                <DesignButton
                  className="onboarding-nav__next"
                  variant="primary"
                  onClick={goNext}
                >
                  Next
                </DesignButton>
              )}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
