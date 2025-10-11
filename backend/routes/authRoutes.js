const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const User = require("../models/User");

// --- Google OAuth login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login`, session: true }),
  async (req, res) => {
    try {
      if (!req.user?._id) return res.redirect(`${process.env.CLIENT_URL}/login`);

      // Store unified session data
      req.session.userId = req.user._id;
      req.session.email = req.user.email;
      req.session.isAdmin = !!req.user.isAdmin;

      req.session.save(err => {
        if (err) return res.redirect(`${process.env.CLIENT_URL}/login`);

        const redirectUrl = req.user.isAdmin
          ? `${process.env.CLIENT_URL}/admin`
          : `${process.env.CLIENT_URL}/dashboard`;

        return res.redirect(redirectUrl);
      });
    } catch (err) {
      console.error("Google callback error:", err);
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }
  }
);
router.post("/admin-login", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ success: false, message: "Password required" });

    // Find any user (who is not admin yet)
    let user = await User.findOne({ isAdmin: false });
    if (!user)
      return res.status(404).json({ success: false, message: "No user available to make admin" });

    // Check plain-text password from .env
    if (password !== process.env.ADMIN_PASSWORD)
      return res.status(401).json({ success: false, message: "Incorrect password" });

    // Update user to admin
    user.isAdmin = true;
    await user.save();

    // Store session info
    req.session.userId = user._id;
    req.session.email = user.email;
    req.session.isAdmin = true;

    req.session.save(err => {
      if (err) return res.status(500).json({ success: false, message: "Session save failed" });
      return res.json({ success: true });
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
});



// --- Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid", { path: "/" });
    return res.redirect(`${process.env.CLIENT_URL}/login`);
  });
});
router.get("/session-check", (req, res) => {
  if (!req.session.userId || !req.session.isAdmin) 
    return res.status(401).json({ success: false, message: "Unauthorized" });
  res.json({
    success: true,
    user: {
      _id: req.session.userId,
      email: req.session.email,
      isAdmin: req.session.isAdmin
    }
  });
});
module.exports = router;
