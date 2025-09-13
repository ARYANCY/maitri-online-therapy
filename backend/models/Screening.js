const mongoose = require("mongoose");

const ScreeningSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true }, // link to user
  message: { type: String, required: true }, // user's message that triggered screening

  phq9_score: { type: Number, min: 0, max: 27, default: 0 }, // depression
  gad7_score: { type: Number, min: 0, max: 21, default: 0 },  // anxiety
  ghq_score: { type: Number, min: 0, max: 36, default: 0 },  // general health
  risk_level: { type: String, enum: ["low", "moderate", "high"], default: "low" }, // overall risk

  createdAt: { type: Date, default: Date.now }, // timestamp
});

ScreeningSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Screening", ScreeningSchema);
