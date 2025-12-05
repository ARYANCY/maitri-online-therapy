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
  cognitiveMetrics: {
    // 1. Reaction Time (RT) - from reaction_time game
    reactionTime: {
      average: { type: Number, default: null }, // Average reaction time in ms
      variability: { type: Number, default: null }, // Standard deviation of reaction times
      slowest10Percent: { type: Number, default: null }, // Slowest 10% reaction time
      bestReactionTime: { type: Number, default: null }, // Best reaction time
      trend: { type: String, enum: ["improving", "stable", "declining"], default: null }
    },
    // 2. Accuracy - from pattern_recall and overall game scores
    accuracy: {
      percentage: { type: Number, min: 0, max: 100, default: null }, // % correct from pattern_recall
      overallAccuracy: { type: Number, min: 0, max: 100, default: null }, // Overall accuracy across all games
      accuracyDecay: { type: Number, default: null } // Decay over session duration
    },
    // 3. Working Memory Span - from digit_span and n_back games
    workingMemorySpan: {
      digitSpanScore: { type: Number, default: null }, // From digit_span game
      nBackScore: { type: Number, default: null }, // From n_back game
      averageMemoryScore: { type: Number, default: null } // Average of memory games
    },
    // 4. Executive Function - from stroop_test game
    executiveFunction: {
      stroopScore: { type: Number, default: null }, // Score from stroop test
      stroopTime: { type: Number, default: null }, // Time taken for stroop test
      averageScore: { type: Number, default: null } // Average score
    },
    // 5. Visuospatial Ability - from clock_drawing game
    visuospatialAbility: {
      clockScore: { type: Number, min: 0, max: 100, default: null }, // Score from clock drawing
      clockTime: { type: Number, default: null }, // Time to complete clock
      hasCircle: { type: Boolean, default: null },
      hasNumbers: { type: Boolean, default: null },
      hasHands: { type: Boolean, default: null }
    },
    // 6. Attention & Focus - from all games (time on task)
    attentionFocus: {
      averageTimeOnTask: { type: Number, default: null }, // Average time across all games
      totalTimeOnTask: { type: Number, default: null }, // Total time spent
      consistencyScore: { type: Number, min: 0, max: 100, default: null } // Based on time variance
    },
    // 7. Processing Speed - from all games
    processingSpeed: {
      averageGameTime: { type: Number, default: null }, // Average time per game
      fastestGameTime: { type: Number, default: null }, // Fastest game completion
      slowestGameTime: { type: Number, default: null }, // Slowest game completion
      speedConsistency: { type: Number, default: null } // Consistency of speed
    },
    // 8. Learning Curve - comparing first vs last games
    learningCurve: {
      improvementFromFirst: { type: Number, default: null }, // Score improvement from first to last game
      firstGameScore: { type: Number, default: null },
      lastGameScore: { type: Number, default: null },
      improvementPercentage: { type: Number, default: null } // % improvement
    },
    // 9. Error Analytics - from game scores
    errorAnalytics: {
      totalErrors: { type: Number, default: null }, // Calculated from scores
      averageErrorRate: { type: Number, min: 0, max: 100, default: null }, // Average error rate %
      lowestScore: { type: Number, default: null }, // Lowest game score
      highestScore: { type: Number, default: null } // Highest game score
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("DementiaAssessment", dementiaAssessmentSchema);