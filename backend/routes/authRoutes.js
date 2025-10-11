const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

// --- Admin password login (only for existing admin users)
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase(), isAdmin: true }).select("+password");

    if (!user)
      return res.status(401).json({ success: false, message: "Admin user not found" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ success: false, message: "Invalid password" });

    // Store unified session data
    req.session.userId = user._id;
    req.session.email = user.email;
    req.session.isAdmin = true;

    req.session.save(err => {
      if (err)
        return res.status(500).json({ success: false, message: "Session save failed" });

      return res.json({ success: true });
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
});

// --- Logout
router.get("/logout", (req, res, next) => {
  req.logout?.(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid", { path: "/" });
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    });
  }) || req.session.destroy(() => {
    res.clearCookie("connect.sid", { path: "/" });
    return res.redirect(`${process.env.CLIENT_URL}/login`);
  });
});

module.exports = router;
