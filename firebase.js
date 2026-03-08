// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpBSub_KkIU711d2naLk1YomYsxac_qB0",
  authDomain: "macro-luka.firebaseapp.com",
  projectId: "macro-luka",
  storageBucket: "macro-luka.firebasestorage.app",
  messagingSenderId: "583205544472",
  appId: "1:583205544472:web:f159c60e71d5f3db41596d",
  measurementId: "G-ZZ113BEYBR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);