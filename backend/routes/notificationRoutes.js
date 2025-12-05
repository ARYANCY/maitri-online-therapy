const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/authMiddleware");
const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");

// Get all notifications for current user
router.get("/", requireLogin, asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  
  res.status(200).json({
    success: true,
    notifications
  });
}));

// Get unread notifications count
router.get("/unread-count", requireLogin, asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ 
    userId: req.user._id, 
    isRead: false 
  });
  
  res.status(200).json({
    success: true,
    count
  });
}));

// Mark notification as read
router.patch("/:id/read", requireLogin, asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found"
    });
  }
  
  res.status(200).json({
    success: true,
    notification
  });
}));

// Mark all notifications as read
router.patch("/mark-all-read", requireLogin, asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );
  
  res.status(200).json({
    success: true,
    message: "All notifications marked as read"
  });
}));

// Delete a notification
router.delete("/:id", requireLogin, asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found"
    });
  }
  
  res.status(200).json({
    success: true,
    message: "Notification deleted"
  });
}));

module.exports = router;

