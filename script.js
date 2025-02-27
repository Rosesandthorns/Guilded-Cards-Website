import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.Firebase_Key,
  authDomain: "guilded-cards.firebaseapp.com",
  projectId: "guilded-cards",
  storageBucket: "guilded-cards.firebasestorage.app",
  messagingSenderId: "566491650991",
  appId: "1:566491650991:web:324493f697af5dacfeed5a",
  measurementId: "G-96KRMBBE76"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Sign-in with Google button
const googleSignInButton = document.getElementById('googleSignInButton');

googleSignInButton.addEventListener('click', () => {
  if (googleSignInButton.textContent === 'Sign in with Google') {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        console.log("User signed in with Google:", user);
        googleSignInButton.textContent = 'Sign Out';
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error("Error signing in with Google:", error);
      });
  } else {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        googleSignInButton.textContent = 'Sign in with Google';
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  }
});
