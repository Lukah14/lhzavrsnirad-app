/**
 * BMR (Mifflin-St Jeor) and TDEE calculation for onboarding.
 */

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very: 1.9,
  extremely: 2.0,
};

const GOAL_OFFSETS = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

/**
 * @param {Object} p
 * @param {number} p.weightKg
 * @param {number} p.heightCm
 * @param {number} p.age
 * @param {'male'|'female'} p.gender
 * @param {keyof ACTIVITY_MULTIPLIERS} p.activityLevel
 * @param {'lose'|'maintain'|'gain'} p.goal
 */
export function calcGoals({ weightKg, heightCm, age, gender, activityLevel, goal }) {
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const mult = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
  const tdee = bmr * mult;
  const offset = GOAL_OFFSETS[goal] ?? 0;
  const caloriesGoal = Math.round(Math.max(1200, Math.min(4000, tdee + offset)));

  // Macros: ~30% protein, 40% carbs, 30% fat (simplified)
  const proteinGoal = Math.round((caloriesGoal * 0.3) / 4);
  const fatGoal = Math.round((caloriesGoal * 0.3) / 9);
  const carbsGoal = Math.round((caloriesGoal * 0.4) / 4);

  return {
    caloriesGoal,
    proteinGoal,
    carbsGoal,
    fatGoal,
    waterMlGoal: 2500,
  };
}

export function lbsToKg(lbs) {
  return lbs / 2.205;
}

export function kgToLbs(kg) {
  return kg * 2.205;
}

export function ftInToCm(ft, inVal = 0) {
  return (ft * 30.48) + (inVal * 2.54);
}

export function cmToFtIn(cm) {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inVal = Math.round(totalIn % 12);
  return { ft, in: inVal };
}
