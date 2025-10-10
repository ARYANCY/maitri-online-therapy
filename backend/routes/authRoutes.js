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

      req.session.userId = req.user._id;

      const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
      const isAdmin = adminEmails.includes(req.user.email?.toLowerCase());
      req.session.isAdmin = isAdmin;

      if (isAdmin && !req.user.isAdmin) {
        req.user.isAdmin = true;
        await req.user.save();
      }

      req.session.save(err => {
        if (err) return res.redirect(`${process.env.CLIENT_URL}/login`);
        const redirectUrl = isAdmin
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

// --- Logout
router.get("/logout", (req, res, next) => {
  if (req.user) {
    req.logout(err => {
      if (err) return next(err);
      req.session.destroy(err => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.clearCookie("connect.sid", { path: "/" });
        return res.redirect(`${process.env.CLIENT_URL}/login`);
      });
    });
  } else {
    res.clearCookie("connect.sid", { path: "/" });
    return res.redirect(`${process.env.CLIENT_URL}/login`);
  }
});

// --- Admin login
router.post("/admin-login", async (req, res) => {
  try {
    const { password } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) return res.json({ success: false });

    let adminUser = await User.findOne({ isAdmin: true }).select("+password");

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      adminUser = new User({
        name: "Admin",
        email: process.env.ADMIN_EMAILS?.split(",")[0] || "admin@example.com",
        password: hashedPassword,
        isAdmin: true,
      });
      await adminUser.save();
    }

    req.session.userId = adminUser._id;
    req.session.isAdmin = true;

    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ success: false, message: "Session save failed" });
      }
      return res.json({ success: true });
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
});

// --- Session check
router.get("/session-check", (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  res.json({ user: { _id: req.session.userId, isAdmin: req.session.isAdmin || false } });
});

module.exports = router;
