const User = require("./models/user");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Normal login (email + password)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Set isAdmin if ADMIN_PASSWORD matches
    let isAdmin = false;
    if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
      isAdmin = true;
      user.isAdmin = true;
      await user.save();
    }

    req.session.userId = user._id;
    req.session.isAdmin = isAdmin;

    req.session.save(err => {
      if (err) return res.status(500).json({ error: "Session save failed" });
      res.json({ success: true, user: { ...user.toObject(), isAdmin } });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

// Google OAuth login (admins only)
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token required" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    let user = await User.findOne({ email });
    if (!user) {
      // Create user if not exists
      user = new User({
        email,
        name: payload.name,
        googleId: payload.sub,
        avatar: payload.picture,
        isAdmin: true // only admins can login via Google
      });
      await user.save();
    }

    if (!user.isAdmin) return res.status(403).json({ message: "Unauthorized: Admin only" });

    req.session.userId = user._id;
    req.session.isAdmin = true;

    res.json({ success: true, user: { ...user.toObject(), isAdmin: true } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Google login failed", error });
  }
};

// Require login middleware
exports.requireLogin = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: "Unauthorized" });
  req.user = { _id: req.session.userId, isAdmin: req.session.isAdmin || false };
  next();
};

// Logout user
exports.logoutUser = (req, res) => {
  try {
    if (typeof req.logout === "function") {
      return req.logout(err => {
        if (err) return res.status(500).json({ success: false, message: "Logout failed" });
        if (req.session) res.clearCookie("connect.sid");
        return res.json({ success: true, message: "Logged out successfully" });
      });
    }

    if (req.session) {
      return req.session.destroy(err => {
        if (err) return res.status(500).json({ success: false, message: "Logout failed" });
        res.clearCookie("connect.sid");
        return res.json({ success: true, message: "Logged out successfully" });
      });
    }

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Logout failed due to server error" });
  }
};
