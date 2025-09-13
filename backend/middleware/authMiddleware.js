module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Please log in first" });
  }
  next();
};
