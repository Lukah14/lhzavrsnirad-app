import { memo } from 'react';
import { IonIcon } from '@ionic/react';
import { nutritionOutline, fitnessOutline, checkmarkDoneOutline } from 'ionicons/icons';

/**
 * Top streak chips row (Figma target).
 * Nutrition, Activity, Habits with streak day counts.
 * TODO: Derive real streak data from dashboard/history.
 */
const DashboardStreakChips = memo(function DashboardStreakChips({
  nutritionDays = 7,
  activityDays = 12,
  habitsDays = 5,
}) {
  const chips = [
    {
      id: 'nutrition',
      label: `${nutritionDays}d Nutrition`,
      icon: nutritionOutline,
      bgClass: 'dashboard-streak-chip--nutrition',
      iconClass: 'dashboard-streak-chip__icon--nutrition',
    },
    {
      id: 'activity',
      label: `${activityDays}d Activity`,
      icon: fitnessOutline,
      bgClass: 'dashboard-streak-chip--activity',
      iconClass: 'dashboard-streak-chip__icon--activity',
    },
    {
      id: 'habits',
      label: `${habitsDays}d Habits`,
      icon: checkmarkDoneOutline,
      bgClass: 'dashboard-streak-chip--habits',
      iconClass: 'dashboard-streak-chip__icon--habits',
    },
  ];

  return (
    <div className="dashboard-streak-chips">
      {chips.map((chip) => (
        <div
          key={chip.id}
          className={`dashboard-streak-chip ${chip.bgClass}`}
        >
          <IonIcon icon={chip.icon} className={chip.iconClass} />
          <span className="dashboard-streak-chip__label">{chip.label}</span>
        </div>
      ))}
    </div>
  );
});

export default DashboardStreakChips;
