// script.js

// --- Configuration ---
const githubClientId = 'Ov23liQXExMKV1W03hqt'; // Your Client ID (as provided)
const redirectUri = 'https://rosesandthorns.github.io/Guilded-Cards-Website/'; // Correct redirect URI for your GitHub Pages site
const serverlessFunctionEndpoint = '/.netlify/functions/exchange-token'; // DO NOT CHANGE THIS

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
        loginButton.style.display = 'none';
    }

    if (userInfo) {
        userInfo.innerHTML = `
            <p>Logged in as ${user.login}</p>
            <img src="${user.avatar_url}" alt="Profile Picture" width="50">
            <button onclick="logout()">Logout</button>
        `;
        userInfo.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('githubUser');
    localStorage.removeItem('githubAccessToken');
    window.location.href = window.location.pathname;
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
// --- Main Execution Flow ---
async function handleLogin() {
    //set up login button.  Do this here so we don't need DOMContentLoaded
    const loginButton = document.getElementById('login-button');
    if(loginButton){
        loginButton.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    }

    const code = getCodeFromURL();

    if (code) {
        showLoadingIndicator();
        hideError();
        const accessToken = await exchangeCodeForToken(code);

        if (accessToken) {
            localStorage.setItem('githubAccessToken', accessToken);
            const user = await getUserInfo(accessToken);

            if (user) {
                localStorage.setItem('githubUser', JSON.stringify(user));
                displayUser(user);
            }
        }
    } else {
        const storedUser = localStorage.getItem('githubUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            displayUser(user);
        }
    }
}

// --- Event Listener ---
// Call handleLogin when the DOM is fully loaded.  Not needed if you use DOMContentLoaded
handleLogin();
