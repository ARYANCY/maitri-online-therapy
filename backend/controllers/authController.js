exports.logoutUser = (req, res) => {
  try {
    if (typeof req.logout === "function") {
      return req.logout(err => {
        if (err) {
          console.error("Logout error (passport):", err);
          return res.status(500).json({ success: false, message: "Logout failed" });
        }
        if (req.session) res.clearCookie("connect.sid");
        return res.json({ success: true, message: "Logged out successfully" });
      });
    }

    if (req.session) {
      return req.session.destroy(err => {
        if (err) {
          console.error("Logout error (session destroy):", err);
          return res.status(500).json({ success: false, message: "Logout failed" });
        }
        res.clearCookie("connect.sid"); 
        return res.json({ success: true, message: "Logged out successfully" });
      });
    }

    return res.json({ success: true, message: "Logged out successfully" });

  } catch (err) {
    console.error("Unexpected logout error:", err);
    return res.status(500).json({ success: false, message: "Logout failed due to server error" });
  }
};
exports.requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = { _id: req.session.userId };
  next();
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    req.session.userId = user._id;
    req.session.save(err => {
      if (err) return res.status(500).json({ error: "Session save failed" });
      res.json({ success: true, user });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};
