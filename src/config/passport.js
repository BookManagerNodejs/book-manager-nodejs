const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const env = require('./env');
const userModel = require('../models/user.model');
const { upsertGoogleUser } = require('../services/social.service'); // ta sẽ tạo file này

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const u = await userModel.findById(id);
        done(null, u || null);
    } catch (e) {
        done(e);
    }
});
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || `${env.port}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails && profile.emails[0] && profile.emails[0].value;
        const name = profile.displayName || '';
        const googleId = profile.id;
        const user = await upsertGoogleUser({ email, name, googleId });
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));
module.exports = passport;
