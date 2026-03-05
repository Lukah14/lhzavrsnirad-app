// ---------------------------------------------------------------------------
// Firebase configuration
//
// Replace the placeholder values below with your actual Firebase project config.
// You can find these in the Firebase Console:
//   Project settings → Your apps → Web app → Firebase SDK snippet
//
// NEVER commit real API keys to public repositories.
// For CI/CD, use environment variables (VITE_FIREBASE_*) instead.
// ---------------------------------------------------------------------------
import { initializeApp, getApps } from 'firebase/app';
import { getAuth }     from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage }  from 'firebase/storage';
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            ?? 'YOUR_API_KEY',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        ?? 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         ?? 'YOUR_PROJECT_ID',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     ?? 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? 'YOUR_SENDER_ID',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             ?? 'YOUR_APP_ID',
};
// Prevent duplicate initialisation in dev HMR cycles
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;
