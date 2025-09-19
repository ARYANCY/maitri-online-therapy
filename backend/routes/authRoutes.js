const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true,
  }),
  (req, res) => {
    if (!req.user?._id) {
      console.error("No user found after Google login");
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }
    req.session.userId = req.user._id;

    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect(`${process.env.CLIENT_URL}/login`);
      }
      res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    });
  }
);

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
