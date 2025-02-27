// profile.js (Profile-specific logic)

// Function to update the profile page content
export function updateProfilePage(user) { // ADD the 'export' keyword here
    const profileContentDiv = document.getElementById("profileContent");
    if (profileContentDiv) {
        if (user) {
            // User is signed in, show profile details
            profileContentDiv.innerHTML = `
                <h1 style="text-align: center;">${user.displayName}'s Profile</h1>
                <p>${user.displayName}'s Deck</p>`;
        } else {
            // User is not signed in, show sign-in message
            profileContentDiv.innerHTML = `<p>Please sign in to view profile</p>`;
        }
    }
}
