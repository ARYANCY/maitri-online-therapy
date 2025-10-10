const User = require("./models/user");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- Helper: determine if user is admin
const isAdminEmail = (email) => {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase());
  return adminEmails.includes(email?.toLowerCase());
};

// --- Email/password login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const isAdmin = isAdminEmail(email) || (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);

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
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

// --- Google OAuth login
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token required" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();
    const name = payload.name || "Unknown User";
    const avatar = payload.picture || "";

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        googleId: payload.sub,
        avatar,
        password: "",
        isAdmin: false
      });
    }

    const isAdmin = isAdminEmail(email);
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
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google login failed", error: err.message });
  }
};

// --- Middleware: require login
exports.requireLogin = (req, res, next) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Unauthorized" });
  req.user = { _id: req.session.userId, isAdmin: req.session.isAdmin || false };
  next();
};

// --- Middleware: require admin
exports.requireAdmin = (req, res, next) => {
  if (!req.session?.userId || !req.session.isAdmin) return res.status(403).json({ error: "Admin access only" });
  req.user = { _id: req.session.userId, isAdmin: true };
  next();
};

// --- Logout
exports.logoutUser = (req, res) => {
  if (!req.session) return res.json({ success: true, message: "Logged out successfully" });
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logged out successfully" });
  });
};
