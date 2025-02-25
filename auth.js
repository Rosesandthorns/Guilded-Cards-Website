// Filename: auth.js

(async () => {
    const auth0 = await createAuth0Client({
        domain: "YOUR_AUTH0_DOMAIN", // Replace with your Auth0 domain
        clientId: "YOUR_AUTH0_CLIENT_ID", // Replace with your Auth0 client ID
        authorizationParams: {
            redirect_uri: window.location.origin,
        },
    });

    const loginButton = document.getElementById("login");
    const logoutButton = document.getElementById("logout");
    const profileDataElement = document.getElementById("profile-data");

    const updateUI = async () => {
        const isAuthenticated = await auth0.isAuthenticated();

        loginButton.style.display = isAuthenticated ? "none" : "block";
        logoutButton.style.display = isAuthenticated ? "block" : "none";

        if (isAuthenticated) {
            const user = await auth0.getUser();
            profileDataElement.innerText = JSON.stringify(user, null, 2);
        } else {
            profileDataElement.innerText = "";
        }
    };

    await updateUI();

    loginButton.addEventListener("click", async () => {
        await auth0.loginWithRedirect();
    });

    logoutButton.addEventListener("click", () => {
        auth0.logout({
            logoutParams: {
                returnTo: window.location.origin,
            },
        });
    });

    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        await auth0.handleRedirectCallback();
        updateUI();
        window.history.replaceState({}, document.title, "/");
    }
})();
