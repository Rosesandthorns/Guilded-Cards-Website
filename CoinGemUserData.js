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
    // ... (This function remains unchanged)
}

// --- displayUserStatsRealtime ---
export function displayUserStatsRealtime(userId, gemsElementId, tokensElementId, guildElementId) {
    // ... (This function remains unchanged)
}

// --- Update Guild Button States ---
async function updateGuildButtonStates(userId) {
    // ... (This function remains unchanged)
}

// --- stopListening ---
export function stopListening(unsubscribeFunction) {
    // ... (This function remains unchanged)
}

// --- initializeUserData ---
async function initializeUserData(userId) {
    // ... (This function remains unchanged)
}

// --- setupGuildButtons function ---
export function setupGuildButtons(auth) {
    // ... (This function remains unchanged)
}

// --- Get User Data ---
export async function getUserData(userId) {
    // ... (This function remains unchanged)
}

// --- Firestore functions for cards ---
export async function fetchCardInstances(userId) {
    // ... (This function remains unchanged)
}

export async function fetchCardData(cardId) {
    // ... (This function remains unchanged)
}

export function combineCardData(cardInstances, cardsData) {
    // ... (This function remains unchanged)
}

// --- displayCards function ---
export function displayCards(cards) {
    const collectionSection = document.getElementById('collectionSection');
    collectionSection.innerHTML = ''; // Clear any previous content

    if (cards.length === 0) {
        const noCardsMessage = document.createElement('p');
        noCardsMessage.textContent = "You don't own any cards yet.";
        collectionSection.appendChild(noCardsMessage);
        return;
    }

    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');

        const img = document.createElement('img');
        img.src = card.image;
        img.alt = card.name;
        cardDiv.appendChild(img);

        const instanceIdP = document.createElement('p');
        instanceIdP.textContent = `Instance ID: ${card.InstanceID}`; // Use InstanceID
        cardDiv.appendChild(instanceIdP);

        collectionSection.appendChild(cardDiv);
    });
}
