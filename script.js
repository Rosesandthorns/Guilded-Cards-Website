// script.js (Main authentication and navigation)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import {updateProfilePage} from "./profile.js"
// ... (rest of your firebaseConfig - KEEP THIS) ...
const firebaseApiKey = "AIzaSyBODDkKMrgc_eSl5nIPwXf2FzY6MY0o_iE";

if (!firebaseApiKey) {
    console.error("❌ Firebase API Key is missing! Ensure it's set correctly (either directly for testing, or in Netlify environment variables).");
}

const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: "guilded-cards.firebaseapp.com",
    projectId: "guilded-cards",
    storageBucket: "guilded-cards.firebasestorage.app",
    messagingSenderId: "566491650991",
    appId: "1:566491650991:web:324493f697af5dacfeed5a",
    measurementId: "G-96KRMBBE76"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const signInButton = document.getElementById("googleSignInButton"); // Get the sign-in button

// Set Persistence (Optional)
setPersistence(auth, browserSessionPersistence)
    .then(() => {
        // Persistence set (if used)
    })
    .catch((error) => {
        console.error("Error setting persistence:", error);
    });



// Function to fetch user data from Firestore -- MODIFIED
async function fetchUserData() {
    try {
        const user = auth.currentUser; // Get the current user
        if (!user) {
            console.log('No user signed in.');
            return null; // Return null if no user is signed in
        }

        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const docData = docSnap.data();
             if (!docData.gmail || !docData.uid) {
                console.warn(`Document ${docSnap.id} missing required fields`);
            }
            console.log('✅ Fetched user data:', docData);
            return docData; //Return the single user document
        } else {
            console.log('No such document!');
            return null; // No document for this user
        }

    } catch (error) {
        console.error("❌ Firebase error:", error);
        return null; // Return null on error
    }
}

// Function to write user data to Firestore -- MODIFIED
async function writeUserData(user) {
    try {
        const userRef = doc(db, 'users', user.uid); // Use user.uid as the document ID
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            console.log("Document already exists. Not overwriting.");
            return; // Don't overwrite if the document exists
        }

        // Data to write, including gems and tokens with a default of 0
        const userData = {
            uid: user.uid,
            gmail: user.email,
            photourl: user.photoURL,
            username: user.displayName,
            gems: 0,  // Default to 0
            tokens: 0 // Default to 0
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
        await signInWithPopup(auth, provider); // Result not used directly
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

//Helper function to update the gem and token display -- ADDED
function updateGemTokenDisplay(gems, tokens) {
    const gemTokenContainer = document.getElementById('gemTokenContainer');
    if (gemTokenContainer) { //Only update if on a page with this container
        gemTokenContainer.innerHTML = `
            <img src="Guildedicons/GuildedGem.png" alt="Gem Icon" class="currency-icon">
            <span id="gemCount">${gems}</span>
            <img src="Guildedicons/GuildedToken.png" alt="Token Icon" class="currency-icon">
            <span id="tokenCount">${tokens}</span>
        `;
    }
}

// Update UI for sign-in/out button -- MODIFIED
function updateUI(user) {
    if (user) {
        signInButton.textContent = "Sign Out";
        signInButton.onclick = signOutUser;
    } else {
        signInButton.textContent = "Sign in with Google";
        signInButton.onclick = signInWithGoogle;
        //Clear gem/token display when signed out
        updateGemTokenDisplay(0,0);
    }
}

// Export a function that sets up the listener.  This is key! -- MODIFIED
export function setupAuthListener() {
    onAuthStateChanged(auth, async (user) => { // Make this async
        console.log("onAuthStateChanged triggered. User:", user); // LOG 1: Check user

        updateUI(user);

        if (user) {
            await writeUserData(user);
            const userData = await fetchUserData();
            if (userData) {
                updateGemTokenDisplay(userData.gems || 0, userData.tokens || 0);
            }
        }
        updateProfilePage(user); // Call updateProfilePage here!
    });
}


// Call setupAuthListener *after* the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
   setupAuthListener();
   // You *could* call other initialization functions here, too.
});
