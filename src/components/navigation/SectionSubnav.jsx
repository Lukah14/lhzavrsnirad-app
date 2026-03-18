import { memo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { SUBNAV_CONFIG } from './subnavConfig';
import './subnav.css';

// ---------------------------------------------------------------------------
// SectionSubnav
//
// Floating sub-navigation popup rendered above the active bottom-nav section
// icon. Receives the `section` key (e.g. 'nutrition') from BottomNav.
//
// Positioning: `position: absolute` inside `.bn-wrap` (the nav wrapper).
// The horizontal anchor is a CSS calc() stored in subnavConfig per section.
// ---------------------------------------------------------------------------

/**
 * Returns true when `currentPath` matches the given sub-tab route.
 * Uses exact match for base routes (e.g. /activity) and startsWith for deeper
 * routes (e.g. /nutrition/search), so /activity never mis-matches /activity/exercises.
 */
function isRouteActive(currentPath, itemRoute) {
  if (currentPath === itemRoute) return true;
  // Only treat as active if there's a path segment after the route
  if (currentPath.startsWith(itemRoute + '/')) return true;
  return false;
}

const SectionSubnav = memo(function SectionSubnav({ section }) {
  const location = useLocation();
  const history  = useHistory();

  const config = SUBNAV_CONFIG[section];
  if (!config) return null;

  const currentPath = location.pathname;

  const handleNav = (route) => {
    if (route !== currentPath) {
      history.push(route);
    }
  };

  return (
    <div
      className="sn-popup"
      style={{ '--sn-anchor-left': config.anchorLeft }}
      role="navigation"
      aria-label={`${section} sub-navigation`}
    >
      <div className="sn-container">
        {config.items.map((item) => {
          const active = isRouteActive(currentPath, item.route);
          return (
            <button
              key={item.id}
              className={`sn-item${active ? ' sn-active' : ''}`}
              onClick={() => handleNav(item.route)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              type="button"
            >
              <div className="sn-icon-wrap">
                <IonIcon icon={item.icon} aria-hidden="true" />
              </div>
              <span className="sn-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default SectionSubnav;
