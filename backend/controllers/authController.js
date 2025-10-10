const User = require("./models/user");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    let isAdmin = false;
    if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) isAdmin = true;

    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");
    if (adminEmails.includes(email)) isAdmin = true;

    if (isAdmin && !user.isAdmin) {
      user.isAdmin = true;
      await user.save();
    }

    req.session.userId = user._id;
    req.session.isAdmin = isAdmin;

    req.session.save(err => {
      if (err) return res.status(500).json({ error: "Session save failed" });
      res.json({
        success: true,
        user: { _id: user._id, email: user.email, name: user.name, isAdmin }
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

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
      user = new User({
        email,
        name: payload.name,
        googleId: payload.sub,
        avatar: payload.picture,
        isAdmin: false
      });
      await user.save();
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");
    const isAdmin = adminEmails.includes(email);

    if (isAdmin && !user.isAdmin) {
      user.isAdmin = true;
      await user.save();
    }

    req.session.userId = user._id;
    req.session.isAdmin = isAdmin;

    req.session.save(err => {
      if (err) return res.status(500).json({ message: "Session save failed" });
      res.json({
        success: true,
        user: { _id: user._id, email: user.email, name: user.name, isAdmin }
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Google login failed", error });
  }
};

exports.requireLogin = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: "Unauthorized" });
  req.user = { _id: req.session.userId, isAdmin: req.session.isAdmin || false };
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.session.userId || !req.session.isAdmin) return res.status(403).json({ error: "Admin access only" });
  req.user = { _id: req.session.userId, isAdmin: true };
  next();
};

exports.logoutUser = (req, res) => {
  try {
    if (req.session) {
      req.session.destroy(err => {
        if (err) return res.status(500).json({ success: false, message: "Logout failed" });
        res.clearCookie("connect.sid");
        return res.json({ success: true, message: "Logged out successfully" });
      });
    } else {
      return res.json({ success: true, message: "Logged out successfully" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Logout failed due to server error" });
  }
};
