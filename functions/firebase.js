// firebase.js (Netlify Function)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from "firebase/firestore";

exports.handler = async function (event, context) {
    try {
        // FOR TESTING ONLY - REMOVE AND USE process.env.VITE_Firebase_Key
        const firebaseApiKey = "AIzaSyBODDkKMrgc_eSl5nIPwXf2FzY6MY0o_iE";

        //  Uncomment this line after testing, and set the variable in Netlify
        // const firebaseApiKey = process.env.VITE_Firebase_Key;


        if (!firebaseApiKey) {
            console.error("❌ Firebase API Key is missing from Netlify environment variables (VITE_Firebase_Key)!");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Firebase API Key not configured" }),
            };
        }

        // Firebase configuration object
        const firebaseConfig = {
            apiKey: firebaseApiKey,
            authDomain: "guilded-cards.firebaseapp.com",
            projectId: "guilded-cards",
            storageBucket: "guilded-cards.firebasestorage.app",
            messagingSenderId: "566491650991",
            appId: "1:566491650991:web:324493f697af5dacfeed5a",
            measurementId: "G-96KRMBBE76"
        };

        // Initialize Firebase WITHIN the function
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // --- Your Firebase logic here ---
        const collectionRef = collection(db, 'users'); // Use 'users', like your client-side code

        // Validate collection name (Good practice, keep this)
        if (!collectionRef.path) {
            throw new Error('Invalid collection name');
        }

        const snapshot = await getDocs(collectionRef);

        // Check if any documents exist
        if (snapshot.empty) {
            return {
                statusCode: 200, // Or 404 if you prefer
                body: JSON.stringify({ message: 'No documents found' }),
            };
        }

        const data = snapshot.docs.map(doc => {
            const docData = doc.data();

            // Basic data validation (example)
            if (!docData.gmail || !docData.uid) { // Match your client-side validation
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
