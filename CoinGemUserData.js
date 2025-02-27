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

// --- Guild Data (Centralized) ---
const guildData = {
    "Golden Guild": { cost: 20 },
    "Mystic Guild": { cost: 10 },
    "Justice Guild": { cost: 10 },
    "Elemental Guild": { cost: 10 },
    "Invisible Guild": { cost: 10 },
    "Glass Guild": {cost: 10}, // Added Glass Guild
};

// --- New Function:  Change Guild ---
async function changeGuild(userId, newGuild) {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        console.error("User document does not exist!");
        return;
    }

    const userData = userDocSnap.data();
    const now = Date.now();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    let canChange = true;

    // Get cost from guildData
    const cost = guildData[newGuild] ? guildData[newGuild].cost : 10; // Default to 10 if not found


    // Check cooldown
    if (userData.lastGuildChange) {
        const lastChangeTime = userData.lastGuildChange.toDate();
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
export function displayUserStatsRealtime(userId, gemsElementId, tokensElementId, guildElementId) {
    const userDocRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
