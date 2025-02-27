// CoinGemUserData.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, doc, onSnapshot, setDoc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

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

// --- New Function:  Change Guild ---
async function changeGuild(userId, newGuild) {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        console.error("User document does not exist!");
        return; // Or throw an error, or initialize the user data
    }

    const userData = userDocSnap.data();
    const now = Date.now();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    let canChange = true;
    let cost = 10;

     if (userData.guild === "Golden Guild") {
        cost = 20;
    }

    // Check cooldown
    if (userData.lastGuildChange) {
        const lastChangeTime = userData.lastGuildChange.toDate(); // Convert Firestore Timestamp to JavaScript Date
        if (now - lastChangeTime < oneWeekInMs) {
            canChange = false;
        }
    }

    // Check tokens
    if (userData.Tokens < cost) {
        canChange = false;
    }


    if (canChange) {
        // Deduct tokens *and* update guild and lastGuildChange
      await updateDoc(userDocRef, {
            Tokens: userData.Tokens - cost,
            guild: newGuild,
            lastGuildChange: serverTimestamp() // Use serverTimestamp for accuracy
        });
        console.log(`Guild changed to ${newGuild}`);
    } else {
       if (userData.Tokens < cost)
       {
          console.log("Not enough tokens to change guilds.");
          throw new Error("Not enough tokens"); // Throw error for UI handling
       }
       else
       {
         console.log("Guild change cooldown active.");
         throw new Error("Cooldown active");// Throw error for UI
       }
    }
}

// --- Modified Function: displayUserStatsRealtime ---
export function displayUserStatsRealtime(userId, gemsElementId, tokensElementId, guildElementId) { // Add guildElementId
    const userDocRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            const gems = userData.Gems;
            const tokens = userData.Tokens;
            const guild = userData.guild || "No Guild"; // Default to "No Guild"

            document.getElementById(gemsElementId).textContent = gems;
            document.getElementById(tokensElementId).textContent = tokens;
            document.getElementById(guildElementId).textContent = guild; // Update guild display

            // Update Guild Buttons based on data
            updateGuildButtonStates(userId);

        } else {
            console.log("No such document! Initializing...");
            initializeUserData(userId)
                .then(() => {
                    displayUserStatsRealtime(userId, gemsElementId, tokensElementId, guildElementId); //recursive
                })
                .catch(err => console.error("Error initializing user data", err));
        }
    }, (error) => {
        console.error("Error listening for document changes:", error);
        document.getElementById(gemsElementId).textContent = 'Error';
        document.getElementById(tokensElementId).textContent = 'Error';
         document.getElementById(guildElementId).textContent = 'Error';
    });
    return unsubscribe;
}

// --- New Function: Update Guild Button States ---
// This function is now *separate* from displayUserStatsRealtime,
// so we can call it independently after a guild change.
async function updateGuildButtonStates(userId) {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        return; // Or handle the missing user case
    }

    const userData = userDocSnap.data();
    const now = Date.now();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    let cost = 10;

     if (userData.guild === "Golden Guild") {
        cost = 20;
    }

    // Get all guild buttons (you'll need to give them IDs in your HTML)
    const guildButtons = {
        "Golden Guild": document.getElementById("golden-guild-button"),
        "Mystic Guild": document.getElementById("mystic-guild-button"),
        "Justice Guild": document.getElementById("justice-guild-button"),
        "Elemental Guild": document.getElementById("elemental-guild-button"),
        "Invisible Guild": document.getElementById("invisible-guild-button"),
        // Add other guilds here...
    };

     // Check cooldown
     let isOnCoolDown = false;
    if (userData.lastGuildChange) {
        const lastChangeTime = userData.lastGuildChange.toDate(); // Convert Firestore Timestamp to JavaScript Date
        if (now - lastChangeTime < oneWeekInMs) {
          isOnCoolDown = true;
        }
    }

    // Loop through the buttons and update their state
    for (const guildName in guildButtons) {
        const button = guildButtons[guildName];
        if (!button) continue; // Skip if button doesn't exist (for safety)

        if (userData.guild === guildName) {
            // Current guild: Disable and style differently
            button.disabled = true;
            button.classList.add("current-guild"); // Add a CSS class for styling
        }
        else if (isOnCoolDown == true || userData.Tokens < cost)
        {
             // Not enough tokens or cooldown active: Disable and show lock
            button.disabled = true;
            button.classList.add("locked-guild");  // Add a CSS class for locked styling
        }
        else {
            // Other guilds: Enable and remove special styling
            button.disabled = false;
            button.classList.remove("current-guild");
            button.classList.remove("locked-guild");
        }
    }
}

// --- Existing Functions (with slight modifications) ---

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
          guild: "No Guild",       // Initialize with no guild
          lastGuildChange: null, // Initialize lastGuildChange
          gmail: "powwerofpowwer@gmail.com", // Consider getting this from the auth object!
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

// Export the new function
export { changeGuild , updateGuildButtonStates};
