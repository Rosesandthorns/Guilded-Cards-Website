vimport { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Import the existing Firebase configuration
const firebaseConfig = {
  apiKey: process.env.Firebase_Key, // Make sure this is accessible in your client-side environment
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

async function fetchUserData() {
  try {
    const collectionRef = collection(db, 'users'); // Use the correct collection name ('users')

    const snapshot = await getDocs(collectionRef);

    if (snapshot.empty) {
      console.log('No documents found');
      return; // Return an empty array if no documents are found
    }

    const data = snapshot.docs.map(doc => {
      const docData = doc.data();

      // You might want to adjust the validation based on your actual fields
      if (!docData.gmail || !docData.uid) {
        console.warn(`Document ${doc.id} missing required fields`);
        return null;
      }

      return docData;
    }).filter(Boolean); // Remove null values

    console.log('Fetched user data:', data);
    return data;
  } catch (error) {
    console.error("Firebase error:", error);
  }
}

// Example of how to use the function:
fetchUserData().then(userData => {
  // Do something with the fetched user data
  if (userData) {
    // ... use the userData array ...
  }
});
