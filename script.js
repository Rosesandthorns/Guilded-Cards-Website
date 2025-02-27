// Import Firebase modules from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

// FOR TESTING ONLY - REMOVE THIS AND USE NETLIFY ENVIRONMENT VARIABLES
const firebaseApiKey = "AIzaSyBODDkKMrgc_eSl5nIPwXf2FzY6MY0o_iE";

// If you're still using the environment variable approach *after* testing, uncomment this
// and make sure the variable is set in Netlify.
// const firebaseApiKey = import.meta.env.VITE_Firebase_Key;

if (!firebaseApiKey) {
  console.error("❌ Firebase API Key is missing! Ensure it's set correctly (either directly for testing, or in Netlify environment variables).");
}

// Firebase configuration object
const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: "guilded-cards.firebaseapp.com",
  projectId: "guilded-cards",
  storageBucket: "guilded-cards.firebasestorage.app",
  messagingSenderId: "566491650991",
  appId: "1:566491650991:web:324493f697af5dacfeed5a",
  measurementId: "G-96KRMBBE76"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// Function to fetch user data from Firestore
async function fetchUserData() {
  try {
    const collectionRef = collection(db, 'users');
    const snapshot = await getDocs(collectionRef);

    if (snapshot.empty) {
      console.log('No documents found');
      return [];
    }

    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      if (!docData.gmail || !docData.uid) {
        console.warn(`Document ${doc.id} missing required fields`);
        return null;
      }
      return docData;
    }).filter(Boolean);

    console.log('✅ Fetched user data:', data);
    return data;
  } catch (error) {
    console.error("❌ Firebase error:", error);
    return []; // Return an empty array on error.  Important for later use.
  }
}

// Google Sign-In Function
async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("✅ User signed in:", user);
    document.getElementById("content").innerHTML = `<p>Welcome, ${user.displayName}!</p>`;
  } catch (error) {
    console.error("❌ Google Sign-In error:", error);
  }
}

// Google Sign-Out Function
async function signOutUser() {
  try {
    await signOut(auth);
    console.log("✅ User signed out.");
    document.getElementById("content").innerHTML = "<p>You have signed out.</p>";
  } catch (error) {
    console.error("❌ Sign-out error:", error);
  }
}

// Attach event listeners to the sign-in button
document.getElementById("googleSignInButton").addEventListener("click", signInWithGoogle);

// Example usage of fetching Firestore data
fetchUserData().then(userData => {
  if (userData) {
    console.log("✅ User Data:", userData);
  }
});

// Attach event listener for sign-out button (if you add one later)
const signOutButton = document.getElementById("signOutButton");  // Get the button element
if (signOutButton) { // Check if the button exists (it might not on all pages)
	signOutButton.addEventListener("click", signOutUser);
}
