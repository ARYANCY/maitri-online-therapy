const mongoose = require("mongoose");
const ScreeningSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true },
  message: { type: String, required: true },
  phq9_score: { type: Number, min: 0, max: 27, default: 0 }, 
  gad7_score: { type: Number, min: 0, max: 21, default: 0 }, 
  ghq_score: { type: Number, min: 0, max: 36, default: 0 }, 
  risk_level: { type: String, enum: ["low", "moderate", "high"], default: "low" }, 

  createdAt: { type: Date, default: Date.now }, // timestamp
});

ScreeningSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Screening", ScreeningSchema);
