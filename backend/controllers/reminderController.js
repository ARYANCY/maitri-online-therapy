const mongoose = require("mongoose");
const Reminder = require("../models/Reminder");
const reminderScheduler = require("../jobs/reminderScheduler");

const createReminder = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ 
      success: false,
      error: req.t("auth.loginRequired")
    });

    const { message, sendAt } = req.body;
    
    // Input validation
    if (!message || !sendAt) {
      return res.status(400).json({ 
        success: false,
        error: req.t("reminder.messageRequired") 
      });
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: req.t("reminder.messageRequired")
      });
    }

    if (message.length > 500) {
      return res.status(400).json({ 
        success: false,
        error: req.t("reminder.messageTooLong")
      });
    }

    const sendDate = new Date(sendAt);
    if (isNaN(sendDate.getTime())) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid date format for sendAt" 
      });
    }

    if (sendDate <= new Date()) {
      return res.status(400).json({ 
        success: false,
        error: "sendAt must be a future date/time" 
      });
    }

    // Check if sendAt is not too far in the future (1 year max)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if (sendDate > oneYearFromNow) {
      return res.status(400).json({ 
        success: false,
        error: "sendAt cannot be more than 1 year in the future" 
      });
    }

    // Check user's reminder limit (max 10 active reminders)
    const activeRemindersCount = await Reminder.countDocuments({ 
      userId: user._id, 
      sent: false 
    });
    
    if (activeRemindersCount >= 10) {
      return res.status(400).json({ 
        success: false,
        error: "Maximum of 10 active reminders allowed. Please cancel some existing reminders first." 
      });
    }

    const reminder = await Reminder.create({
      userId: user._id,
      email: user.email,
      message: message.trim(),
      sendAt: sendDate,
    });

    console.log("Reminder created in DB:", reminder._id);

    try {
      reminderScheduler.scheduleReminder(reminder);
      console.log("Reminder scheduled in job scheduler:", reminder._id);
    } catch (schedulerErr) {
      console.error("Failed to schedule reminder in job scheduler:", schedulerErr);
      // Don't fail the request if scheduling fails, but log it
    }

    return res.status(201).json({ 
      success: true,
      message: "Reminder scheduled successfully", 
      reminder: {
        _id: reminder._id,
        message: reminder.message,
        sendAt: reminder.sendAt,
        createdAt: reminder.createdAt
      }
    });
  } catch (err) {
    console.error("createReminder error:", err);
    return res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: err.message 
    });
  }
};

const listReminders = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ 
      success: false,
      error: "Unauthorized: Please log in" 
    });

    const reminders = await Reminder.find({ 
      userId: user._id 
    })
    .sort({ sendAt: 1 })
    .select('-userId -email') // Don't send sensitive data
    .lean();

    // Add status information
    const remindersWithStatus = reminders.map(reminder => ({
      ...reminder,
      status: reminder.sent ? 'sent' : 
              new Date(reminder.sendAt) <= new Date() ? 'overdue' : 'pending',
      isOverdue: !reminder.sent && new Date(reminder.sendAt) <= new Date()
    }));

    return res.json({ 
      success: true,
      reminders: remindersWithStatus 
    });
  } catch (err) {
    console.error("listReminders error:", err);
    return res.status(500).json({ 
      success: false,
      error: "Failed to fetch reminders", 
      details: err.message 
    });
  }
};

const cancelReminder = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ 
      success: false,
      error: "Unauthorized: Please log in" 
    });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid reminder ID" 
      });
    }

    const reminder = await Reminder.findOneAndDelete({ 
      _id: id, 
      userId: user._id 
    });

    if (!reminder) {
      return res.status(404).json({ 
        success: false,
        error: "Reminder not found or already deleted" 
      });
    }

    try {
      reminderScheduler.cancelReminder(reminder._id);
      console.log("Reminder canceled in job scheduler:", reminder._id);
    } catch (schedulerErr) {
      console.error("Failed to cancel reminder in job scheduler:", schedulerErr);
    }

    return res.json({ 
      success: true,
      message: "Reminder cancelled successfully", 
      reminder: {
        _id: reminder._id,
        message: reminder.message,
        sendAt: reminder.sendAt
      }
    });
  } catch (err) {
    console.error("cancelReminder error:", err);
    return res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: err.message 
    });
  }
};

const getReminderStats = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ 
      success: false,
      error: "Unauthorized: Please log in" 
    });

    const now = new Date();

    const stats = await Reminder.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ["$sent", true] }, 1, 0] } },
          pending: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$sent", false] }, { $gt: ["$sendAt", now] }] },
                1,
                0
              ]
            }
          },
          overdue: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$sent", false] }, { $lte: ["$sendAt", now] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || { total: 0, sent: 0, pending: 0, overdue: 0 };

    return res.json({ 
      success: true,
      stats: result 
    });
  } catch (err) {
    console.error("getReminderStats error:", err);
    return res.status(500).json({ 
      success: false,
      error: "Failed to fetch reminder statistics", 
      details: err.message 
    });
  }
};


// Export as named functions (for proper destructuring in routes)
module.exports = { createReminder, listReminders, cancelReminder, getReminderStats };
