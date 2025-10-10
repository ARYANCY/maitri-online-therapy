const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Helper: determine if user is admin
const isAdminUser = (email) => {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase());
  return adminEmails.includes(email?.toLowerCase());
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
        const avatar = profile.photos?.[0]?.value || "";

        if (!email) {
          return done(new Error("Google account does not provide email"), null);
        }

        // Find existing user
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName || "Unknown User",
            email,
            googleId: profile.id,
            avatar,
            password: "", // empty since Google OAuth
            isAdmin: isAdminUser(email),
          });
          console.log("New user created:", user._id, "isAdmin:", user.isAdmin);
        } else {
          // Update avatar if missing
          if (!user.avatar && avatar) {
            user.avatar = avatar;
          }

          // Ensure isAdmin is correct
          if (!user.isAdmin && isAdminUser(email)) {
            user.isAdmin = true;
          }

          await user.save();
          console.log("Existing user found:", user._id, "isAdmin:", user.isAdmin);
        }

        return done(null, user);
      } catch (err) {
        console.error("Error in GoogleStrategy:", err);
        return done(err, null);
      }
    }
  )
);

// Serialize user to session (store id + isAdmin)
passport.serializeUser((user, done) => {
  if (!user?._id) {
    console.error("serializeUser: user or _id missing", user);
    return done(new Error("User or _id missing in serializeUser"));
  }
  done(null, { id: user._id, isAdmin: user.isAdmin });
});

// Deserialize user from session
passport.deserializeUser(async (obj, done) => {
  try {
    const user = await User.findById(obj.id);
    if (!user) {
      console.error("deserializeUser: No user found for id", obj.id);
      return done(null, false);
    }

    // Attach isAdmin from session to ensure persistence
    user.isAdmin = obj.isAdmin || user.isAdmin;
    done(null, user);
  } catch (err) {
    console.error("Error in deserializeUser:", err);
    done(err, null);
  }
});

module.exports = passport;
