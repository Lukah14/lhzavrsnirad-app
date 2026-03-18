// ---------------------------------------------------------------------------
// Section sub-navigation config
//
// Each entry maps a bottom-nav section to its sub-tabs.
// `anchorLeft` is a CSS calc() string that positions the popup horizontally
// above the corresponding bottom-nav icon.
//
// Layout math (bn-bar width = 100% of bn-wrap):
//   left side = calc((100% - 80px) / 2)  [80px = center gap]
//   3 items spaced with space-around:
//     item 0 center: (100% - 80px) / 12
//     item 1 center: (100% - 80px) / 4
//     item 2 center: (100% - 80px) * 5 / 12
// ---------------------------------------------------------------------------

import {
  fastFoodOutline,
  restaurantOutline,
  receiptOutline,
  calendarOutline,
  barbellOutline,
  mapOutline,
  checkmarkDoneOutline,
} from 'ionicons/icons';

/** @type {Record<string, { sectionRoute: string, anchorLeft: string, items: Array<{id:string, label:string, icon:string, route:string}> }>} */
export const SUBNAV_CONFIG = {
  nutrition: {
    sectionRoute: '/nutrition',
    anchorLeft: 'calc((100% - 80px) / 12)',
    items: [
      { id: 'food-log', label: 'Food Log', icon: receiptOutline,    route: '/nutrition/food-log' },
      { id: 'food',     label: 'Food',     icon: fastFoodOutline,   route: '/nutrition/search'   },
      { id: 'recipes',  label: 'Recipes',  icon: restaurantOutline, route: '/nutrition/recipes'  },
    ],
  },

  activity: {
    sectionRoute: '/activity',
    anchorLeft: 'calc((100% - 80px) / 4)',
    items: [
      { id: 'today',     label: 'Today',       icon: calendarOutline, route: '/activity/today'     },
      { id: 'exercises', label: 'Exercises',   icon: barbellOutline,  route: '/activity/exercises' },
      { id: 'plans',     label: 'Plans',       icon: mapOutline,      route: '/activity/plans'     },
    ],
  },

  habits: {
    sectionRoute: '/habits',
    anchorLeft: 'calc((100% - 80px) * 5 / 12)',
    items: [
      { id: 'today',  label: 'Today',  icon: calendarOutline,      route: '/habits'        },
      { id: 'habits', label: 'Habits', icon: checkmarkDoneOutline, route: '/habits/manage' },
    ],
  },
};

/**
 * Return the section key ('nutrition' | 'activity' | 'habits') for a given
 * pathname, or null if no section matches.
 *
 * @param {string} pathname
 * @returns {string|null}
 */
export function getSectionForPath(pathname) {
  for (const [key, cfg] of Object.entries(SUBNAV_CONFIG)) {
    if (pathname === cfg.sectionRoute || pathname.startsWith(cfg.sectionRoute + '/')) {
      return key;
    }
  }
  return null;
}
