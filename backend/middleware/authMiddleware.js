// --- Require login (any user)
exports.requireLogin = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: req.t ? req.t("auth.unauthorized") : "Unauthorized: Please login" });
  }
  req.user = {
    _id: req.session.userId,
    isAdmin: !!req.session.isAdmin,
    email: req.session.email
  };
  next();
};

// --- Require admin (only for /admin routes)
exports.requireAdmin = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: req.t ? req.t("auth.unauthorized") : "Please login" });
  }
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: req.t ? req.t("auth.adminAccessOnly") : "Admin access only" });
  }
  req.user = {
    _id: req.session.userId,
    isAdmin: !!req.session.isAdmin,
    email: req.session.email
  };
  next();
};
