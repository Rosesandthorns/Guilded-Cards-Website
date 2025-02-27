// profile.js (Profile-specific logic)
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { setupAuthListener } from "./script.js"; // Import the function

// Function to update the profile page content
function updateProfilePage(user) {
    const profileContentDiv = document.getElementById("profileContent"); // Get it *inside* the function
    if (profileContentDiv) { // Check if it exists
        if (user) {
            // User is signed in, show profile details
            profileContentDiv.innerHTML = `
                <h1 style="text-align: center;">${user.displayName}'s Profile</h1>
                <p>${user.displayName}'s Deck</p>`;  // Removed unnecessary span
        } else {
            // User is not signed in, show sign-in message
            profileContentDiv.innerHTML = `<p>Please sign in to view profile</p>`;
        }
    }
}

  // Set up the onAuthStateChanged listener *after* the DOM is loaded.  -- REMOVE THIS ENTIRE SECTION
 //   document.addEventListener('DOMContentLoaded', () => {
  //      const auth = getAuth(); // Get auth *inside* DOMContentLoaded
    //    onAuthStateChanged(auth, (user) => {  // Use onAuthStateChanged *here*
      //     updateProfilePage(user);
        //});
   // });
