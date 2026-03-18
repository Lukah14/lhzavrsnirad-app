import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
/* Ionic core CSS — required */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Ionic optional utilities */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
/* Ionic dark mode palette */
import '@ionic/react/css/palettes/dark.class.css';
/* App-level styles */
import './index.css';
/* Context */
import { AppProvider }        from './context/AppContext';
import { FoodSearchProvider } from './context/FoodSearchContext';
import { FatSecretProvider }  from './context/FatSecretContext';
import { HabitProvider }      from './context/HabitContext';
/* Navigation */
import BottomNav from './components/navigation/BottomNav';
/* Pages */
import HomePage             from './pages/HomePage';
import OnboardingPage      from './pages/OnboardingPage';
import NutritionPage        from './pages/NutritionPage';
import NutritionFoodLogPage from './pages/NutritionFoodLogPage';
import NutritionSearchPage  from './pages/NutritionSearchPage';
import NutritionRecipesPage from './pages/NutritionRecipesPage';
import ActivityPage from './pages/ActivityPage';
import ActivityTodayPage from './pages/ActivityTodayPage';
import ActivityExercisesPage from './pages/ActivityExercisesPage';
import ActivityPlansPage from './pages/ActivityPlansPage';
import CommunityPage from './pages/CommunityPage';
import ProgressPage from './pages/ProgressPage';
import CoachDashboardPage from './pages/coach/CoachDashboardPage';
import CoachClientsPage from './pages/coach/CoachClientsPage';
import CoachPlansPage from './pages/coach/CoachPlansPage';
import CoachMessagesPage from './pages/coach/CoachMessagesPage';
import CoachAnalyticsPage from './pages/coach/CoachAnalyticsPage';
import FatSecretDemoPage    from './pages/FatSecretDemoPage';
import HabitTrackerPage     from './pages/HabitTrackerPage';
// ---------------------------------------------------------------------------
// Placeholder pages — remove once real pages are built
// ---------------------------------------------------------------------------
import ComingSoonCard from './components/ui/ComingSoonCard';
setupIonicReact({ mode: 'ios' });
function App() {
  return (
    <AppProvider>
      {/* FoodSearchProvider must be inside AppProvider (needs useAppContext for uid) */}
      <FoodSearchProvider>
      {/* FatSecretProvider is independent — no AppContext dependency */}
      <FatSecretProvider>
      {/* HabitProvider is inside AppProvider (needs user.uid) */}
      <HabitProvider>
        <IonApp>
          <IonReactRouter>
            <IonRouterOutlet>
            {/* Dashboard */}
            <Route exact path="/home"      component={HomePage} />
            {/* Nutrition */}
            <Route exact path="/nutrition" component={NutritionPage} />
            <Route exact path="/nutrition/food-log" component={NutritionFoodLogPage} />
            <Route exact path="/nutrition/search"   component={NutritionSearchPage} />
            <Route exact path="/nutrition/recipes"  component={NutritionRecipesPage} />
            {/* Activity */}
            <Route exact path="/activity"            component={ActivityPage} />
            <Route exact path="/activity/today"      component={ActivityTodayPage} />
            <Route exact path="/activity/add"        render={() => <Placeholder name="Add Workout" />} />
            <Route exact path="/activity/exercises"  component={ActivityExercisesPage} />
            <Route exact path="/activity/plans"      component={ActivityPlansPage} />
            {/* Habits */}
            <Route exact path="/habits"         component={HabitTrackerPage} />
            <Route exact path="/habits/manage"  render={() => <ComingSoonCard name="Manage Habits" />} />
            {/* Community */}
            <Route exact path="/community" component={CommunityPage} />
            {/* Progress */}
            <Route exact path="/progress" component={ProgressPage} />
            {/* Mode switch */}
            <Route exact path="/mode-switch" render={() => <Placeholder name="Mode Switch" />} />
            {/* Coach mode */}
            <Route exact path="/coach/dashboard" component={CoachDashboardPage} />
            <Route exact path="/coach/clients"   component={CoachClientsPage} />
            <Route exact path="/coach/plans"     component={CoachPlansPage} />
            <Route exact path="/coach/messages"  component={CoachMessagesPage} />
            <Route exact path="/coach/analytics" component={CoachAnalyticsPage} />
            {/* FatSecret demo */}
            <Route exact path="/fatsecret-demo" component={FatSecretDemoPage} />
            {/* Auth */}
            <Route exact path="/login"    render={() => <ComingSoonCard name="Login" />} />
            <Route exact path="/register" render={() => <ComingSoonCard name="Register" />} />
            {/* Onboarding */}
            <Route exact path="/onboarding" component={OnboardingPage} />
            {/* Default redirect — onboarding for first-time, else home */}
            <Route
              exact
              path="/"
              render={() => (
                localStorage.getItem('makrion_onboarding_complete')
                  ? <Redirect to="/home" />
                  : <Redirect to="/onboarding" />
              )}
            />
          </IonRouterOutlet>

          {/* Floating bottom nav — position:fixed, stays above all pages */}
          <BottomNav />
          </IonReactRouter>
        </IonApp>
      </HabitProvider>
      </FatSecretProvider>
      </FoodSearchProvider>
    </AppProvider>
  );
}
export default App;