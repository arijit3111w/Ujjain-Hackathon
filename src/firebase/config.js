import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; 
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBWReE_O00pQY1vZ3iR3l3wmW5GVjFwBXs",
  authDomain: "kumbh-shilp.firebaseapp.com",
  databaseURL: "https://kumbh-shilp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kumbh-shilp",
  storageBucket: "kumbh-shilp.firebasestorage.app",
  messagingSenderId: "325708771564",
  appId: "1:325708771564:web:5d6a6386c3c7f9c80435c9",
  measurementId: "G-5K7QHH9MZ6",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// REMOVED: setPersistence call from here.
// It will now be managed within AuthContext.jsx for better lifecycle control.

export default app;
