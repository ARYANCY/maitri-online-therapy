
module.exports = (req, res, next) => {

  if (!req.session?.user) {
    return res.status(401).json({ success: false, message: "Please log in first" });
  }

  if (!req.user) req.user = { _id: req.session.userId };
  next();
};
