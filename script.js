// Import the necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase configuration object (ensure your environment variable is set up correctly)
const firebaseConfig = {
  apiKey: process.env.Firebase_Key, // Ensure this variable is exposed appropriately in your build config
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

// Function to fetch user data from the 'users' collection
async function fetchUserData() {
  try {
    const collectionRef = collection(db, 'users'); // Use the correct collection name
    const snapshot = await getDocs(collectionRef);

    if (snapshot.empty) {
      console.log('No documents found');
      return []; // Return an empty array if no documents are found
    }

    // Map through the documents and validate required fields
    const data = snapshot.docs.map(doc => {
      const docData = doc.data();

      if (!docData.gmail || !docData.uid) {
        console.warn(`Document ${doc.id} missing required fields`);
        return null;
      }

      return docData;
    }).filter(Boolean); // Remove any null values from missing required fields

    console.log('Fetched user data:', data);
    return data;
  } catch (error) {
    console.error("Firebase error:", error);
  }
}

// Example of how to use the function:
fetchUserData().then(userData => {
  if (userData) {
    // Do something with the fetched userData array
  }
});
