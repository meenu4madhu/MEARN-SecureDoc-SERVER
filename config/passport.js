const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_SECERET_KEY,
      callbackURL: process.env.CALL_BACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      // profile contains email, name, googleId
      return done(null, profile);
    }
  )
);

module.exports = passport;