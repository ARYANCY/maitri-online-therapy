const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const User = require("../models/User");

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login`, session: true }),
  async (req, res) => {
    try {
      if (!req.user?._id) return res.redirect(`${process.env.CLIENT_URL}/login`);

      req.session.userId = req.user._id;
      req.session.email = req.user.email;
      req.session.isAdmin = !!req.user.isAdmin;

      req.session.save(err => {
        if (err) return res.redirect(`${process.env.CLIENT_URL}/login`);
        const redirectUrl = req.user.isAdmin ? `${process.env.CLIENT_URL}/admin` : `${process.env.CLIENT_URL}/dashboard`;
        return res.redirect(redirectUrl);
      });
    } catch (err) {
      console.error(err);
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }
  }
);

router.post("/admin-login", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: "Password required" });

    if (!req.session?.userId) return res.status(401).json({ success: false, message: "No logged-in user" });
    if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ success: false, message: "Incorrect password" });

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isAdmin = true;
    await user.save();

    req.session.isAdmin = true;
    req.session.email = user.email;

    req.session.save(err => {
      if (err) return res.status(500).json({ success: false, message: "Session save failed" });
      return res.json({ success: true, user: { _id: user._id, email: user.email, name: user.name, isAdmin: true } });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid", { path: "/" });
    return res.redirect(`${process.env.CLIENT_URL}/login`);
  });
});

router.get("/session-check", async (req, res) => {
  try {
    const { userId, email, isAdmin } = req.session;
    const referer = req.get("Referer") || "";
    const onAdminPage = referer.includes("/admin");

    if (!userId || (onAdminPage && !isAdmin)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Fetch user details from database for complete user info
    const User = require("../models/User");
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    res.json({ 
      success: true, 
      user: { 
        _id: user._id, 
        email: user.email, 
        name: user.name,
        isAdmin: !!isAdmin 
      } 
    });
  } catch (err) {
    console.error("Session check error:", err);
    res.status(500).json({ success: false, message: "Session check failed" });
  }
});

module.exports = router;
