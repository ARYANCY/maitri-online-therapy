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


router.post("/admin-login", (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    // Create or fetch admin user in DB if not exists
    User.findOne({ isAdmin: true }).then(async adminUser => {
      if (!adminUser) {
        // First-time setup: create admin user in DB
        const newAdmin = new User({
          name: "Admin",
          email: process.env.ADMIN_EMAILS?.split(",")[0] || "admin@example.com",
          password: await bcrypt.hash(password, 10),
          isAdmin: true
        });
        await newAdmin.save();
        req.session.userId = newAdmin._id;
        req.session.isAdmin = true;
        req.session.save(err => {
          if (err) return res.status(500).json({ success: false, message: "Session save failed" });
          return res.json({ success: true });
        });
      } else {
        // Admin already exists, just set session
        req.session.userId = adminUser._id;
        req.session.isAdmin = true;
        req.session.save(err => {
          if (err) return res.status(500).json({ success: false, message: "Session save failed" });
          return res.json({ success: true });
        });
      }
    }).catch(err => {
      console.error(err);
      return res.status(500).json({ success: false, message: "Login failed" });
    });
  } else {
    return res.json({ success: false });
  }
});

// Session check route
router.get("/session-check", (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  return res.json({
    user: {
      _id: req.session.userId,
      isAdmin: req.session.isAdmin || false
    }
  });
});


module.exports = router;
