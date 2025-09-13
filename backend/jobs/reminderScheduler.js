const schedule = require("node-schedule");
const nodemailer = require("nodemailer");
const Reminder = require("../models/Reminder");
const User = require("../models/User"); 
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: (process.env.SMTP_SECURE === "true") || (process.env.SMTP_PORT == 465),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
const scheduledJobs = new Map();

async function sendEmailAndMark(reminderId) {
  try {
    const reminder = await Reminder.findById(reminderId);
    if (!reminder || reminder.sent) return;
    const mail = {
      from: process.env.FROM_EMAIL,
      to: reminder.email,
      subject: "Maitri — Reminder",
      text: reminder.message,
      html: `<p>${reminder.message}</p><p><small>This reminder was scheduled for ${new Date(reminder.sendAt).toLocaleString()}</small></p>`
    };

    await transporter.sendMail(mail);

    reminder.sent = true;
    reminder.sentAt = new Date();
    reminder.attempts = (reminder.attempts || 0) + 1;
    reminder.lastError = null;
    await reminder.save();
    const jobKey = String(reminderId);
    if (scheduledJobs.has(jobKey)) {
      const job = scheduledJobs.get(jobKey);
      job.cancel();
      scheduledJobs.delete(jobKey);
    }

    console.log(`Reminder ${reminderId} sent to ${reminder.email}`);
  } catch (err) {
    console.error("Error sending reminder email:", err);
    try {
      await Reminder.findByIdAndUpdate(reminderId, {
        $inc: { attempts: 1 },
        lastError: String(err)
      });
    } catch (e) {
      console.error("Failed to update reminder after send error", e);
    }
  }
}

function scheduleReminder(reminder) {
  const sendTime = new Date(reminder.sendAt);
  const jobKey = String(reminder._id);
  if (sendTime <= new Date()) {
    sendEmailAndMark(reminder._id);
    return;
  }
  if (scheduledJobs.has(jobKey)) {
    const prev = scheduledJobs.get(jobKey);
    prev.cancel();
    scheduledJobs.delete(jobKey);
  }

  const job = schedule.scheduleJob(sendTime, async () => {
    await sendEmailAndMark(reminder._id);
  });

  scheduledJobs.set(jobKey, job);
  console.log(`Scheduled reminder ${jobKey} for ${sendTime.toISOString()}`);
}

async function init() {
  try {
    const pending = await Reminder.find({ sent: false, sendAt: { $gte: new Date() } }).lean();
    pending.forEach(r => scheduleReminder(r));
    console.log(`Scheduled ${pending.length} pending reminders`);
  } catch (err) {
    console.error("Failed to init reminder scheduler:", err);
  }
}

function cancelReminder(reminderId) {
  const jobKey = String(reminderId);
  if (scheduledJobs.has(jobKey)) {
    const job = scheduledJobs.get(jobKey);
    job.cancel();
    scheduledJobs.delete(jobKey);
    console.log(`Cancelled reminder ${reminderId}`);
  } else {
    console.log(`No scheduled job found for reminder ${reminderId}`);
  }
}

module.exports = {
  scheduleReminder,
  init,
  sendEmailAndMark,
  cancelReminder,
};

