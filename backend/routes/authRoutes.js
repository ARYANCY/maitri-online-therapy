const express = require("express");
const router = express.Router();
const passport = require("../config/passport");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true,
  }),
  async (req, res) => {
    try {
      if (!req.user?._id) return res.redirect(`${process.env.CLIENT_URL}/login`);

      req.session.userId = req.user._id;

      const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map(e => e.trim().toLowerCase());
      const isAdmin = adminEmails.includes(req.user.email?.toLowerCase());
      req.session.isAdmin = isAdmin;

      if (isAdmin) {
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
      console.error(err);
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }
  }
);

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

// backend/routes/authRoutes.js
router.post("/admin-login", (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ success: false, message: "Password required" });

  if (password === process.env.ADMIN_PASSWORD) {
    const adminUser = {
      _id: "admin123",
      email: "admin@example.com",
      name: "Admin",
      isAdmin: true,
    };
    req.session.userId = adminUser._id;
    req.session.isAdmin = true;
    req.session.save(err => {
      if (err) return res.status(500).json({ success: false, message: "Session save failed" });
      return res.json({ success: true, user: adminUser });
    });
  } else {
    return res.json({ success: false });
  }
});

module.exports = router;
