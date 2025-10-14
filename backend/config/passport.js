const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const isAdminUser = (email) => {
  if (!email) return false;
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email.toLowerCase());
};

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
        if (!email) return done(new Error("Google account missing email"), null);

        const avatar = profile.photos?.[0]?.value || "";
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName || "Unknown User",
            email,
            googleId: profile.id,
            avatar,
            password: "",
            isAdmin: isAdminUser(email),
          });
        } else {
          const adminNow = isAdminUser(email);
          if (adminNow && !user.isAdmin) user.isAdmin = true;
          if (!user.avatar && avatar) user.avatar = avatar;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        console.error("Google OAuth error:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, {
    id: user._id.toString(),
    isAdmin: Boolean(user.isAdmin),
  });
});

passport.deserializeUser(async (sessionUser, done) => {
  try {
    const user = await User.findById(sessionUser.id).lean();
    if (!user) return done(null, false);

    const finalUser = {
      ...user,
      isAdmin: sessionUser.isAdmin || user.isAdmin,
    };

    done(null, finalUser);
  } catch (err) {
    console.error("Deserialize error:", err);
    done(err, null);
  }
});

module.exports = passport;
