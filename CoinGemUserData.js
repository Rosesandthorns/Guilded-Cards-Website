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
    "Glass Guild": {cost: 10},
};

// --- Change Guild ---
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

    const cost = guildData[newGuild] ? guildData[newGuild].cost : 10;

    if (userData.lastGuildChange) {
        const lastChangeTime = userData.lastGuildChange.toDate();
        if (now - lastChangeTime < oneWeekInMs) {
            canChange = false;
        }
    }

    if (userData.Tokens < cost) {
        canChange = false;
    }

    if (canChange) {
        await updateDoc(userDocRef, {
            Tokens: userData.Tokens - cost,
            guild: newGuild,
            lastGuildChange: serverTimestamp()
        });
        console.log(`Guild changed to ${newGuild}`);
    } else {
        if (userData.Tokens < cost) {
            console.log("Not enough tokens to change guilds.");
            throw new Error("Not enough tokens");
        } else {
            console.log("Guild change cooldown active.");
            throw new Error("Cooldown active");
        }
    }
}

// --- displayUserStatsRealtime ---
export function displayUserStatsRealtime(userId, gemsElementId, tokensElementId, guildElementId) {
    const userDocRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            const gems = userData.Gems;
            const tokens = userData.Tokens;
            const guild = userData.guild || "No Guild";

            document.getElementById(gemsElementId).textContent = gems;
            document.getElementById(tokensElementId).textContent = tokens;
            document.getElementById(guildElementId).textContent = guild;

            updateGuildButtonStates(userId);

        } else {
            console.log("No such document! Initializing...");
            initializeUserData(userId)
                .then(() => {
                    displayUserStatsRealtime(userId, gemsElementId, tokensElementId, guildElementId);
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

// --- Update Guild Button States ---
async function updateGuildButtonStates(userId) {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        return;
    }

    const userData = userDocSnap.data();
    const now = Date.now();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

    let isOnCoolDown = false;
    if (userData.lastGuildChange) {
        const lastChangeTime = userData.lastGuildChange.toDate();
        if (now - lastChangeTime < oneWeekInMs) {
            isOnCoolDown = true;
        }
    }

    for (const guildName in guildData) {
        const button = document.getElementById(`${guildName.toLowerCase().replace(/\s+/g, '-')}-button`);
        if (!button) {
            console.warn(`Button for guild "${guildName}" not found!`);
            continue;
        }
        const cost = guildData[guildName] ? guildData[guildName].cost : 10;

        if (userData.guild === guildName) {
            button.disabled = true;
            button.classList.add("current-guild");
            button.classList.remove("locked-guild");
        } else if (isOnCoolDown || userData.Tokens < cost) {
            button.disabled = true;
            button.classList.add("locked-guild");
            button.classList.remove("current-guild");
        } else {
            button.disabled = false;
            button.classList.remove("current-guild", "locked-guild");
        }
    }
}

// --- stopListening ---
export function stopListening(unsubscribeFunction) {
    if (unsubscribeFunction) {
        unsubscribeFunction();
    }
}

// --- initializeUserData ---
async function initializeUserData(userId) {
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
        const initialData = {
          Gems: 5,
          Tokens: 5,
          guild: "No Guild",
          lastGuildChange: null,
          photourl: "https://lh3.googleusercontent.com/a/ACg8cd1c0lmuEOInmeFp6gsN1clfw6WgnGR4n03Cc", // Consider auth object
        };

        try {
            await setDoc(userDocRef, initialData);
            console.log("User data initialized for:", userId);
        } catch (error) {
            console.error("Error initializing user data:", error);
            throw error;
        }
    }
}

// --- setupGuildButtons function ---
export function setupGuildButtons(auth) {
    for (const guildName in guildData) {
        const buttonId = `${guildName.toLowerCase().replace(/\s+/g, '-')}-button`;
        const button = document.getElementById(buttonId);

        if (!button) {
            console.warn(`Button with ID "${buttonId}" not found!`);
            continue;
        }

        button.addEventListener('click', async () => {
            try {
                await changeGuild(auth.currentUser.uid, guildName);
            } catch (error) {
                alert(error.message);
            }
        });
    }
}

//NEW FUNCTION
// --- Get User Data ---
export async function getUserData(userId) {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        return userDocSnap.data();
    } else {
        console.log("No such document!");
        return null; // Or throw an error, or return default data
    }
}


// Combined Export Statement
export { changeGuild, updateGuildButtonStates, setupGuildButtons, displayUserStatsRealtime, stopListening, getUserData };
