const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require("firebase/firestore");

exports.handler = async function (event, context) {
    try {
        // ... (Firebase config and initialization - same as before)

        // --- Your Firebase logic here ---
        // Example: Fetching data from Firestore with error handling and data validation
        const collectionRef = collection(db, 'your-collection-name');

        // Validate collection name
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

            // Basic data validation (example)
            if (!docData.id || !docData.name) {
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
