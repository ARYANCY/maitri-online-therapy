const { GoogleGenerativeAI } = require("@google/generative-ai");
const Metrics = require("../models/metrics");
const Screening = require("../models/Screening");
const Todo = require("../models/todo");
const User = require("../models/User");
const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/errorHandler");

const apiKeys = process.env.GEMINI_API_KEYS?.split(",").map(k => k.trim()) || [];
if (!apiKeys.length) console.error("[Init] No GEMINI_API_KEYS found in .env");

const AVAILABLE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro"
];
let currentModelIndex = 0;
let currentKeyIndex = 0;

function getNextGenAI() {
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  console.log(`[getNextGenAI] Using API key: ${key}`);
  return new GoogleGenerativeAI(key);
}

async function safeGenerate(prompt) {
  let lastError;
  for (let i = 0; i < apiKeys.length; i++) {
    const client = getNextGenAI();
    const modelName = AVAILABLE_MODELS[currentModelIndex];
    const apiKeyUsed = apiKeys[currentKeyIndex === 0 ? apiKeys.length - 1 : currentKeyIndex - 1];
    currentModelIndex = (currentModelIndex + 1) % AVAILABLE_MODELS.length;

    try {
      console.log(`[safeGenerate] Trying model "${modelName}" with API key: ${apiKeyUsed}`);
      const model = await client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = typeof result.response.text === "function"
        ? await result.response.text()
        : result.response.text;
      if (!text) throw new Error("Empty response");

      console.log(`[safeGenerate] Success! API Key: ${apiKeyUsed}, Model: ${modelName}`);
      return text;
    } catch (err) {
      lastError = err;
      console.error(`[safeGenerate] Failed with API Key: ${apiKeyUsed}, Model: ${modelName}, Reason: ${err.message || err}`);
    }
  }
  console.error("[safeGenerate] All API keys failed for this prompt");
  throw lastError;
}

let userSessions = {};

function cleanJsonString(str) {
  if (!str) return "{}";
  try {
    return str.trim().replace(/^```json\s*/, "").replace(/```$/, "").trim();
  } catch {
    return "{}";
  }
}

exports.getChatbot = asyncHandler((req, res) => {
  const user = req.user;
  if (!user?._id) {
    logger.warn('Unauthorized chatbot access attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id,
    });
    return res.status(401).json({ 
      success: false,
      error: req.t("auth.unauthorized") 
    });
  }

  const userId = user._id.toString();
  const userLanguage = req.getLanguage();
  
  if (!userSessions[userId]) {
    userSessions[userId] = { 
      messages: [],
      language: userLanguage,
      createdAt: new Date()
    };
  }
  
  const session = userSessions[userId];

  if (!session.messages.length) {
    session.messages.push({
      sender: "bot",
      text: req.t("chatbot.welcome"),
      timestamp: new Date().toISOString(),
      language: userLanguage
    });
    
    logger.info('Chatbot session started', {
      userId,
      language: userLanguage,
      ip: req.ip,
      requestId: req.id,
    });
  }

  res.json({ 
    success: true,
    messages: session.messages, 
    sessionID: userId,
    language: userLanguage,
    suggestions: {
      greeting: req.t("chatbot.suggestions.greeting"),
      stress: req.t("chatbot.suggestions.stress"),
      anxiety: req.t("chatbot.suggestions.anxiety"),
      sadness: req.t("chatbot.suggestions.sadness"),
      sleep: req.t("chatbot.suggestions.sleep"),
      relationships: req.t("chatbot.suggestions.relationships"),
      work: req.t("chatbot.suggestions.work"),
      general: req.t("chatbot.suggestions.general")
    }
  });
});

exports.postChatbot = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user?._id) {
    logger.warn('Unauthorized chatbot message attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id,
    });
    return res.status(401).json({ 
      success: false,
      error: req.t("auth.unauthorized") 
    });
  }

  const userId = user._id.toString();
  const userLanguage = req.getLanguage();
  
  if (!userSessions[userId]) {
    userSessions[userId] = { 
      messages: [],
      language: userLanguage,
      createdAt: new Date()
    };
  }
  
  const session = userSessions[userId];

  const { message } = req.body;
  if (!message?.trim()) {
    logger.warn('Empty chatbot message received', {
      userId,
      ip: req.ip,
      requestId: req.id,
    });
    return res.status(400).json({ 
      success: false,
      error: req.t("chatbot.emptyMessage") 
    });
  }

  // Add user message to session
  session.messages.push({ 
    sender: "user", 
    text: message, 
    timestamp: new Date().toISOString(),
    language: userLanguage
  });
  
  const history = session.messages.map(m => `${m.sender}: ${m.text}`).join("\n");
  
  logger.info('Chatbot message received', {
    userId,
    messageLength: message.length,
    language: userLanguage,
    ip: req.ip,
    requestId: req.id,
  });

  let botResponse = "";
  let metricsData = {};
  let screeningData = {};
  let todosData = [];

  // Generate chatbot response
  try {
// Use i18njs instance (assuming it's imported as `i18n`)
const i18n = req.i18n || require('i18njs'); // adjust import if needed

// Determine user language
let userLanguage =
  req.getLanguage?.() ||                     // use middleware-detected language
  req.headers["accept-language"]?.split(",")[0]?.split("-")[0] || // fallback to header
  "en";                                     // final fallback

// Only allow supported languages
const supportedLanguages = ["hi", "as", "en"];
if (!supportedLanguages.includes(userLanguage)) userLanguage = "en";

// Set language in i18n explicitly
i18n.setLocale(userLanguage);

// Map to language name using i18n labels (optional)
const LANGUAGE_MAP = {
  hi: i18n.t("language.hindi") || "Hindi",
  as: i18n.t("language.assamese") || "Assamese",
  en: i18n.t("language.english") || "English",
};

const languageName = LANGUAGE_MAP[userLanguage];

  const languageName = LANGUAGE_MAP[userLanguage];

    const chatbotPrompt = `You are a friendly, empathetic therapist chatbot. Respond in ${languageName}.
    
Context: You are helping with mental health support and emotional well-being.
User's language preference: ${languageName}.Talk in this language even if the user writes in another language.

Conversation so far:
${history}

User just said: "${message}"

Guidelines:
- Be empathetic, supportive, and non-judgmental
- Use appropriate therapeutic language
- Keep responses concise but meaningful
- Ask follow-up questions when appropriate
- Provide practical suggestions when helpful
- Always maintain a professional yet warm tone

Respond naturally and therapeutically in ${languageName}:`;

    logger.info('Generating chatbot response', {
      userId,
      language: userLanguage,
      requestId: req.id,
    });
    
    botResponse = await safeGenerate(chatbotPrompt);
    session.messages.push({ 
      sender: "bot", 
      text: botResponse, 
      timestamp: new Date().toISOString(),
      language: userLanguage
    });
    
    logger.info('Chatbot response generated successfully', {
      userId,
      responseLength: botResponse.length,
      language: userLanguage,
      requestId: req.id,
    });
  } catch (err) {
    botResponse = req.t("chatbot.error");
    session.messages.push({ 
      sender: "bot", 
      text: botResponse,
      timestamp: new Date().toISOString(),
      language: userLanguage
    });
    
    logger.error('Chatbot response generation failed', {
      userId,
      error: err.message,
      language: userLanguage,
      ip: req.ip,
      requestId: req.id,
    });
  }

  // Generate metrics and screening data
  try {
    const metricsPrompt = `Analyze the user's emotional state and mental health indicators from their message.
    
User message: "${message}"

Respond ONLY in strict JSON format with these exact keys:
{
  "metrics": {
    "stress_level": number (0-50),
    "happiness_level": number (0-50),
    "anxiety_level": number (0-50),
    "overall_mood_level": number (0-50)
  },
  "screening": {
    "phq9_score": number (0-27),
    "gad7_score": number (0-21),
    "ghq_score": number (0-36),
    "risk_level": string ("low", "moderate", "high")
  }
}

Guidelines:
- Use 0-50 scale for metrics (0 = very low, 50 = very high)
- Use standard clinical scales for screening scores
- Assess risk level based on overall indicators
- Be conservative in assessments`;

    logger.info('Generating metrics and screening data', {
      userId,
      language: userLanguage,
      requestId: req.id,
    });
    
    const metricsResultText = await safeGenerate(metricsPrompt);
    const parsed = JSON.parse(cleanJsonString(metricsResultText));
    metricsData = parsed.metrics || {};
    screeningData = parsed.screening || {};

    // Save metrics
    await Metrics.create({
      userId: user._id,
      message,
      stress_level: Math.max(0, Math.min(50, Number(metricsData.stress_level) || 0)),
      happiness_level: Math.max(0, Math.min(50, Number(metricsData.happiness_level) || 0)),
      anxiety_level: Math.max(0, Math.min(50, Number(metricsData.anxiety_level) || 0)),
      overall_mood_level: Math.max(0, Math.min(50, Number(metricsData.overall_mood_level) || 0)),
      createdAt: new Date(),
    });

    // Save screening data
    await Screening.create({
      userId: user._id,
      message,
      phq9_score: Math.max(0, Math.min(27, Number(screeningData.phq9_score) || 0)),
      gad7_score: Math.max(0, Math.min(21, Number(screeningData.gad7_score) || 0)),
      ghq_score: Math.max(0, Math.min(36, Number(screeningData.ghq_score) || 0)),
      risk_level: screeningData.risk_level || "low",
      createdAt: new Date(),
    });

    logger.info('Metrics and screening data saved successfully', {
      userId,
      metrics: metricsData,
      screening: screeningData,
      requestId: req.id,
    });
  } catch (err) {
    metricsData = { stress_level: 0, happiness_level: 0, anxiety_level: 0, overall_mood_level: 0 };
    screeningData = { phq9_score: 0, gad7_score: 0, ghq_score: 0, risk_level: "low" };
    
    logger.error('Metrics/Screening generation failed', {
      userId,
      error: err.message,
      language: userLanguage,
      ip: req.ip,
      requestId: req.id,
    });
  }

  // Generate todos
  try {
    const todoPrompt = `You are a wellness assistant. Based on the conversation and mental health metrics, suggest 5-10 actionable, personalized tasks.

User message: "${message}"
Metrics: ${JSON.stringify(metricsData)}
Screening: ${JSON.stringify(screeningData)}

Respond ONLY in strict JSON format:
{
  "todos": [
    {
      "title": "string (task description)",
      "completed": false,
      "priority": "low|medium|high",
      "category": "self-care|mindfulness|social|physical|professional"
    }
  ]
}

Guidelines:
- Make tasks specific and actionable
- Consider the user's emotional state
- Include a mix of immediate and longer-term tasks
- Prioritize self-care and mental health
- Keep task titles concise but clear
- Use appropriate priority levels`;

    logger.info('Generating personalized todos', {
      userId,
      language: userLanguage,
      requestId: req.id,
    });
    
    const todoResultText = await safeGenerate(todoPrompt);
    const todoResult = JSON.parse(cleanJsonString(todoResultText));
    todosData = todoResult.todos || [];

    // Save todos
    await Todo.findOneAndUpdate(
      { userId: user._id },
      { 
        tasks: todosData, 
        updatedAt: new Date(),
        language: userLanguage
      },
      { upsert: true, new: true }
    );

    logger.info('Todos generated and saved successfully', {
      userId,
      todoCount: todosData.length,
      language: userLanguage,
      requestId: req.id,
    });
  } catch (err) {
    todosData = [];
    
    logger.error('Todo generation failed', {
      userId,
      error: err.message,
      language: userLanguage,
      ip: req.ip,
      requestId: req.id,
    });
  }

  // Prepare response with translated labels
  const response = {
    success: true,
    messages: session.messages,
    botResponse,
    metrics: {
      ...metricsData,
      labels: {
        stressLevel: req.t("chatbot.metrics.stressLevel"),
        happinessLevel: req.t("chatbot.metrics.happinessLevel"),
        anxietyLevel: req.t("chatbot.metrics.anxietyLevel"),
        overallMood: req.t("chatbot.metrics.overallMood"),
        phq9Score: req.t("chatbot.metrics.phq9Score"),
        gad7Score: req.t("chatbot.metrics.gad7Score"),
        ghqScore: req.t("chatbot.metrics.ghqScore"),
        riskLevel: req.t("chatbot.metrics.riskLevel"),
        low: req.t("chatbot.metrics.low"),
        moderate: req.t("chatbot.metrics.moderate"),
        high: req.t("chatbot.metrics.high")
      }
    },
    screening: screeningData,
    todos: {
      data: todosData,
      message: todosData.length > 0 ? req.t("chatbot.todos.generated") : req.t("chatbot.todos.noTasks"),
      labels: {
        taskTitle: req.t("chatbot.todos.taskTitle"),
        completed: req.t("chatbot.todos.completed"),
        pending: req.t("chatbot.todos.pending")
      }
    },
    sessionID: userId,
    language: userLanguage
  };

  logger.info('Chatbot response completed', {
    userId,
    messageCount: session.messages.length,
    language: userLanguage,
    requestId: req.id,
  });

  res.json(response);
});
