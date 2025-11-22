const mongoose = require("mongoose");

function computeNextRunAt({ dateTime, repeat, customInterval, endDate }) {
  const now = new Date();
  let next = new Date(dateTime);

  if (repeat === "none") return next;

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
      default:
        break;
    }
  };

  while (next < now) {
    addInterval();
    if (endDate && next > new Date(endDate)) return null;
  }

  return next;
}

const reminderSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 500,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
  },
  dateTime: {
    type: Date,
    required: true
  },
  repeat: {
    type: String,
    enum: ["none", "daily", "weekly", "monthly", "custom"],
    default: "none"
  },
  customInterval: {
    type: Number,
    default: null
  },
  endDate: {
    type: Date, 
    default: null
  },
  category: {
    type: String,
    default: "General"
  },
  status: {
    type: String,
    enum: ["pending", "sent", "skipped"],
    default: "pending"
  },
  nextRunAt: {
    type: Date,
    default: null,
    index: true,
  },
  lastSentAt: {
    type: Date, 
    default: null
  }
}, { timestamps: true });

reminderSchema.index({ status: 1, nextRunAt: 1 });
reminderSchema.index({ email: 1 });
reminderSchema.index({ dateTime: 1 });

reminderSchema.pre("save", function(next) {
  try {
    if (this.status === "pending") {
      const nextRun = computeNextRunAt({
        dateTime: this.dateTime,
        repeat: this.repeat,
        customInterval: this.customInterval,
        endDate: this.endDate,
      });
      this.nextRunAt = nextRun;
      if (!nextRun && this.repeat !== "none") {
        this.status = "skipped";
      }
    }
    next();
  } catch (e) {
    next(e);
  }
});

module.exports = mongoose.model("Reminder", reminderSchema);
