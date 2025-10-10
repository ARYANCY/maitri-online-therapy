const express = require("express");
const router = express.Router();
const passport = require("../config/passport");

// Initiate Google login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback – place your admin session logic here
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

      // Set session
      req.session.userId = req.user._id;

      // Only allow admin emails
      const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");
      const isAdmin = adminEmails.includes(req.user.email);
      req.session.isAdmin = isAdmin;

      if (isAdmin) {
        req.user.isAdmin = true;
        await req.user.save(); // persist in DB
      }

      req.session.save(err => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect(`${process.env.CLIENT_URL}/login`);
        }

        // Redirect admin or normal user
        if (isAdmin) return res.redirect(`${process.env.CLIENT_URL}/splash`);
        return res.redirect(`${process.env.CLIENT_URL}/home`);
      });
    } catch (err) {
      console.error("Google login callback error:", err);
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }
  }
);

// Logout route remains the same
router.get("/logout", (req, res, next) => {
  if (req.user) {
    req.logout(err => {
      if (err) return next(err);
      req.session.destroy(err => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.clearCookie("connect.sid", { path: "/" });
        res.redirect(`${process.env.CLIENT_URL}/login`);
      });
    });
  } else {
    res.clearCookie("connect.sid", { path: "/" });
    res.redirect(`${process.env.CLIENT_URL}/login`);
  }
});

module.exports = router;
