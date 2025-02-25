// functions/exchange-token.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { code } = JSON.parse(event.body);
    const clientID = process.env.GITHUB_CLIENT_ID; // From Netlify environment variable
    const clientSecret = process.env.GITHUB_CLIENT_SECRET; // From Netlify environment variable.  YOU MUST SET THIS.

    try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: clientID,
                client_secret: clientSecret,
                code: code,
            }),
        });

        const data = await response.json();

        if (data.error) {
            console.error("Error exchanging token:", data);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to exchange token' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ access_token: data.access_token }),
        };

    } catch (error) {
        console.error("Error in token exchange:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
