let auth0 = null;

// Initialize Auth0 client
const initAuth0 = async () => {
    try {
        auth0 = await createAuth0Client({
            domain: 'YOUR_AUTH0_DOMAIN',  // Replace with your Auth0 domain
            client_id: 'YOUR_AUTH0_CLIENT_ID',  // Replace with your Auth0 client ID
            redirect_uri: window.location.href,  // The current URL for handling the callback
        });
        checkAuthentication();
    } catch (error) {
        console.error('Error initializing Auth0:', error);
    }
};

// Check if the user is authenticated
const checkAuthentication = async () => {
    try {
        const isAuthenticated = await auth0.isAuthenticated();
        if (isAuthenticated) {
            const user = await auth0.getUser();
            document.getElementById('loginButton').style.display = 'none';
            document.getElementById('logoutButton').style.display = 'inline-block';
            document.getElementById('profile').textContent = JSON.stringify(user, null, 2);
        } else {
            document.getElementById('loginButton').style.display = 'inline-block';
            document.getElementById('logoutButton').style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
    }
};

// Handle login
const login = async () => {
    try {
        await auth0.loginWithRedirect({
            connection: 'github',  // Use GitHub as a social login provider
        });
    } catch (error) {
        console.error('Error during login:', error);
    }
};

// Handle logout
const logout = async () => {
    try {
        await auth0.logout({
            returnTo: window.location.href  // Redirect to home page after logout
        });
    } catch (error) {
        console.error('Error during logout:', error);
    }
};

// Event listeners for login and logout
document.getElementById('loginButton').onclick = login;
document.getElementById('logoutButton').onclick = logout;

// Initialize Auth0 client on page load
initAuth0();
