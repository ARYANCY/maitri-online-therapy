const mongoose = require("mongoose");
const MetricsSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true },
  message: { type: String, required: true },
  stress_level: { type: Number, default: 0 },
  happiness_level: { type: Number, default: 0 },
  anxiety_level: { type: Number, default: 0 },
  overall_mood_level: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Metrics", MetricsSchema);
