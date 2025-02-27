const { initializeApp } = require('firebase/app');
const { getFirestore } = require("firebase/firestore");

exports.handler = async function (event, context) {
    try {
        const firebaseConfig = {
            apiKey: process.env.Firebase_Key,
            authDomain: "guilded-cards.firebaseapp.com",
            projectId: "guilded-cards",
            storageBucket: "guilded-cards.firebasestorage.app",
            messagingSenderId: "566491650991",
            appId: "1:566491650991:web:324493f697af5dacfeed5a",
            measurementId: "G-96KRMBBE76"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // --- Your Firebase logic here ---
        // Example: Fetching data from Firestore
        const collectionRef = collection(db, 'your-collection-name'); // Replace 'your-collection-name'
        const snapshot = await getDocs(collectionRef);
        const data = snapshot.docs.map(doc => doc.data());

        return {
            statusCode: 200,
            body: JSON.stringify(data), // Return fetched data
        };
    } catch (error) {
        console.error("Firebase error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
