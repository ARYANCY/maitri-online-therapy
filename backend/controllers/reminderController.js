require("dotenv").config();
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const Reminder = require("../models/Reminder");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", 
  auth: {
    user: process.env.SMTP_USER || process.env.GMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD,
  },
  pool: true,
  connectionTimeout: 15000,
  socketTimeout: 15000,
  tls: { rejectUnauthorized: false },
});
const emailConfigured = Boolean(process.env.SMTP_USER || process.env.GMAIL_USER) && Boolean(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD);
(async () => {
  try {
    if (emailConfigured) {
      await transporter.verify();
    } else {
    }
  } catch (err) {
    
  }
})();
const sendEmail = async (to, subject, text) => {
  try {
    if (!emailConfigured) return;
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.GMAIL_USER,
      to,
      subject,
      text,
    });
    
  } catch (err) {
    
  }
};
function computeNextRunAt({ dateTime, repeat, customInterval, endDate }) {
  const now = new Date();
  let next = new Date(dateTime);

  if (repeat === "none") return null;

  const addInterval = () => {
    switch (repeat) {
      case "daily":
        next.setDate(next.getDate() + 1);
        break;
      case "weekly":
        next.setDate(next.getDate() + 7);
        break;
      case "monthly":
        next.setMonth(next.getMonth() + 1);
        break;
      case "custom":
        next.setDate(next.getDate() + (customInterval || 1));
        break;
    }
  };

  addInterval();

  while (next <= now) {
    addInterval();
    if (endDate && next > new Date(endDate)) return null;
  }

  if (endDate && next > new Date(endDate)) return null;
  return next;
}

function initReminderScheduler() {
  cron.schedule("*/1 * * * *", async () => {
    try {
      const now = new Date();
      const dueReminders = await Reminder.find({ status: "pending", nextRunAt: { $lte: now } });

      for (const reminder of dueReminders) {
        await sendEmail(reminder.email, "Reminder", reminder.message);
        reminder.lastSentAt = new Date();

        const nextRun = computeNextRunAt({
          dateTime: reminder.dateTime,
          repeat: reminder.repeat,
          customInterval: reminder.customInterval,
          endDate: reminder.endDate,
        });

        if (nextRun) {
          reminder.dateTime = nextRun;
          reminder.nextRunAt = nextRun;
          reminder.status = "pending";
        } else {
          reminder.nextRunAt = null;
          reminder.status = "sent";
        }

        await reminder.save();
      }
    } catch (err) {
      
    }
  });
}

const reschedulePendingReminders = async () => {
  initReminderScheduler();
};

module.exports = { initReminderScheduler, reschedulePendingReminders, sendEmail };
