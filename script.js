import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js"; // Added doc, setDoc, getDoc
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

// FOR TESTING ONLY - REMOVE AND USE NETLIFY ENVIRONMENT VARIABLES
const firebaseApiKey = "AIzaSyBODDkKMrgc_eSl5nIPwXf2FzY6MY0o_iE";

// ... (rest of your firebaseConfig - same as before) ...
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

// Set Persistence (Optional - only if you want different than default)
setPersistence(auth, browserSessionPersistence) // Use browserSessionPersistence
    .then(() => {
        // Persistence set successfully.  Now set up auth change listener.
    })
    .catch((error) => {
        console.error("Error setting persistence:", error);
    });

// Function to fetch user data from Firestore (keep this, but we'll also add a function to *write* data)
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

// Function to write user data to Firestore
async function writeUserData(user) {
    try {
        const userRef = doc(db, 'users', user.uid); // Use user.uid as the document ID
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            console.log("Document already exists. Not overwriting.");
            return; // Don't overwrite if the document exists
        }

        // Data to write (match the structure in your image)
        const userData = {
            uid: user.uid,
            gmail: user.email,
            photourl: user.photoURL,
            username: user.displayName,
        };

        await setDoc(userRef, userData);
        console.log("✅ User data written to Firestore:", userData);

    } catch (error) {
        console.error("❌ Error writing user data to Firestore:", error);
    }
}


// Google Sign-In Function
async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        // User is signed in, data will be written in onAuthStateChanged
    } catch (error) {
        console.error("❌ Google Sign-In error:", error);
    }
}

// Google Sign-Out Function
async function signOutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("❌ Sign-out error:", error);
    }
}

// Update UI based on authentication state
function updateUI(user) {
    if (user) {
        // User is signed in
        signInButton.textContent = "Sign Out";
        signInButton.onclick = signOutUser;
        contentDiv.innerHTML = `<p>Welcome, ${user.displayName}!</p>`;
    } else {
        // User is signed out
        signInButton.textContent = "Sign in with Google";
        signInButton.onclick = signInWithGoogle;
        contentDiv.innerHTML = "<p>You are signed out.</p>";
    }
}

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    updateUI(user);
    if (user) {
        writeUserData(user); // Write user data to Firestore
        fetchUserData();    // Fetch user data (optional, for display)
    }
});

// Initial UI update (handled by onAuthStateChanged now)
