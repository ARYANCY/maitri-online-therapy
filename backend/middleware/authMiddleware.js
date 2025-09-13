module.exports = (req, res, next) => {
  // Check the actual session key where user ID is stored
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, message: "Please log in first" });
  }

  // Attach user object to request
  if (!req.user) req.user = { _id: req.session.userId };

  next();
};
