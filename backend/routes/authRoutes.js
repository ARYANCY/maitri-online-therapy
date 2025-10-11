const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// --- Google OAuth login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true,
  }),
  async (req, res) => {
    try {
      if (!req.user?._id) return res.redirect(`${process.env.CLIENT_URL}/login`);

      // Store unified session data
      req.session.userId = req.user._id;
      req.session.email = req.user.email;
      req.session.isAdmin = !!req.user.isAdmin;

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect(`${process.env.CLIENT_URL}/login`);
        }

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

// --- Admin password login
router.post("/admin-login", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password !== process.env.ADMIN_PASSWORD)
      return res.status(401).json({ success: false, message: "Invalid password" });

    const adminEmail = (process.env.ADMIN_EMAILS || "").split(",")[0]?.trim().toLowerCase();

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      adminUser = await User.create({
        name: "Admin",
        email: adminEmail || "admin@example.com",
        password: hashedPassword,
        isAdmin: true,
      });
    } else if (!adminUser.isAdmin) {
      adminUser.isAdmin = true;
      await adminUser.save();
    }

    // Store unified session data
    req.session.userId = adminUser._id;
    req.session.email = adminUser.email;
    req.session.isAdmin = true;

    req.session.save((err) => {
      if (err) {
        console.error("Admin session save error:", err);
        return res.status(500).json({ success: false, message: "Session save failed" });
      }
      return res.json({ success: true });
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
});

// --- Logout
router.get("/logout", (req, res, next) => {
  if (req.user) {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.clearCookie("connect.sid", { path: "/" });
        return res.redirect(`${process.env.CLIENT_URL}/login`);
      });
    });
  } else {
    req.session.destroy(() => {
      res.clearCookie("connect.sid", { path: "/" });
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    });
  }
});

module.exports = router;
