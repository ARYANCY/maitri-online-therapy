const express = require("express");
const router = express.Router();
const passport = require("../config/passport");

// --- Initiate Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// --- Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true,
  }),
  async (req, res) => {
    try {
      if (!req.user?._id) {
        console.error("No user found after Google login");
        return res.redirect(`${process.env.CLIENT_URL}/login`);
      }

      // Save session
      req.session.userId = req.user._id;

      // Determine if user is admin
      const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
      const isAdmin = adminEmails.includes(req.user.email?.toLowerCase());
      req.session.isAdmin = isAdmin;

      // Persist admin status in DB if needed
      if (isAdmin) {
        req.user.isAdmin = true;
        await req.user.save();
      }

      // Save session and redirect
      req.session.save(err => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect(`${process.env.CLIENT_URL}/login`);
        }

        const redirectUrl = isAdmin
          ? `${process.env.CLIENT_URL}/admin` 
          : `${process.env.CLIENT_URL}/dashboard`;   
        return res.redirect(redirectUrl);
      });
    } catch (err) {
      console.error("Google login callback error:", err);
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }
  }
);

// --- Logout route
router.get("/logout", (req, res, next) => {
  if (req.user) {
    req.logout(err => {
      if (err) return next(err);
      req.session.destroy(err => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie("connect.sid", { path: "/" });
        return res.redirect(`${process.env.CLIENT_URL}/login`);
      });
    });
  } else {
    res.clearCookie("connect.sid", { path: "/" });
    return res.redirect(`${process.env.CLIENT_URL}/login`);
  }
});

module.exports = router;
