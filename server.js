// server.js
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Session middleware
app.use(session({ secret: 'your secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Configure GitHub strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // Here you can store profile info in your DB if needed
    return done(null, profile);
  }
));

// Home route with a basic website
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome</h1>
    ${req.isAuthenticated() ? `
      <p>Hello, ${req.user.username}!</p>
      <a href="/logout">Logout</a>
    ` : `
      <a href="/auth/github">Login with GitHub</a>
    `}
  `);
});

// Start GitHub authentication
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub callback URL
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
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
