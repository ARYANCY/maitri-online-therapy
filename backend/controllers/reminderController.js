const mongoose = require("mongoose");
const Reminder = require("../models/Reminder");
const reminderScheduler = require("../jobs/reminderScheduler");
exports.createReminder = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { message, sendAt } = req.body;
    if (!message || !sendAt) return res.status(400).json({ error: "'message' and 'sendAt' are required" });

    const sendDate = new Date(sendAt);
    if (isNaN(sendDate.getTime()) || sendDate <= new Date()) {
      return res.status(400).json({ error: "'sendAt' must be a valid future date/time" });
    }

    const userId = mongoose.Types.ObjectId(user._id);

    const reminder = await Reminder.create({
      userId,
      email: user.email,
      message,
      sendAt: sendDate,
    });
    console.log("Reminder created:", reminder);
    try {
      reminderScheduler.scheduleReminder(reminder);
      console.log("Reminder scheduled:", reminder._id);
    } catch (err) {
      console.error("Failed to schedule reminder:", err);
    }

    return res.status(201).json({ message: "Reminder scheduled successfully", reminder });
  } catch (err) {
    console.error("createReminder error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};
exports.listReminders = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const reminders = await Reminder.find({ userId: user._id }).sort({ sendAt: 1 }).lean();
    return res.json({ reminders });
  } catch (err) {
    console.error("listReminders error:", err);
    return res.status(500).json({ error: "Failed to fetch reminders" });
  }
};
exports.cancelReminder = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid reminder ID" });
    }

    const reminder = await Reminder.findOneAndDelete({ _id: id, userId: user._id });
    if (!reminder) return res.status(404).json({ error: "Reminder not found" });
    try {
      reminderScheduler.cancelReminder(reminder._id);
      console.log("Reminder canceled in scheduler:", reminder._id);
    } catch (err) {
      console.error("Failed to cancel reminder in scheduler:", err);
    }

    return res.json({ message: "Reminder cancelled successfully", reminder });
  } catch (err) {
    console.error("cancelReminder error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};
