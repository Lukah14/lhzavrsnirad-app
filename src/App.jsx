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
import { AppProvider } from './context/AppContext';

/* Pages */
import HomePage from './pages/HomePage';

// ---------------------------------------------------------------------------
// Placeholder pages — remove once real pages are built
// ---------------------------------------------------------------------------

const Placeholder = ({ name }) => (
  <div style={{ padding: 32, color: 'var(--ion-text-color)', fontFamily: 'sans-serif' }}>
    <h2 style={{ fontWeight: 700 }}>{name}</h2>
    <p style={{ opacity: 0.6 }}>Page coming soon.</p>
  </div>
);

setupIonicReact({ mode: 'ios' });

function App() {
  return (
    <AppProvider>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            {/* Dashboard */}
            <Route exact path="/home"      component={HomePage} />

            {/* Nutrition */}
            <Route exact path="/nutrition" render={() => <Placeholder name="Nutrition" />} />
            <Route exact path="/nutrition/food-log" render={() => <Placeholder name="Food Log" />} />
            <Route exact path="/nutrition/search"   render={() => <Placeholder name="Food Search" />} />
            <Route exact path="/nutrition/recipes"  render={() => <Placeholder name="Recipes" />} />

            {/* Activity */}
            <Route exact path="/activity"      render={() => <Placeholder name="Activity" />} />
            <Route exact path="/activity/add"  render={() => <Placeholder name="Add Workout" />} />

            {/* Habits */}
            <Route exact path="/habits" render={() => <Placeholder name="Habit Tracker" />} />

            {/* Community */}
            <Route exact path="/community" render={() => <Placeholder name="Community" />} />

            {/* Progress */}
            <Route exact path="/progress" render={() => <Placeholder name="Progress" />} />

            {/* Mode switch */}
            <Route exact path="/mode-switch" render={() => <Placeholder name="Mode Switch" />} />

            {/* Coach mode */}
            <Route exact path="/coach/dashboard" render={() => <Placeholder name="Coach Dashboard" />} />
            <Route exact path="/coach/clients"   render={() => <Placeholder name="Clients" />} />
            <Route exact path="/coach/plans"     render={() => <Placeholder name="Plans" />} />
            <Route exact path="/coach/messages"  render={() => <Placeholder name="Messages" />} />
            <Route exact path="/coach/analytics" render={() => <Placeholder name="Analytics" />} />

            {/* Auth */}
            <Route exact path="/login"    render={() => <Placeholder name="Login" />} />
            <Route exact path="/register" render={() => <Placeholder name="Register" />} />

            {/* Default redirect */}
            <Route exact path="/" render={() => <Redirect to="/home" />} />
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </AppProvider>
  );
}

export default App;
