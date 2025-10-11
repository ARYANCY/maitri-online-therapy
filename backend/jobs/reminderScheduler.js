const schedule = require("node-schedule");
const nodemailer = require("nodemailer");
const Reminder = require("../models/Reminder");
const User = require("../models/User");

// Email configuration validation
const isEmailConfigured = () => {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.FROM_EMAIL
  );
};

// Create transporter with better error handling
let transporter = null;
if (isEmailConfigured()) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE === "true") || (process.env.SMTP_PORT == 465),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    // Add connection timeout and retry settings
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 20000,
    rateLimit: 5
  });

  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP configuration error:", error);
    } else {
      console.log("✅ SMTP server is ready to send emails");
    }
  });
} else {
  console.warn("⚠️ SMTP not configured. Reminder emails will not be sent.");
}

const scheduledJobs = new Map();
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5 * 60 * 1000; // 5 minutes

async function sendEmailAndMark(reminderId) {
  try {
    const reminder = await Reminder.findById(reminderId);
    if (!reminder || reminder.sent) {
      console.log(`Reminder ${reminderId} not found or already sent`);
      return;
    }

    // Check if email is configured
    if (!transporter) {
      console.warn(`Cannot send reminder ${reminderId}: SMTP not configured`);
      await Reminder.findByIdAndUpdate(reminderId, {
        sent: true,
        sentAt: new Date(),
        attempts: (reminder.attempts || 0) + 1,
        lastError: "SMTP not configured"
      });
      return;
    }

    // Prepare email content
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: reminder.email,
      subject: "🔔 Maitri Reminder",
      text: reminder.message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🔔 Maitri Reminder</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 20px 0;">
              ${reminder.message.replace(/\n/g, '<br>')}
            </p>
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Scheduled for:</strong> ${new Date(reminder.sendAt).toLocaleString()}<br>
                <strong>Sent at:</strong> ${new Date().toLocaleString()}
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                This reminder was created through Maitri's mental health platform.
              </p>
            </div>
          </div>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Reminder ${reminderId} sent successfully to ${reminder.email}`);

    // Mark as sent
    await Reminder.findByIdAndUpdate(reminderId, {
      sent: true,
      sentAt: new Date(),
      attempts: (reminder.attempts || 0) + 1,
      lastError: null
    });

    // Clean up scheduled job
    const jobKey = String(reminderId);
    if (scheduledJobs.has(jobKey)) {
      const job = scheduledJobs.get(jobKey);
      job.cancel();
      scheduledJobs.delete(jobKey);
    }

  } catch (err) {
    console.error(`❌ Error sending reminder ${reminderId}:`, err.message);
    
    try {
      const reminder = await Reminder.findById(reminderId);
      if (!reminder) return;

      const attempts = (reminder.attempts || 0) + 1;
      const shouldRetry = attempts < MAX_RETRY_ATTEMPTS;

      await Reminder.findByIdAndUpdate(reminderId, {
        attempts,
        lastError: err.message,
        // Don't mark as sent if we're going to retry
        ...(shouldRetry ? {} : { sent: true, sentAt: new Date() })
      });

      // Schedule retry if we haven't exceeded max attempts
      if (shouldRetry) {
        console.log(`🔄 Scheduling retry ${attempts}/${MAX_RETRY_ATTEMPTS} for reminder ${reminderId}`);
        setTimeout(() => {
          sendEmailAndMark(reminderId);
        }, RETRY_DELAY * attempts); // Exponential backoff
      } else {
        console.log(`❌ Max retry attempts reached for reminder ${reminderId}`);
        // Clean up scheduled job
        const jobKey = String(reminderId);
        if (scheduledJobs.has(jobKey)) {
          const job = scheduledJobs.get(jobKey);
          job.cancel();
          scheduledJobs.delete(jobKey);
        }
      }
    } catch (updateErr) {
      console.error("Failed to update reminder after send error:", updateErr);
    }
  }
}

function scheduleReminder(reminder) {
  const sendTime = new Date(reminder.sendAt);
  const jobKey = String(reminder._id);
  
  // If the time has already passed, send immediately
  if (sendTime <= new Date()) {
    console.log(`⏰ Reminder ${reminder._id} is overdue, sending immediately`);
    sendEmailAndMark(reminder._id);
    return;
  }

  // Cancel existing job if it exists
  if (scheduledJobs.has(jobKey)) {
    const prevJob = scheduledJobs.get(jobKey);
    prevJob.cancel();
    scheduledJobs.delete(jobKey);
  }

  // Schedule new job
  const job = schedule.scheduleJob(sendTime, async () => {
    await sendEmailAndMark(reminder._id);
  });

  if (job) {
    scheduledJobs.set(jobKey, job);
    console.log(`📅 Scheduled reminder ${jobKey} for ${sendTime.toISOString()}`);
  } else {
    console.error(`❌ Failed to schedule reminder ${jobKey}`);
  }
}

async function init() {
  try {
    console.log("🔄 Initializing reminder scheduler...");
    
    // Clean up old sent reminders (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deletedCount = await Reminder.deleteMany({
      sent: true,
      sentAt: { $lt: thirtyDaysAgo }
    });
    
    if (deletedCount.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount.deletedCount} old sent reminders`);
    }

    // Schedule pending reminders
    const pending = await Reminder.find({ 
      sent: false, 
      sendAt: { $gte: new Date() } 
    }).lean();
    
    pending.forEach(r => scheduleReminder(r));
    console.log(`📅 Scheduled ${pending.length} pending reminders`);

    // Check for overdue reminders
    const overdue = await Reminder.find({
      sent: false,
      sendAt: { $lt: new Date() }
    }).lean();
    
    if (overdue.length > 0) {
      console.log(`⚠️ Found ${overdue.length} overdue reminders, sending immediately`);
      overdue.forEach(r => sendEmailAndMark(r._id));
    }

    console.log("✅ Reminder scheduler initialized successfully");
  } catch (err) {
    console.error("❌ Failed to init reminder scheduler:", err);
  }
}

function cancelReminder(reminderId) {
  const jobKey = String(reminderId);
  if (scheduledJobs.has(jobKey)) {
    const job = scheduledJobs.get(jobKey);
    job.cancel();
    scheduledJobs.delete(jobKey);
    console.log(`❌ Cancelled reminder ${reminderId}`);
  } else {
    console.log(`ℹ️ No scheduled job found for reminder ${reminderId}`);
  }
}

// Health check function
function getSchedulerStatus() {
  return {
    isEmailConfigured: isEmailConfigured(),
    activeJobs: scheduledJobs.size,
    maxRetryAttempts: MAX_RETRY_ATTEMPTS,
    retryDelay: RETRY_DELAY
  };
}

module.exports = {
  scheduleReminder,
  init,
  sendEmailAndMark,
  cancelReminder,
  getSchedulerStatus,
  isEmailConfigured
};