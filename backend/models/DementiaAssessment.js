const mongoose = require("mongoose");

const dementiaAssessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sessionId: { type: String, required: true, unique: true, index: true },
  difficulty: { type: String, enum: ["easy", "moderate", "hard"], default: "easy" },
  questions: [{
    id: { type: String, required: true },
    text: { type: String, required: true },
    category: { type: String, required: true },
    timeLimitSec: { type: Number, default: 30 },
    type: { type: String, default: "free_text" }
  }],
  answers: [{
    id: { type: String, required: true },
    answer: { type: String, default: "" },
    durationSec: { type: Number, default: 0 }
  }],
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
  riskScore: { type: Number, min: 0, max: 1, default: 0 },
  riskLevel: { type: String, enum: ["low", "moderate", "high"], default: "low" },
  explanation: { type: String, default: "" },
  suggestions: [{ type: String }],
  gameResults: [{ type: mongoose.Schema.Types.Mixed }], // Store game results for game-based assessments
}, { timestamps: true });

module.exports = mongoose.model("DementiaAssessment", dementiaAssessmentSchema);