import { Redirect } from 'react-router-dom';

/**
 * Activity hub — redirects to Today by default.
 */
export default function ActivityPage() {
  return <Redirect to="/activity/today" />;
}
