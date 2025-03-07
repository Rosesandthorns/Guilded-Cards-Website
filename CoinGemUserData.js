import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, doc, onSnapshot, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyBODDkKMrgc_eSl5nIPwXf2FzY6MY0o_iE",
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
    const userDocRef = doc(db, "users", userId); // Firestore ref

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            const gems = userData.Gems;
            const tokens = userData.Tokens;
            const guild = userData.guild || "No Guild";

            document.getElementById(gemsElementId).textContent = gems;
            document.getElementById(tokensElementId).textContent = tokens;
            document.getElementById(guildElementId).textContent = guild;

            updateGuildButtonStates(userId); // Ensure buttons are updated
        } else {
            console.log("No such document! Initializing...");
             // Initialize user data if it doesn't exist
            initializeUserData(userId)
                .then(() => {
                    // Retry displaying stats after initialization
                    displayUserStatsRealtime(userId, gemsElementId, tokensElementId, guildElementId);
                })
                .catch(err => console.error("Error initializing user data:", err));
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
    const userDocRef = doc(db, "users", userId); // Firestore ref
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
    const userDocRef = doc(db, "users", userId); // Firestore ref
    const docSnap = await getDoc(userDocRef); //Use get to check
    if (!docSnap.exists()) {
        const initialData = {
            Gems: 5,
            Tokens: 5,
            guild: "No Guild",
            lastGuildChange: null, // Initialize lastGuildChange
            photourl: "https://lh3.googleusercontent.com/a/ACg8cd1c0lmuEOInmeFp6gsN1clfw6WgnGR4n03Cc", // Consider using auth.currentUser.photoURL
        };

        try {
            await setDoc(userDocRef, initialData); // Firestore setDoc
            console.log("User data initialized for:", userId);
        } catch (error) {
            console.error("Error initializing user data:", error);
            throw error; // Re-throw for handling higher up
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
    const userDocRef = doc(db, "users", userId);  // Firestore ref
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        return userDocSnap.data();
    } else {
        console.log("No such document!");
        return null;
    }
}

// --- Firestore functions for cards ---
export async function fetchCardInstances(userId) {
    const cardInstancesCollection = collection(db, 'CardInstances');
    const q = query(cardInstancesCollection, where('Owner', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            instanceId: doc.id, //Include the actual document ID
            cardId: data.Card,  // Use a descriptive name! (was data.ID)
        }

    });
}

export async function fetchCardData(cardId) {
    console.log("fetchCardData called with cardId:", cardId);
    if (!cardId) {
        console.error("fetchCardData called with invalid cardId:", cardId);
        return null;
    }
    const cardDocRef = doc(db, 'Cards', cardId);
    const cardDoc = await getDoc(cardDocRef);
    if (cardDoc.exists()) {
        return cardDoc.data();
    } else {
        console.error(`Card not found with ID: ${cardId}`);
        return null;
    }
}

export function combineCardData(cardInstances, cardsData) {
    console.log("combineCardData called with:", cardInstances, cardsData);
    return cardInstances.map(instance => {
        const card = cardsData.find(c => c.ID === instance.cardId); // Corrected line
        if (card) {
            return { ...instance, ...card };
        } else {
            console.error(`Card data not found for instance:`, instance);
            return { ...instance, ID: 'N/A' }; //Still return, but make ID clear.
        }
    });
}

// Function to display cards (added in previous response)
export function displayCards(cards) {
    const collectionSection = document.getElementById('collectionSection');
    collectionSection.innerHTML = ''; // Clear any previous content

    if (cards.length === 0) {
        // Display a message if no cards are found
        const noCardsMessage = document.createElement('p');
        noCardsMessage.textContent = "You don't own any cards yet.";
        collectionSection.appendChild(noCardsMessage);
        return;
    }

    cards.forEach(card => {
        // Create a container for each card
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card'); // Add a 'card' class for styling

        // Create the image element
        const img = document.createElement('img');
        img.src = card.image; // Use the image URL from the card data
        img.alt = card.name; // Set the alt text for accessibility
        cardDiv.appendChild(img);

        // Display the InstanceID
        const instanceIdP = document.createElement('p');
        instanceIdP.textContent = `Instance ID: ${card.instanceId}`;
        cardDiv.appendChild(instanceIdP);

        // Add the card to the collection section
        collectionSection.appendChild(cardDiv);
    });
}
