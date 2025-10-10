// authMiddleware.js
exports.requireLogin = (req, res, next) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Unauthorized" });
  req.user = { _id: req.session.userId, isAdmin: req.session.isAdmin || false };
  next();
};
