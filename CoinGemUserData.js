// CoinGemUserData.js

import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  // YOUR FIREBASE CONFIGURATION HERE
  // apiKey: "YOUR_API_KEY",
  // authDomain: "your-project-id.firebaseapp.com",
  // projectId: "your-project-id",
  // ... other config values ...
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
            console.log("No such document!");
            document.getElementById(gemsElementId).textContent = 'N/A';
            document.getElementById(tokensElementId).textContent = 'N/A';
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
