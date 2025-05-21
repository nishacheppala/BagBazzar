const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userModel = require('../models/user-model'); // Adjust the path if necessary

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;

// Configure Passport to use Google OAuth
passport.use(
    new GoogleStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
        scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists in the db
            const existingUser = await userModel.findOne({ googleId: profile.id });
            if (existingUser) {
                // User already exists
                
                return done(null, existingUser); // Passing only the user object
            }

            // If not, create a new user
            const newUser = await userModel.create({
                googleId: profile.id,
                fullname: profile.displayName,
                email: profile._json.email  // assuming email is returned
            });

            // const token = jwt.sign({ email: newUser.email, userid: newUser._id }, 'shhhhh');
            return done(null, newUser); // Passing only the user object
        } catch (err) {
            done(err, null);
        }
    })
);




// Store user ID in session (serialize)
passport.serializeUser((user, done) => {
    done(null, user.id); // Storing only the user id in the session
});

// Retrieve user from session using ID (deserialize)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user); // Retrieve the full user object from the database
    } catch (err) {
        done(err, null);
    }
});
