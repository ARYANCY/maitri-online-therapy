const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile received:", profile);
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const avatar = profile.photos?.[0]?.value || "";

        if (!email) {
          return done(new Error("Google account does not provide email"), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName || "Unknown User",
            email,
            googleId: profile.id,
            avatar,      
            password: "",
          });
          console.log("New user created:", user._id);
        } else {
          if (!user.avatar && avatar) {
            user.avatar = avatar;
            await user.save();
          }
          console.log("Existing user found:", user._id);
        }

        return done(null, user);
      } catch (err) {
        console.error("Error in GoogleStrategy:", err);
        return done(err, null);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  if (!user?._id) {
    console.error("serializeUser: user or _id missing", user);
    return done(new Error("User or _id missing in serializeUser"));
  }
  console.log("serializeUser:", user._id);
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      console.error("deserializeUser: No user found for id", id);
      return done(null, false);
    }
    console.log("deserializeUser:", user._id);
    done(null, user);
  } catch (err) {
    console.error("Error in deserializeUser:", err);
    done(err, null);
  }
});

module.exports = passport;
