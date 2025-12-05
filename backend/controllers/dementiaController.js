const { GoogleGenerativeAI } = require("@google/generative-ai");
const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");
const DementiaAssessment = require("../models/DementiaAssessment");
const User = require("../models/User");
const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/errorHandler");
const PDFDocument = require("pdfkit");

const apiKeys = process.env.GEMINI_API_KEYS?.split(",").map(k => k.trim()).filter(Boolean) || [];
if (!apiKeys.length) logger.warn("No GEMINI_API_KEYS configured");
const AVAILABLE_MODELS = ["gemini-2.5-flash", "gemini-2.5-pro"];
let currentModelIndex = 0;
let currentKeyIndex = 0;

function getNextGenAI() {
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = apiKeys.length ? (currentKeyIndex + 1) % apiKeys.length : 0;
  return new GoogleGenerativeAI(key);
}

async function safeGenerate(prompt) {
  let lastError;
  const timeout = 120000;
  for (let i = 0; i < apiKeys.length; i++) {
    const client = getNextGenAI();
    const modelName = AVAILABLE_MODELS[currentModelIndex];
    const apiKeyIndexUsed = currentKeyIndex === 0 ? apiKeys.length - 1 : currentKeyIndex - 1;
    currentModelIndex = (currentModelIndex + 1) % AVAILABLE_MODELS.length;
    try {
      const model = await client.getGenerativeModel({
        model: modelName,
        generationConfig: { maxOutputTokens: 2048, temperature: 0.5, topP: 0.9 }
      });
      const generatePromise = model.generateContent(prompt);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("API request timeout")), timeout));
      const result = await Promise.race([generatePromise, timeoutPromise]);
      const text = typeof result.response.text === "function" ? await result.response.text() : result.response.text;
      if (!text) throw new Error("Empty response");
      return text;
    } catch (err) {
      lastError = err;
      logger.error('[Dementia.safeGenerate] Failed', { error: err.message || String(err), model: modelName, apiKeyIndex: apiKeyIndexUsed });
    }
  }
  throw lastError;
}

function cleanJsonString(str) {
  if (!str) return "{}";
  try { return str.trim().replace(/^```json\s*/, "").replace(/```$/, "").trim(); } catch { return "{}"; }
}

function buildQuestionsPrompt(difficulty = 'easy') {
  const ranges = {
    easy: '40-60',
    moderate: '30-45',
    hard: '20-35'
  };
  const guidance = {
    easy: 'Use straightforward orientation and simple recall tasks, minimal multi-step operations.',
    moderate: 'Include two-step instructions, controlled attention tasks, and moderate working memory.',
    hard: 'Use multi-step instructions, abstract reasoning, complex working memory and sequencing.'
  };
  return `You are a cognitive assessment generator. Produce 5-6 questions for early dementia screening at "${difficulty}" difficulty.
Return STRICT JSON only in this shape:
{
  "questions": [
    {"id":"string","text":"string","category":"memory|attention|language|visuospatial|executive|orientation","timeLimitSec":30,"type":"free_text"}
  ]
}
Guidelines:
- Keep language simple and culturally neutral.
- Focus on memory recall, orientation, attention, language, and executive function.
- Difficulty: ${guidance[difficulty]}.
- Set "timeLimitSec" within ${ranges[difficulty]} seconds.
- Use only free_text responses.
- Do NOT include markdown, commentary, or extra fields.`;
}

exports.getQuestions = asyncHandler(async (req, res) => {
  const userId = req.user?._id?.toString();
  if (!userId) return res.status(401).json({ success: false, error: req.t("auth.unauthorized") });

  const DIFFICULTIES = ['easy','moderate','hard'];
  const difficultyParam = String(req.query?.difficulty || '').toLowerCase();
  const difficulty = DIFFICULTIES.includes(difficultyParam) ? difficultyParam : 'easy';

  let questions;
  try {
    const raw = await safeGenerate(buildQuestionsPrompt(difficulty));
    const parsed = JSON.parse(cleanJsonString(raw));
    questions = Array.isArray(parsed.questions) ? parsed.questions : [];
  } catch (err) {
    logger.warn("[Dementia.getQuestions] Falling back to static questions", { error: err.message });
    const fallback = {
      easy: [
        { id: "q1", text: "What day of the week is it today?", category: "orientation", timeLimitSec: 45, type: "free_text" },
        { id: "q2", text: "Repeat: 3, 7, 2.", category: "attention", timeLimitSec: 40, type: "free_text" },
        { id: "q3", text: "Name 5 fruits.", category: "language", timeLimitSec: 45, type: "free_text" },
        { id: "q4", text: "Recall: apple, table, blue.", category: "memory", timeLimitSec: 50, type: "free_text" },
        { id: "q5", text: "If you have Rs. 10 and spend Rs. 3, how much left?", category: "executive", timeLimitSec: 45, type: "free_text" }
      ],
      moderate: [
        { id: "q1", text: "What month is it currently?", category: "orientation", timeLimitSec: 40, type: "free_text" },
        { id: "q2", text: "Repeat: 9, 4, 1, 7.", category: "attention", timeLimitSec: 35, type: "free_text" },
        { id: "q3", text: "Name animals that live in water.", category: "language", timeLimitSec: 40, type: "free_text" },
        { id: "q4", text: "Recall after delay: book, flower, green.", category: "memory", timeLimitSec: 45, type: "free_text" },
        { id: "q5", text: "If you have Rs. 50, buy items costing Rs. 12 and Rs. 9, how much left?", category: "executive", timeLimitSec: 35, type: "free_text" }
      ],
      hard: [
        { id: "q1", text: "What is the date 3 days from now?", category: "orientation", timeLimitSec: 30, type: "free_text" },
        { id: "q2", text: "Repeat backwards: 8, 3, 6, 2.", category: "attention", timeLimitSec: 25, type: "free_text" },
        { id: "q3", text: "List animals grouped by habitat (forest, desert, ocean).", category: "language", timeLimitSec: 30, type: "free_text" },
        { id: "q4", text: "Recall with interference: mango, chair, red (after counting 1-20).", category: "memory", timeLimitSec: 35, type: "free_text" },
        { id: "q5", text: "You have Rs. 100. Buy 3 items: Rs. 12, Rs. 7, Rs. 25. How much left?", category: "executive", timeLimitSec: 25, type: "free_text" }
      ]
    };
    questions = fallback[difficulty];
  }

  const sessionId = uuidv4();
  await DementiaAssessment.create({ userId, sessionId, difficulty, questions, answers: [], status: "in_progress" });

  res.json({ 
    success: true, 
    data: {
      sessionId, 
      difficulty, 
      questions: questions.map(q => ({ id: q.id, text: q.text, category: q.category, timeLimitSec: q.timeLimitSec, type: q.type }))
    },
    timestamp: new Date().toISOString()
  });
});

const submitSchema = Joi.object({
  sessionId: Joi.string().uuid().required(),
  answers: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    answer: Joi.string().allow(""),
    durationSec: Joi.number().min(0).optional()
  })).required()
});

exports.submitAnswers = asyncHandler(async (req, res) => {
  const userId = req.user?._id?.toString();
  if (!userId) return res.status(401).json({ success: false, error: req.t("auth.unauthorized") });

  const { value, error } = submitSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: req.t("dementia.invalidPayload", "Invalid payload"), details: error.details });

  const { sessionId, answers } = value;
  const session = await DementiaAssessment.findOne({ userId, sessionId });
  if (!session) return res.status(404).json({ success: false, error: req.t("dementia.sessionNotFound", "Session not found") });

  const evalPrompt = `You are evaluating cognitive screening answers for early-stage dementia risk. Return STRICT JSON only:
{
  "riskScore": 0.0-1.0,
  "riskLevel": "low|moderate|high",
  "explanation": "string",
  "suggestions": ["string", "string"]
}
Consider memory recall, orientation, attention, language, and executive function.
 Difficulty level: ${session.difficulty || 'easy'}.
Patient answers: ${JSON.stringify(answers)}
`;

  let result = { riskScore: 0.3, riskLevel: "low", explanation: "Limited data; baseline healthy indicators.", suggestions: ["Consult a professional if symptoms persist", "Practice memory exercises daily"] };
  try {
    const raw = await safeGenerate(evalPrompt);
    const parsed = JSON.parse(cleanJsonString(raw));
    if (typeof parsed.riskScore === "number") result.riskScore = Math.min(1, Math.max(0, parsed.riskScore));
    if (["low","moderate","high"].includes(parsed.riskLevel)) result.riskLevel = parsed.riskLevel;
    if (parsed.explanation) result.explanation = String(parsed.explanation);
    if (Array.isArray(parsed.suggestions)) result.suggestions = parsed.suggestions.map(String).slice(0,5);
  } catch (err) {
    logger.error("[Dementia.submitAnswers] Evaluation failed, using fallback", { error: err.message });
  }

  session.answers = answers;
  session.status = "completed";
  session.riskScore = result.riskScore;
  session.riskLevel = result.riskLevel;
  session.explanation = result.explanation;
  session.suggestions = result.suggestions;
  await session.save();

  res.json({ 
    success: true, 
    data: {
      sessionId, 
      difficulty: session.difficulty,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      explanation: result.explanation,
      suggestions: result.suggestions
    },
    timestamp: new Date().toISOString()
  });
});

const gameResultsSchema = Joi.object({
  gameResults: Joi.array().items(Joi.object({
    key: Joi.string().required(),
    title: Joi.string().required(),
    score: Joi.number().min(0).required(),
    time: Joi.number().min(0).optional(),
    detail: Joi.object().optional()
  })).min(5).required()
});

exports.submitGameResults = asyncHandler(async (req, res) => {
  const userId = req.user?._id?.toString();
  if (!userId) {
    logger.warn("[Dementia.submitGameResults] Unauthorized request");
    return res.status(401).json({ success: false, error: req.t("auth.unauthorized") });
  }

  const { value, error } = gameResultsSchema.validate(req.body);
  if (error) {
    logger.warn("[Dementia.submitGameResults] Validation error", { error: error.details });
    return res.status(400).json({ success: false, error: req.t("dementia.invalidPayload", "Invalid payload"), details: error.details });
  }

  const { gameResults } = value;

  try {
    const totalScore = gameResults.reduce((sum, r) => sum + (r.score || 0), 0);
    const avgScore = totalScore / gameResults.length;
    const totalTime = gameResults.reduce((sum, r) => sum + (r.time || 0), 0);
    const avgTime = totalTime / gameResults.length;

    const gameAnalysis = gameResults.map(r => ({
      game: r.title,
      score: r.score,
      time: r.time || 0,
      performance: r.score > 0 ? "good" : "poor"
    }));

    const evalPrompt = `You are evaluating cognitive game performance for early-stage dementia risk assessment. Return STRICT JSON only:
{
  "riskScore": 0.0-1.0,
  "riskLevel": "low|moderate|high",
  "explanation": "string",
  "suggestions": ["string", "string"]
}
Analyze the following game results:
- Average Score: ${avgScore.toFixed(2)}
- Average Time: ${avgTime.toFixed(2)} seconds
- Total Games Played: ${gameResults.length}
- Game Performance Details: ${JSON.stringify(gameAnalysis)}

Consider:
1. Lower scores indicate potential cognitive decline
2. Longer completion times may suggest attention or processing speed issues
3. Consistent poor performance across multiple games is concerning
4. Game types: memory, reaction time, pattern recognition, attention, etc.

Return a risk assessment based on these cognitive game results.`;

    let result = { 
      riskScore: 0.3, 
      riskLevel: "low", 
      explanation: "Game results show baseline performance. Continue monitoring.", 
      suggestions: ["Continue playing cognitive games regularly", "Consult a professional if you notice declining performance"] 
    };

    try {
      if (apiKeys.length > 0) {
        const raw = await safeGenerate(evalPrompt);
        const parsed = JSON.parse(cleanJsonString(raw));
        if (typeof parsed.riskScore === "number") result.riskScore = Math.min(1, Math.max(0, parsed.riskScore));
        if (["low","moderate","high"].includes(parsed.riskLevel)) result.riskLevel = parsed.riskLevel;
        if (parsed.explanation) result.explanation = String(parsed.explanation);
        if (Array.isArray(parsed.suggestions)) result.suggestions = parsed.suggestions.map(String).slice(0,5);
        logger.info("[Dementia.submitGameResults] AI evaluation successful");
      } else {
        logger.warn("[Dementia.submitGameResults] No API keys configured, using fallback");
      }
    } catch (err) {
      logger.error("[Dementia.submitGameResults] Evaluation failed, using fallback", { error: err.message, stack: err.stack });
    }

    const {
      mapGamesToDomains,
      calculateWeightedRiskScore,
      normalizeGameScore,
      getDomainMappingInfo
    } = require("../utils/cognitiveDomainMapper");

    const calculateCognitiveMetrics = (gameResults) => {
      const metrics = {
        reactionTime: {},
        accuracy: {},
        workingMemorySpan: {},
        executiveFunction: {},
        visuospatialAbility: {},
        attentionFocus: {},
        processingSpeed: {},
        learningCurve: {},
        errorAnalytics: {}
      };

      const reactionTimeGame = gameResults.find(r => r.key === "reaction_time");
      const digitSpanGame = gameResults.find(r => r.key === "digit_span");
      const nBackGame = gameResults.find(r => r.key === "n_back");
      const patternRecallGame = gameResults.find(r => r.key === "pattern_recall");
      const stroopGame = gameResults.find(r => r.key === "stroop_test");
      const clockGame = gameResults.find(r => r.key === "clock_drawing");
      const memoryGame = gameResults.find(r => r.key === "memory");
      const allGames = gameResults;

      if (reactionTimeGame && reactionTimeGame.detail?.reactionTimes) {
        const reactionTimes = reactionTimeGame.detail.reactionTimes;
        if (reactionTimes.length > 0) {
          metrics.reactionTime.average = reactionTimeGame.detail.averageReactionTime || Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
          metrics.reactionTime.bestReactionTime = reactionTimeGame.detail.bestReactionTime || Math.min(...reactionTimes);
          
          const mean = metrics.reactionTime.average;
          const variance = reactionTimes.reduce((acc, rt) => acc + Math.pow(rt - mean, 2), 0) / reactionTimes.length;
          metrics.reactionTime.variability = Math.round(Math.sqrt(variance));
          
          const sorted = [...reactionTimes].sort((a, b) => b - a);
          const slowest10Count = Math.max(1, Math.ceil(reactionTimes.length * 0.1));
          metrics.reactionTime.slowest10Percent = Math.round(sorted.slice(0, slowest10Count).reduce((a, b) => a + b, 0) / slowest10Count);
          
          const mid = Math.floor(reactionTimes.length / 2);
          if (mid > 0) {
            const firstHalf = reactionTimes.slice(0, mid);
            const secondHalf = reactionTimes.slice(mid);
            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
            const diff = secondAvg - firstAvg;
            if (Math.abs(diff) < 50) metrics.reactionTime.trend = "stable";
            else metrics.reactionTime.trend = diff < 0 ? "improving" : "declining";
          }
        }
      }

      if (patternRecallGame && patternRecallGame.detail?.accuracy !== undefined) {
        metrics.accuracy.percentage = patternRecallGame.detail.accuracy;
      }
      
      const totalScore = allGames.reduce((sum, g) => sum + (g.score || 0), 0);
      const totalRounds = allGames.reduce((sum, g) => sum + (g.detail?.rounds || 1), 0);
      if (totalRounds > 0) {
        const avgScorePerRound = totalScore / totalRounds;
        metrics.accuracy.overallAccuracy = Math.min(100, Math.round((avgScorePerRound / 70) * 100));
      }

      if (allGames.length >= 2) {
        const firstGame = allGames[0];
        const lastGame = allGames[allGames.length - 1];
        const firstAvg = firstGame.detail?.averageScore || 0;
        const lastAvg = lastGame.detail?.averageScore || 0;
        metrics.accuracy.accuracyDecay = Math.round(firstAvg - lastAvg);
      }

      if (digitSpanGame) {
        metrics.workingMemorySpan.digitSpanScore = digitSpanGame.score || 0;
      }
      if (nBackGame) {
        metrics.workingMemorySpan.nBackScore = nBackGame.score || 0;
      }
      if (digitSpanGame || nBackGame) {
        const memoryScores = [digitSpanGame?.score, nBackGame?.score].filter(s => s !== undefined && s !== null);
        if (memoryScores.length > 0) {
          metrics.workingMemorySpan.averageMemoryScore = Math.round(memoryScores.reduce((a, b) => a + b, 0) / memoryScores.length);
        }
      }

      if (stroopGame) {
        metrics.executiveFunction.stroopScore = stroopGame.score || 0;
        metrics.executiveFunction.stroopTime = stroopGame.time || 0;
        metrics.executiveFunction.averageScore = stroopGame.detail?.averageScore || 0;
      }

      if (clockGame) {
        metrics.visuospatialAbility.clockScore = clockGame.score || 0;
        metrics.visuospatialAbility.clockTime = clockGame.time || 0;
        if (clockGame.detail) {
          metrics.visuospatialAbility.hasCircle = clockGame.detail.hasCircle || false;
          metrics.visuospatialAbility.hasNumbers = clockGame.detail.hasNumbers || false;
          metrics.visuospatialAbility.hasHands = clockGame.detail.hasHands || false;
        }
      }

      const gameTimes = allGames.map(g => g.time || 0).filter(t => t > 0);
      if (gameTimes.length > 0) {
        metrics.attentionFocus.averageTimeOnTask = Math.round(gameTimes.reduce((a, b) => a + b, 0) / gameTimes.length);
        metrics.attentionFocus.totalTimeOnTask = gameTimes.reduce((a, b) => a + b, 0);
        
        const mean = metrics.attentionFocus.averageTimeOnTask;
        const variance = gameTimes.reduce((acc, t) => acc + Math.pow(t - mean, 2), 0) / gameTimes.length;
        const stdDev = Math.sqrt(variance);
        metrics.attentionFocus.consistencyScore = Math.max(0, Math.min(100, Math.round(100 - (stdDev / mean * 100))));
      }

      if (gameTimes.length > 0) {
        metrics.processingSpeed.averageGameTime = metrics.attentionFocus.averageTimeOnTask;
        metrics.processingSpeed.fastestGameTime = Math.min(...gameTimes);
        metrics.processingSpeed.slowestGameTime = Math.max(...gameTimes);
        
        const mean = metrics.processingSpeed.averageGameTime;
        const variance = gameTimes.reduce((acc, t) => acc + Math.pow(t - mean, 2), 0) / gameTimes.length;
        metrics.processingSpeed.speedConsistency = Math.round(100 - Math.min(100, Math.sqrt(variance)));
      }

      if (allGames.length >= 2) {
        const firstGame = allGames[0];
        const lastGame = allGames[allGames.length - 1];
        metrics.learningCurve.firstGameScore = firstGame.score || 0;
        metrics.learningCurve.lastGameScore = lastGame.score || 0;
        metrics.learningCurve.improvementFromFirst = metrics.learningCurve.lastGameScore - metrics.learningCurve.firstGameScore;
        
        if (metrics.learningCurve.firstGameScore > 0) {
          metrics.learningCurve.improvementPercentage = Math.round((metrics.learningCurve.improvementFromFirst / metrics.learningCurve.firstGameScore) * 100);
        }
      }

      const gameScores = allGames.map(g => g.score || 0).filter(s => s >= 0);
      if (gameScores.length > 0) {
        metrics.errorAnalytics.lowestScore = Math.min(...gameScores);
        metrics.errorAnalytics.highestScore = Math.max(...gameScores);
        
        const perfectScorePerGame = 100;
        const totalPossible = gameScores.length * perfectScorePerGame;
        const totalActual = gameScores.reduce((a, b) => a + b, 0);
        metrics.errorAnalytics.totalErrors = Math.max(0, totalPossible - totalActual);
        
        if (totalPossible > 0) {
          metrics.errorAnalytics.averageErrorRate = Math.round(((totalPossible - totalActual) / totalPossible) * 100);
        }
      }

      return metrics;
    };

    const cognitiveMetrics = calculateCognitiveMetrics(gameResults);
    
    const domainScores = mapGamesToDomains(gameResults);
    const weightedRiskScore = calculateWeightedRiskScore(domainScores);
    
    cognitiveMetrics.cognitiveDomains = {
      memory: Math.round(domainScores.memory * 10) / 10,
      language: Math.round(domainScores.language * 10) / 10,
      attention: Math.round(domainScores.attention * 10) / 10,
      orientation: Math.round(domainScores.orientation * 10) / 10,
      executive: Math.round(domainScores.executive * 10) / 10,
      domainWeights: {
        memory: 0.30,
        language: 0.20,
        attention: 0.20,
        orientation: 0.15,
        executive: 0.15
      },
      weightedRiskScore: Math.round(weightedRiskScore * 100) / 100
    };
    
    if (weightedRiskScore > 0) {
      result.riskScore = weightedRiskScore;
      if (weightedRiskScore >= 0.7) result.riskLevel = "high";
      else if (weightedRiskScore >= 0.4) result.riskLevel = "moderate";
      else result.riskLevel = "low";
    }
    
    const sessionId = uuidv4();
    try {
      await DementiaAssessment.create({
        userId,
        sessionId,
        difficulty: "easy",
        questions: [],
        answers: [],
        status: "completed",
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        explanation: result.explanation,
        suggestions: result.suggestions,
        gameResults: gameResults,
        cognitiveMetrics: cognitiveMetrics
      });
      logger.info("[Dementia.submitGameResults] Assessment saved successfully", { sessionId, userId });
    } catch (dbError) {
      logger.error("[Dementia.submitGameResults] Database save failed", { error: dbError.message });
    }

    res.json({ 
      success: true, 
      data: {
        sessionId, 
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        explanation: result.explanation,
        suggestions: result.suggestions,
        gameResults: gameResults,
        averageScore: avgScore,
        averageTime: avgTime,
        cognitiveMetrics: cognitiveMetrics
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    logger.error("[Dementia.submitGameResults] Unexpected error", { error: err.message, stack: err.stack });
    return res.status(500).json({ 
      success: false, 
      error: req.t("dementia.failedToProcess", "Failed to process game results. Please try again.")
    });
  }
});

function generateDementiaPDF(assessmentData, user) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
        info: {
          Title: "Dementia Assessment Report",
          Author: "Maitri System",
          Subject: "Cognitive Assessment Report",
        },
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(22).text("Cognitive Impairment Assessment Report", {
        align: "center",
        underline: true,
      });
      doc.moveDown(1.5);

      doc.fontSize(14).text(`User: ${user?.name || "N/A"} (${user?.email || "N/A"})`);
      doc.text(`Generated On: ${new Date().toLocaleString()}`);
      doc.moveDown(1.5);

      doc.fontSize(16).text("Assessment Summary", { underline: true });
      doc.moveDown(0.5);

      const riskScorePercent = Math.round((assessmentData.riskScore || 0) * 100);
      const riskLevel = assessmentData.riskLevel || "low";

      doc.fontSize(12).text(`Risk Score: ${riskScorePercent}%`);
      doc.text(`Risk Level: ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}`);
      if (assessmentData.difficulty) {
        doc.text(`Difficulty Level: ${assessmentData.difficulty.charAt(0).toUpperCase() + assessmentData.difficulty.slice(1)}`);
      }
      doc.moveDown(0.5);
      
      if (assessmentData.cognitiveMetrics) {
        doc.fontSize(14).text("Cognitive Metrics", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        const cm = assessmentData.cognitiveMetrics;
        
        if (cm.reactionTime?.average) {
          doc.text(`📊 Reaction Time: ${cm.reactionTime.average}ms (Best: ${cm.reactionTime.bestReactionTime || 'N/A'}ms)`);
        }
        if (cm.accuracy?.percentage !== null && cm.accuracy?.percentage !== undefined) {
          doc.text(`🧭 Accuracy: ${cm.accuracy.percentage}%`);
        }
        if (cm.workingMemorySpan?.averageMemoryScore) {
          doc.text(`🔄 Working Memory Span: ${cm.workingMemorySpan.averageMemoryScore}`);
        }
        if (cm.executiveFunction?.stroopScore) {
          doc.text(`🧩 Executive Function: ${cm.executiveFunction.stroopScore} (Stroop Test)`);
        }
        if (cm.visuospatialAbility?.clockScore !== null && cm.visuospatialAbility?.clockScore !== undefined) {
          doc.text(`🧭 Visuospatial Accuracy: ${cm.visuospatialAbility.clockScore}%`);
        }
        if (cm.attentionFocus?.consistencyScore !== null && cm.attentionFocus?.consistencyScore !== undefined) {
          doc.text(`🧠 Attention Consistency: ${cm.attentionFocus.consistencyScore}%`);
        }
        if (cm.processingSpeed?.averageGameTime) {
          doc.text(`🛎️ Processing Speed: ${cm.processingSpeed.averageGameTime}s`);
        }
        if (cm.learningCurve?.improvementFromFirst !== null && cm.learningCurve?.improvementFromFirst !== undefined) {
          doc.text(`🔁 Learning Curve: ${cm.learningCurve.improvementFromFirst > 0 ? '+' : ''}${cm.learningCurve.improvementFromFirst}`);
        }
        if (cm.errorAnalytics?.averageErrorRate !== null && cm.errorAnalytics?.averageErrorRate !== undefined) {
          doc.text(`📉 Error Rate: ${cm.errorAnalytics.averageErrorRate}%`);
        }
        doc.moveDown(1);
      }

      if (assessmentData.explanation) {
        doc.fontSize(14).text("Risk Explanation", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).text(assessmentData.explanation, {
          align: "justify",
        });
        doc.moveDown(1);
      }

      if (Array.isArray(assessmentData.suggestions) && assessmentData.suggestions.length > 0) {
        doc.fontSize(14).text("Recommendations & Suggestions", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        assessmentData.suggestions.forEach((suggestion, idx) => {
          doc.text(`${idx + 1}. ${suggestion}`);
        });
        doc.moveDown(1);
      }

      if (assessmentData.gameResults && Array.isArray(assessmentData.gameResults) && assessmentData.gameResults.length > 0) {
        doc.fontSize(14).text("Game Performance Details", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        assessmentData.gameResults.forEach((game, idx) => {
          doc.text(`${idx + 1}. ${game.title || game.key || "Game"}: Score ${game.score || 0}, Time ${game.time || 0}s`);
        });
        doc.moveDown(1);
      }

      if (assessmentData.averageScore !== undefined) {
        doc.fontSize(12).text(`Average Score: ${assessmentData.averageScore.toFixed(2)}`);
      }
      if (assessmentData.averageTime !== undefined) {
        doc.fontSize(12).text(`Average Time: ${assessmentData.averageTime.toFixed(2)} seconds`);
      }

      doc.moveDown(2);
      doc.fontSize(10).fillColor("gray").text(
        "⚠️ AI-Generated Assessment Warning: This cognitive impairment assessment report is generated using AI technology. These results are for informational and self-assessment purposes only and should not be considered a clinical diagnosis. Please consult a licensed healthcare professional for any medical evaluation or concerns.",
        { align: "center" }
      );
      doc.moveDown(1);
      doc.fontSize(10).fillColor("gray").text(
        "This report is automatically generated by the Maitri Mental Health System.",
        { align: "center" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
