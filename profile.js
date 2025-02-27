// profile.js (Profile-specific logic)

// Function to update the profile page content
function updateProfilePage(user) {
    const profileContentDiv = document.getElementById("profileContent");
    if (profileContentDiv) {
        if (user) {
            // User is signed in, show profile details
            profileContentDiv.innerHTML = `
                <h1 style="text-align: center;"><span class="math-inline">\{user\.displayName\}'s Profile</h1\>
<p\></span>{user.displayName}'s Deck</p>`;
        } else {
            // User is not signed in, show sign-in message
            profileContentDiv.innerHTML = `<p>Please sign in to view profile</p>`;
        }
    }
}
