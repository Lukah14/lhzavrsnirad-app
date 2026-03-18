import { memo, useMemo } from 'react';
import { IonIcon } from '@ionic/react';
import { moonOutline, sunnyOutline, briefcaseOutline } from 'ionicons/icons';
import { useAppContext } from '../../context/AppContext';

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getGreetingEmoji() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return '👋';
  if (h >= 12 && h < 17) return '☀️';
  return '🌙';
}

const DashboardHeader = memo(function DashboardHeader({ theme, onToggleTheme }) {
  const { user } = useAppContext();
  const isDark = theme === 'dark';
  const greeting = useMemo(() => getGreeting(), []);
  const emoji = useMemo(() => getGreetingEmoji(), []);
  const displayName = user?.displayName || 'User';

  return (
    <div className="dashboard-header">
      <div className="dashboard-header__left">
        <div className="dashboard-header__avatar-wrap">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="dashboard-header__avatar"
            />
          ) : (
            <div className="dashboard-header__avatar dashboard-header__avatar--placeholder">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="dashboard-header__online" aria-hidden="true" />
        </div>
        <div className="dashboard-header__greeting">
          <span className="dashboard-header__greeting-text">
            {greeting} {emoji}
          </span>
          <span className="dashboard-header__name">{displayName}</span>
        </div>
      </div>
      <div className="dashboard-header__actions">
        <button
          type="button"
          className="dashboard-header__icon-btn"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <IonIcon icon={isDark ? sunnyOutline : moonOutline} />
        </button>
        <button
          type="button"
          className="dashboard-header__icon-btn"
          aria-label="Notifications"
        >
          <IonIcon icon={briefcaseOutline} />
        </button>
      </div>
    </div>
  );
});

export default DashboardHeader;
