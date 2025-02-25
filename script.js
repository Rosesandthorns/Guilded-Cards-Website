const domain = 'dev-ybciamkuxjx0b751.us.auth0.com';
const clientId = 'MGyCF2Fz3BH019yEPPRRiyr9ruYwbLgf';
const redirectUri = 'https://rosesandthorns.github.io/Guilded-Cards-Website/';
// Help me
let auth0 = null;

const configureClient = async () => {
  auth0 = await createAuth0Client({
    domain: domain,
    clientId: clientId,
    authorizationParams: {
      redirect_uri: redirectUri
    }
  });
};

const updateUI = async () => {
  const isAuthenticated = await auth0.isAuthenticated();

  document.getElementById("loginBtn").style.display = isAuthenticated ? "none" : "block";
  document.getElementById("logoutBtn").style.display = isAuthenticated ? "block" : "none";

  if (isAuthenticated) {
    const user = await auth0.getUser();
    document.getElementById("profileData").innerText = JSON.stringify(user, null, 2);
    document.getElementById("userInfo").style.display = "block";
    document.getElementById("content").querySelector("p").innerText = "Welcome, " + user.name + "!";
  } else {
    document.getElementById("userInfo").style.display = "none";
    document.getElementById("content").querySelector("p").innerText = "Welcome! Please log in to see more.";
  }
};
const login = async () => {
    await auth0.loginWithRedirect({
        authorizationParams: {
          redirect_uri: redirectUri
        }
    });
};

const logout = () => {
  auth0.logout({
    logoutParams: {
        returnTo: redirectUri
    }
  });
};

window.onload = async () => {
  await configureClient();
  updateUI();

  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {
    await auth0.handleRedirectCallback();
    updateUI();
    window.history.replaceState({}, document.title, "/"); // Clean the URL
  }

  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("logoutBtn").addEventListener("click", logout);
};
