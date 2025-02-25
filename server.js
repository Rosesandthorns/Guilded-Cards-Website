const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0').Strategy; // Using passport-auth0

dotenv.config();

const app = express();

// Session middleware
app.use(session({ secret: 'your secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport with Auth0 Strategy
passport.use(new Auth0Strategy({
    domain: process.env.AUTH0_DOMAIN,  // Auth0 domain, e.g., 'your-tenant.auth0.com'
    clientID: process.env.AUTH0_CLIENT_ID,  // Auth0 Client ID
    clientSecret: process.env.AUTH0_CLIENT_SECRET,  // Auth0 Client Secret
    callbackURL: process.env.AUTH0_CALLBACK_URL || "http://localhost:3000/callback"
  },
  function(accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile);  // You can store profile info here
  }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Home route with a basic website
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome</h1>
    ${req.isAuthenticated() ? `
      <p>Hello, ${req.user.displayName}!</p>
      <a href="/logout">Logout</a>
    ` : `
      <a href="/auth/auth0">Login with Auth0 (GitHub)</a>
    `}
  `);
});

// Start Auth0 authentication (using GitHub as a social connection)
app.get('/auth/auth0', passport.authenticate('auth0', {
  scope: 'openid profile email'
}));

// Auth0 callback URL
app.get('/callback', 
  passport.authenticate('auth0', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Logout route
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
