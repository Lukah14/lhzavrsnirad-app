import { memo, useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAppContext } from '../../context/AppContext';

// ---------------------------------------------------------------------------
// Icon assets — light variant (for light mode) and dark variant (for dark mode)
// Place your PNG files in:  src/Navigation Icons/<name>.png
// ---------------------------------------------------------------------------

import nutritionLight from '../../Navigation Icons/Nutrition_Nav_Light.png';
import nutritionDark  from '../../Navigation Icons/Nutrition_Nav_Dark.png';
import activityLight  from '../../Navigation Icons/Activity_Nav_Light.png';
import activityDark   from '../../Navigation Icons/Activity_Nav_Dark.png';
import habitsLight    from '../../Navigation Icons/Habit_Tracker_Nav_Light.png';
import habitsDark     from '../../Navigation Icons/Habit_Tracker_Nav_Dark.png';
import homeLight      from '../../Navigation Icons/Dashboard_Nav_Light.png';
import homeDark       from '../../Navigation Icons/Dashboard_Nav_Dark.png';
import communityLight from '../../Navigation Icons/Community_Nav_Light.png';
import communityDark  from '../../Navigation Icons/Community_Nav_Dark.png';
import switchLight    from '../../Navigation Icons/Switch_Nav_Light.png';
import switchDark     from '../../Navigation Icons/Switch_Nav_Dark.png';
import progressLight  from '../../Navigation Icons/Progress_Nav_Light.png';
import progressDark   from '../../Navigation Icons/Progress_Nav_Dark.png';

import SectionSubnav     from './SectionSubnav';
import { getSectionForPath } from './subnavConfig';
import './bottomNav.css';

// ---------------------------------------------------------------------------
// Nav item definitions
// ---------------------------------------------------------------------------

/**
 * @typedef {{ id: string, labelKey: string, route: string|null,
 *             lightIcon: string, darkIcon: string, action?: () => void }} NavItemDef
 */

/**
 * Build the 6 side items (left 3 + right 3) and the center home item.
 * `toggleTheme` is injected so the SwitchMode item can call it.
 */
function buildNavConfig(toggleTheme) {
  const leftItems = [
    {
      id:        'nutrition',
      labelKey:  'nav.nutrition',
      route:     '/nutrition',
      lightIcon: nutritionLight,
      darkIcon:  nutritionDark,
    },
    {
      id:        'activity',
      labelKey:  'nav.activity',
      route:     '/activity',
      lightIcon: activityLight,
      darkIcon:  activityDark,
    },
    {
      id:        'habits',
      labelKey:  'nav.habits',
      route:     '/habits',
      lightIcon: habitsLight,
      darkIcon:  habitsDark,
    },
  ];

  const rightItems = [
    {
      id:        'community',
      labelKey:  'nav.community',
      route:     '/community',
      lightIcon: communityLight,
      darkIcon:  communityDark,
    },
    {
      id:        'switchMode',
      labelKey:  'nav.switchMode',
      route:     null, // no route — calls action
      action:    toggleTheme,
      lightIcon: switchLight,
      darkIcon:  switchDark,
    },
    {
      id:        'progress',
      labelKey:  'nav.progress',
      route:     '/progress',
      lightIcon: progressLight,
      darkIcon:  progressDark,
    },
  ];

  const homeItem = {
    id:        'home',
    labelKey:  'nav.home',
    route:     '/home',
    lightIcon: homeLight,
    darkIcon:  homeDark,
  };

  return { leftItems, rightItems, homeItem };
}

// ---------------------------------------------------------------------------
// NavItem — single tappable icon button
// ---------------------------------------------------------------------------

const NavItem = memo(function NavItem({
  item,
  isActive,
  isDark,
  onPress,
}) {
  const { t } = useTranslation();
  const icon  = isDark ? item.darkIcon : item.lightIcon;

  return (
    <button
      className={`bn-item${isActive ? ' bn-active' : ''}`}
      onClick={onPress}
      aria-label={t(item.labelKey)}
      aria-current={isActive ? 'page' : undefined}
      type="button"
    >
      <img src={icon} alt="" aria-hidden="true" />
    </button>
  );
});

// ---------------------------------------------------------------------------
// HomeButton — center raised button
// ---------------------------------------------------------------------------

const HomeButton = memo(function HomeButton({ item, isActive, isDark, onPress }) {
  const { t } = useTranslation();
  const icon  = isDark ? item.darkIcon : item.lightIcon;

  return (
    <button
      className={`bn-home-btn${isActive ? ' bn-active' : ''}`}
      onClick={onPress}
      aria-label={t(item.labelKey)}
      aria-current={isActive ? 'page' : undefined}
      type="button"
    >
      <img src={icon} alt="" aria-hidden="true" />
    </button>
  );
});

// ---------------------------------------------------------------------------
// BottomNav — main component
// ---------------------------------------------------------------------------

const BottomNav = memo(function BottomNav() {
  const { theme, toggleTheme } = useAppContext();
  const location = useLocation();
  const history  = useHistory();

  const isDark      = theme === 'dark';
  const currentPath = location.pathname;

  // Only rebuild when toggleTheme reference changes (stable from useCallback)
  const { leftItems, rightItems, homeItem } = useMemo(
    () => buildNavConfig(toggleTheme),
    [toggleTheme]
  );

  const handleNav = (item) => {
    if (item.action) {
      item.action();
      return;
    }
    if (item.route && item.route !== currentPath) {
      history.push(item.route);
    }
  };

  // Detect if the current route belongs to a section that has a subnav
  const activeSection = getSectionForPath(currentPath);

  return (
    <div className="bn-wrap" role="navigation" aria-label="Main navigation">
      {/* Floating sub-navigation popup — only rendered for sections that have one */}
      {activeSection && <SectionSubnav section={activeSection} />}

      <div className="bn-bar">
        {/* ── Left 3 items ── */}
        <div className="bn-side bn-left">
          {leftItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={item.route ? currentPath.startsWith(item.route) : false}
              isDark={isDark}
              onPress={() => handleNav(item)}
            />
          ))}
        </div>

        {/* ── Gap for centre home button ── */}
        <div className="bn-center-gap" aria-hidden="true" />

        {/* ── Right 3 items ── */}
        <div className="bn-side bn-right">
          {rightItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={item.route ? currentPath.startsWith(item.route) : false}
              isDark={isDark}
              onPress={() => handleNav(item)}
            />
          ))}
        </div>

        {/* ── Centre raised home button ── */}
        <HomeButton
          item={homeItem}
          isActive={currentPath === '/home' || currentPath === '/'}
          isDark={isDark}
          onPress={() => handleNav(homeItem)}
        />
      </div>
    </div>
  );
});

export default BottomNav;
