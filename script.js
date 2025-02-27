// Import Firebase modules from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js"; // Added onAuthStateChanged

// FOR TESTING ONLY - REMOVE THIS AND USE NETLIFY ENVIRONMENT VARIABLES
const firebaseApiKey = "AIzaSyBODDkKMrgc_eSl5nIPwXf2FzY6MY0o_iE";

// ... (rest of your firebaseConfig and initialization - same as before) ...
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

const signInButton = document.getElementById("googleSignInButton");
const contentDiv = document.getElementById("content");



// Function to fetch user data from Firestore (same as before)
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
        return []; // Return empty array on error
    }
}



// Google Sign-In Function
async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        // User is signed in, no need to do anything here except handle UI
    } catch (error) {
        console.error("❌ Google Sign-In error:", error);
    }
}

// Google Sign-Out Function
async function signOutUser() {
    try {
        await signOut(auth);
        // User is signed out, no need to do anything here except handle UI
    } catch (error) {
        console.error("❌ Sign-out error:", error);
    }
}

// Update UI based on authentication state
function updateUI(user) {
    if (user) {
        // User is signed in
        signInButton.textContent = "Sign Out";
        signInButton.onclick = signOutUser; // Change the click handler
        contentDiv.innerHTML = `<p>Welcome, ${user.displayName}!</p>`;
    } else {
        // User is signed out
        signInButton.textContent = "Sign in with Google";
        signInButton.onclick = signInWithGoogle; // Change the click handler
        contentDiv.innerHTML = "<p>You are signed out.</p>";
    }
}

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    updateUI(user);
     if (user) {
        fetchUserData(); // Fetch user data when signed in.
    }
});

// Initial UI update (in case the user is already signed in on page load)
//  The onAuthStateChanged handles this now, so we don't *need* this line,
//  but it doesn't hurt to have it.  It ensures the UI is correct *immediately*.
updateUI(auth.currentUser);
