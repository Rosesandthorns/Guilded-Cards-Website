// CoinGemUserData.js

// Import from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBODDkKMrgc_eSl5nIPwXf2FzY6MY0o_iE", // YOUR API KEY
  authDomain: "guilded-cards.firebaseapp.com",
  projectId: "guilded-cards",
  storageBucket: "guilded-cards.firebasestorage.app",
  messagingSenderId: "566491650991",
  appId: "1:566491650991:web:324493f697af5dacfeed5a",
  measurementId: "G-96KRM8BE76"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to display user stats in real-time.
export function displayUserStatsRealtime(userId, gemsElementId, tokensElementId) {
    const userDocRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            const gems = userData.Gems;
            const tokens = userData.Tokens;

            document.getElementById(gemsElementId).textContent = gems;
            document.getElementById(tokensElementId).textContent = tokens;
        } else {
            console.log("No such document! Initializing...");
             // Initialize user data if the document doesn't exist.
            initializeUserData(userId)
                .then(() => {
                  //Try again to get document
                  displayUserStatsRealtime(userId, gemsElementId, tokensElementId);
                })
                .catch(err => console.error("Error initializing user data", err));
        }
    }, (error) => {
        console.error("Error listening for document changes:", error);
        document.getElementById(gemsElementId).textContent = 'Error';
        document.getElementById(tokensElementId).textContent = 'Error';
    });
    return unsubscribe; // Return the unsubscribe function
}

// Function to stop listening for real-time updates.
export function stopListening(unsubscribeFunction) {
    if (unsubscribeFunction) {
        unsubscribeFunction();
    }
}

// Function to initialize user data in Firestore IF it doesn't exist.
async function initializeUserData(userId) {
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists())
    {
      const initialData = {
        Gems: 5,
        Tokens: 5,
        gmail: "powwerofpowwer@gmail.com", //  Consider getting this from the auth object!
        photourl: "https://lh3.googleusercontent.com/a/ACg8cd1c0lmuEOInmeFp6gsN1clfw6WgnGR4n03Cc", // Consider auth object!
      };

      try {
          await setDoc(userDocRef, initialData);
          console.log("User data initialized for:", userId);
      } catch (error) {
          console.error("Error initializing user data:", error);
          throw error; // Re-throw the error so the caller can handle it.
      }
    }

}
