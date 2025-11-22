const { GoogleGenerativeAI } = require("@google/generative-ai");
const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");
const DementiaAssessment = require("../models/DementiaAssessment");
const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/errorHandler");

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

  res.json({ success: true, sessionId, difficulty, questions });
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
  if (error) return res.status(400).json({ success: false, error: "Invalid payload", details: error.details });

  const { sessionId, answers } = value;
  const session = await DementiaAssessment.findOne({ userId, sessionId });
  if (!session) return res.status(404).json({ success: false, error: "Session not found" });

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

  res.json({ success: true, sessionId, difficulty: session.difficulty, ...result });
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
    return res.status(400).json({ success: false, error: "Invalid payload", details: error.details });
  }

  const { gameResults } = value;

  try {
    // Calculate average score and time
    const totalScore = gameResults.reduce((sum, r) => sum + (r.score || 0), 0);
    const avgScore = totalScore / gameResults.length;
    const totalTime = gameResults.reduce((sum, r) => sum + (r.time || 0), 0);
    const avgTime = totalTime / gameResults.length;

    // Analyze game performance
    const gameAnalysis = gameResults.map(r => ({
      game: r.title,
      score: r.score,
      time: r.time || 0,
      performance: r.score > 0 ? "good" : "poor"
    }));

    // Build evaluation prompt
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

    // Store the assessment
    const sessionId = uuidv4();
    try {
      await DementiaAssessment.create({
        userId,
        sessionId,
        difficulty: "easy", // Default for game-based assessment
        questions: [],
        answers: [],
        status: "completed",
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        explanation: result.explanation,
        suggestions: result.suggestions,
        gameResults: gameResults // Store game results for reference
      });
      logger.info("[Dementia.submitGameResults] Assessment saved successfully", { sessionId, userId });
    } catch (dbError) {
      logger.error("[Dementia.submitGameResults] Database save failed", { error: dbError.message });
      // Continue even if save fails, return the result anyway
    }

    res.json({ 
      success: true, 
      sessionId, 
      ...result,
      gameResults: gameResults,
      averageScore: avgScore,
      averageTime: avgTime
    });
  } catch (err) {
    logger.error("[Dementia.submitGameResults] Unexpected error", { error: err.message, stack: err.stack });
    return res.status(500).json({ 
      success: false, 
      error: "Failed to process game results. Please try again." 
    });
  }
});