const mongoose = require("mongoose");

const MetricsSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true },
  message: { type: String, required: true },

  // Emotional metrics (0–50 scale)
  metrics: {
    stress_level: { type: Number, default: 0 },
    happiness_level: { type: Number, default: 0 },
    anxiety_level: { type: Number, default: 0 },
    focus_level: { type: Number, default: 0 },
    energy_level: { type: Number, default: 0 },
    confidence_level: { type: Number, default: 0 },
    motivation_level: { type: Number, default: 0 },
    calmness_level: { type: Number, default: 0 },
    sadness_level: { type: Number, default: 0 },
    loneliness_level: { type: Number, default: 0 },
    gratitude_level: { type: Number, default: 0 },
    overall_mood_level: { type: Number, default: 0 },
  },

  // New Screening Data
  screening: {
    phq9_score: { type: Number, min: 0, max: 27, default: null },
    gad7_score: { type: Number, min: 0, max: 21, default: null },
    ghq_score: { type: Number, min: 0, max: 36, default: null },
    risk_level: {
      type: String,
      enum: ["low", "moderate", "high"],
      default: "low",
    },
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Metrics", MetricsSchema);
