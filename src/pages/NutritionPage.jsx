import { Redirect } from 'react-router-dom';

/**
 * Nutrition hub — redirects to Food Log by default.
 */
export default function NutritionPage() {
  return <Redirect to="/nutrition/food-log" />;
}
