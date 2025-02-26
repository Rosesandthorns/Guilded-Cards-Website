// script.js

// --- Configuration ---
const githubClientId = 'Ov23liQXExMKV1W03hqt'; // Your GitHub Client ID
const redirectUri = 'https://rosesandthorns.github.io/Guilded-Cards-Website/'; // Correct redirect URI
const serverlessFunctionEndpoint = '/.netlify/functions/exchange-token'; // Netlify function path

// --- Utility Functions ---

function getCodeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
}

// --- Core Authentication Functions ---
async function exchangeCodeForToken(code) {
    try {
        const response = await fetch(serverlessFunctionEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });

        if (!response.ok) {
            throw new Error(`Serverless function returned an error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(`Serverless function error: ${data.error}`);
        }

        return data.access_token;

    } catch (error) {
        console.error("Error exchanging code for token:", error);
        displayError(error.message);
        return null;
    }
}

async function getUserInfo(accessToken) {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `token ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const userData = await response.json();
        return userData;

    } catch (error) {
        console.error("Error fetching user data:", error);
        displayError(error.message);
        return null;
    }
}

// --- UI Update Functions ---
function displayUser(user) {
    const loginButton = document.getElementById('login-button');
    const userInfo = document.getElementById('user-info');
    const loader = document.getElementById('loader');

    if (loader) {
        loader.style.display = 'none';
    }
    if (loginButton) {
        loginButton.style.display = 'none'; // Hide login button
    }

    if (userInfo) {
        document.getElementById('username').textContent = user.login;
        document.getElementById('avatar').src = user.avatar_url;
        document.getElementById('token-count').textContent = 0; // Initialize to 0
        document.getElementById('gem-count').textContent = 0; // Initialize to 0
        userInfo.style.display = 'block'; // Show user info
    }
}

function logout() {
    localStorage.removeItem('githubUser');
    localStorage.removeItem('githubAccessToken');
    window.location.href = window.location.pathname; // Redirect to same page
}

function displayError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError(){
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = 'none';
    }
}

function showLoadingIndicator() {
    const loader = document.getElementById('loader');
    if(loader){
        loader.style.display = 'inline-block';
    }
}

// --- Daily Reward Logic ---
function grantDailyReward() {
    const today = new Date().toLocaleDateString(); // Get current date in EST
    const lastClaimed = localStorage.getItem('lastClaimed');

    if (lastClaimed !== today) {
        let tokens = parseInt(document.getElementById('token-count').textContent);
        let gems = parseInt(document.getElementById('gem-count').textContent);
        tokens += 2;
        gems += 5;
        document.getElementById('token-count').textContent = tokens;
        document.getElementById('gem-count').textContent = gems;
        localStorage.setItem('lastClaimed', today);
    }
}

// --- Main Execution Flow ---
async function handleLogin() {
    const loginButton = document.getElementById('login-button');
    const code = getCodeFromURL();

    if (code) {
        // We have a code, so we're in the callback flow.
        showLoadingIndicator();
        hideError();
        const accessToken = await exchangeCodeForToken(code);

        if (accessToken) {
            localStorage.setItem('githubAccessToken', accessToken);
            const user = await getUserInfo(accessToken);

            if (user) {
                localStorage.setItem('githubUser', JSON.stringify(user));
                displayUser(user);
                grantDailyReward(); // Grant daily reward after login
            }
        }
    } else {
        // No code, check if the user is already logged in.
        const storedUser = localStorage.getItem('githubUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            displayUser(user);
            grantDailyReward(); // Grant daily reward on page load if logged in
        } else {
            // User is NOT logged in, *now* set up the login button.
            if (loginButton) {
                loginButton.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
            }
        }
    }
}


// --- Event Listener ---
// Call handleLogin when the DOM is fully loaded.  Not needed if you use DOMContentLoaded
handleLogin();
