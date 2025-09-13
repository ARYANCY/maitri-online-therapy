
const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  sendAt: { type: Date, required: true },
  sent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  sentAt: { type: Date },
  attempts: { type: Number, default: 0 },
  lastError: { type: String }
});

module.exports = mongoose.model("Reminder", ReminderSchema);
