// CoinGemUserData.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, doc, onSnapshot, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'; // Added getDocs!
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js'; // Import for Realtime Database

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
const rtdb = getDatabase(app); // Get the Realtime Database instance

// --- Guild Data (Centralized) ---
const guildData = {
    "Golden Guild": { cost: 20 },
    "Mystic Guild": { cost: 10 },
    "Justice Guild": { cost: 10 },
    "Elemental Guild": { cost: 10 },
    "Invisible Guild": { cost: 10 },
    "Glass Guild": { cost: 10 },
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
    const userRef = ref(rtdb, `users/${userId}`); // Use Realtime Database ref

    const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            document.getElementById(gemsElementId).textContent = data.Gems || 0; // Use Realtime DB data
            document.getElementById(tokensElementId).textContent = data.Tokens || 0;
            document.getElementById(guildElementId).textContent = data.guild || 'None';

            updateGuildButtonStates(userId); // Ensure buttons are updated
        } else {
            console.log("No data available for user:", userId);
            document.getElementById(gemsElementId).textContent = '0';
            document.getElementById(tokensElementId).textContent = '0';
            document.getElementById(guildElementId).textContent = 'None';
             // Initialize user data if it doesn't exist
            initializeUserData(userId)
                .then(() => {
                    // Retry displaying stats after initialization
                   displayUserStatsRealtime(userId, gemsElementId, tokensElementId, guildElementId);
                })
                .catch(err => console.error("Error initializing user data:", err));

        }
    }, (error) => {
        console.error("Error listening for realtime updates:", error);
        document.getElementById(gemsElementId).textContent = 'Error';
        document.getElementById(tokensElementId).textContent = 'Error';
        document.getElementById(guildElementId).textContent = 'Error';
    });

    return unsubscribe;
}

// --- Update Guild Button States ---
async function updateGuildButtonStates(userId) {
    const userDocRef = doc(db, "users", userId); // Firestore ref for cooldown check
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        return;
    }

    const userData = userDocSnap.data();
    const now = Date.now();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

    let isOnCoolDown = false;
    if (userData.lastGuildChange) {
        const lastChangeTime = userData.lastGuildChange.toDate(); // Convert Firestore Timestamp
        if (now - lastChangeTime < oneWeekInMs) {
            isOnCoolDown = true;
        }
    }

    const userRef = ref(rtdb, `users/${userId}`); //Realtime ref for token check
    const snapshot = await get(userRef);

    if(!snapshot.exists()){
        return;
    }
    const rtdbData = snapshot.val();

    for (const guildName in guildData) {
        const buttonId = `${guildName.toLowerCase().replace(/\s+/g, '-')}-button`;
        const button = document.getElementById(buttonId);

        if (!button) {
            console.warn(`Button for guild "${guildName}" not found!`);
            continue;
        }
        const cost = guildData[guildName] ? guildData[guildName].cost : 10;

        if (rtdbData.guild === guildName) {
            button.disabled = true;
            button.classList.add("current-guild");
            button.classList.remove("locked-guild");
        } else if (isOnCoolDown || rtdbData.Tokens < cost) { //Use realtime database
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
    const userRef = ref(rtdb, `users/${userId}`); // Use Realtime Database ref
    const snapshot = await get(userRef); // Use get for one-time read

    if (!snapshot.exists()) {
        const initialData = {
            Gems: 5,
            Tokens: 5,
            guild: "No Guild",
            // lastGuildChange is not needed in Realtime DB, managed in Firestore
            photourl: "https://lh3.googleusercontent.com/a/ACg8cd1c0lmuEOInmeFp6gsN1clfw6WgnGR4n03Cc", // Consider using auth.currentUser.photoURL
        };

        try {
            await set(userRef, initialData); // Use set for Realtime Database
            console.log("User data initialized for:", userId);
        } catch (error) {
            console.error("Error initializing user data:", error);
            throw error; // Re-throw to handle in calling function
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

// --- Get User Data ---
export async function getUserData(userId) {
     const userRef = ref(rtdb, `users/${userId}`); //Use realtime ref
    const snapshot = await get(userRef); // Use get

    if (snapshot.exists()) {
        return snapshot.val();
    } else {
        console.log("No such document!");
        return null;
    }
}

// --- Firestore functions for cards ---
export async function fetchCardInstances(userId) { //make exportable
    const cardInstancesCollection = collection(db, 'CardInstances');
    const q = query(cardInstancesCollection, where('Owner', '==', userId));
    const querySnapshot = await getDocs(q); // Use getDocs
    return querySnapshot.docs.map(doc => doc.data());
}

export async function fetchCardData(cardId) { //make exportable
    const cardDocRef = doc(db, 'Cards', cardId);
    const cardDoc = await getDoc(cardDocRef);
    if (cardDoc.exists()) {
        return cardDoc.data();
    } else {
        console.error(`Card not found with ID: ${cardId}`);
        return null;
    }
}

export function combineCardData(cardInstances, cardsData) { //make exportable
    return cardInstances.map(instance => {
        const card = cardsData.find(c => c.ID === instance.ID);
        if (card) {
            return { ...instance, ...card };
        } else {
            console.error(`Card data not found for instance:`, instance);
            return instance; // Return instance even if card data is missing
        }
    });
}
import { get } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
