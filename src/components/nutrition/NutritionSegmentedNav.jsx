import { useLocation, useHistory } from 'react-router-dom';

const TABS = [
  { id: 'food-log', label: 'Food Log', route: '/nutrition/food-log' },
  { id: 'food', label: 'Food', route: '/nutrition/search' },
  { id: 'recipes', label: 'Recipes', route: '/nutrition/recipes' },
];

export default function NutritionSegmentedNav() {
  const location = useLocation();
  const history = useHistory();

  const activeTab = TABS.find((t) => location.pathname === t.route || location.pathname.startsWith(t.route + '/'))
    ?.id ?? 'food-log';

  return (
    <div className="nutrition-segmented-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`nutrition-segmented-btn ${activeTab === tab.id ? 'nutrition-segmented-btn--active' : ''}`}
          onClick={() => history.push(tab.route)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
