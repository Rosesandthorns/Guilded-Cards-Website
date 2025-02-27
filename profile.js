// profile.js (Profile-specific logic)

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

const auth = getAuth(); // Get the auth object from Firebase (initialized in script.js)
const profileContentDiv = document.getElementById("profileContent");

// Function to update the profile page content
function updateProfilePage(user) {
    if (user) {
        // User is signed in, show profile details
        profileContentDiv.innerHTML = `
            <h1 style="text-align: center;">${user.displayName}'s Profile</h1>
            <p>${user.displayName}'s Deck</p>
        `;
    } else {
        // User is not signed in, show sign-in message
        profileContentDiv.innerHTML = `<p>Please sign in to view profile</p>`;
    }
}

// Listen for authentication state changes (specifically for profile updates)
onAuthStateChanged(auth, (user) => {
    updateProfilePage(user); // Update the profile content
});
