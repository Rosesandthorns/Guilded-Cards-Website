const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require("firebase/firestore");

// Import the existing firebase configuration
const firebaseConfig = {
  apiKey: process.env.Firebase_Key,
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

exports.handler = async function (event, context) {
  try {
    // --- Your Firebase logic here ---
    const collectionRef = collection(db, 'users'); // Use the correct collection name ('users')

    // Validate collection name (optional, you can remove this if you're sure the collection exists)
    if (!collectionRef.path) {
      throw new Error('Invalid collection name');
    }

    const snapshot = await getDocs(collectionRef);

    // Check if any documents exist
    if (snapshot.empty) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No documents found' }),
      };
    }

    const data = snapshot.docs.map(doc => {
      const docData = doc.data();

      // You might want to adjust the validation based on your actual fields
      // For example, checking for 'gmail' and 'uid' instead of 'id' and 'name'
      if (!docData.gmail || !docData.uid) {
        console.warn(`Document ${doc.id} missing required fields`);
        return null; // Or handle the error differently
      }

      return docData;
    }).filter(Boolean); // Remove null values

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Firebase error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
