import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDjF6dRqZsFrlm2dudFV1glNVH3pQY6Bj4",
  authDomain: "guildedcards.firebaseapp.com",
  projectId: "guildedcards",
  storageBucket: "guildedcards.firebasestorage.app",
  messagingSenderId: "987389542542",
  appId: "1:987389542542:web:29a0672b206250b45c49df",
  measurementId: "G-XZFBLG9PL7"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);