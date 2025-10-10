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
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password) return res.status(400).json({ success: false, error: "Password required" });

    // Optionally, allow a default admin account
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (password !== adminPassword) return res.json({ success: false });

    // Check if admin user exists in DB
    let user = await User.findOne({ email });
    if (!user) {
      // Create admin user if not exists
      user = new User({ 
        name: "Admin", 
        email: email || "admin@example.com", 
        password: "", 
        isAdmin: true 
      });
      await user.save();
    } else if (!user.isAdmin) {
      // Make existing user admin
      user.isAdmin = true;
      await user.save();
    }

    // Set session
    req.session.userId = user._id;
    req.session.isAdmin = true;

    req.session.save(err => {
      if (err) return res.status(500).json({ success: false, error: "Session save failed" });
      res.json({ success: true, user: { _id: user._id, email: user.email, name: user.name, isAdmin: true } });
    });

  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, error: "Login failed" });
  }
});



module.exports = router;
