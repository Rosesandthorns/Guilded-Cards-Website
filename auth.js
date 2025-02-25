// Filename: auth.js

(async () => {
    const auth0 = await createAuth0Client({
        domain: "dev-ybciamkuxjx0b751.us.auth0.com", 
        clientId: "MGyCF2Fz3BH019yEPPRRiyr9ruYwbLgf", 
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
