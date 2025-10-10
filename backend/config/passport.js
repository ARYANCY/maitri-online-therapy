const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Helper: check if email belongs to an admin
const isAdminUser = (email) => {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .includes(email?.toLowerCase());
};

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error("Google account has no email"), null);

        const avatar = profile.photos?.[0]?.value || "";
        let user = await User.findOne({ email });

        if (!user) {
          // Create new user
          user = await User.create({
            name: profile.displayName || "Unknown User",
            email,
            googleId: profile.id,
            avatar,
            password: "",
            isAdmin: isAdminUser(email),
          });
        } else {
          // Update existing user
          if (!user.avatar && avatar) user.avatar = avatar;
          if (!user.isAdmin && isAdminUser(email)) user.isAdmin = true;
          await user.save();
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Serialize user into session: store id + isAdmin
passport.serializeUser((user, done) => {
  done(null, { id: user._id, isAdmin: user.isAdmin });
});

// Deserialize user from session
passport.deserializeUser(async (obj, done) => {
  try {
    const user = await User.findById(obj.id);
    if (!user) return done(null, false);
    user.isAdmin = obj.isAdmin || user.isAdmin;
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
