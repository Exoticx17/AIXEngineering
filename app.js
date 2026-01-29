const express = require('express');
const cors = require('cors');
const app = express();
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();
const flash = require("express-flash");
// const passportSetup = require('./config/passport-setup');

// CORS Configuration
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(flash());


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
    secret: process.env.SESSION_COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
const modelRouter = require('./routes/modelRoutes');
app.use('/model', modelRouter);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});