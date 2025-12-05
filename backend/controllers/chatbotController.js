const { GoogleGenerativeAI } = require("@google/generative-ai");
const Metrics = require("../models/metrics");
const Screening = require("../models/Screening");
const Todo = require("../models/todo");
const User = require("../models/User");
const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/errorHandler");

const apiKeys = process.env.GEMINI_API_KEYS?.split(",").map(k => k.trim()).filter(Boolean) || [];
if (!apiKeys.length) logger.warn("No GEMINI_API_KEYS configured");

const AVAILABLE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro"
];
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
      logger.info('[safeGenerate] Trying model', { model: modelName, apiKeyIndex: apiKeyIndexUsed });
      const model = await client.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
          topP: 0.95,
        }
      });
      const generatePromise = model.generateContent(prompt);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("API request timeout")), timeout)
      );
      
      const result = await Promise.race([generatePromise, timeoutPromise]);
      const responseTextFn = result?.response?.text;
      const text = typeof responseTextFn === "function" ? await responseTextFn() : result?.response?.text;
      if (!text) throw new Error("Empty response");

      logger.info('[safeGenerate] Success', { model: modelName, apiKeyIndex: apiKeyIndexUsed });
      return text;
    } catch (err) {
      lastError = err;
      logger.error('[safeGenerate] Failed', { model: modelName, apiKeyIndex: apiKeyIndexUsed, error: err.message || String(err) });
    }
  }
  logger.error('[safeGenerate] All API keys failed');
  throw lastError;
}

let userSessions = {};

// Message batch settings for chart data calculation
const MIN_MESSAGES_FOR_CALCULATION = 5;
const MAX_MESSAGES_FOR_CALCULATION = 10;

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; 
let cleanupInitialized = false;
function initSessionCleanup() {
  if (cleanupInitialized) return;
  cleanupInitialized = true;
  setInterval(() => {
    const now = Date.now();
    try {
      Object.keys(userSessions).forEach((uid) => {
        const s = userSessions[uid];
        const created = s?.createdAt ? new Date(s.createdAt).getTime() : 0;
        const lastMsg = s?.messages?.length ? new Date(s.messages[s.messages.length - 1].timestamp).getTime() : created;
        const age = now - (lastMsg || created || now);
        if (age > SESSION_TTL_MS) delete userSessions[uid];
      });
    } catch (e) {
      logger.warn('Session cleanup error', { error: e.message });
    }
  }, 30 * 60 * 1000); 
}
initSessionCleanup();

function cleanJsonString(str) {
  if (!str) return "{}";
  try {
    return str.trim().replace(/^```json\s*/, "").replace(/```$/, "").trim();
  } catch {
    return "{}";
  }
}

exports.syncChatbot = asyncHandler((req, res) => {
  const user = req.user;
  if (!user?._id) {
    logger.warn('Unauthorized chatbot sync attempt', {
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
  
  if (!userSessions[userId]) {
    return res.json({ 
      success: true,
      messages: [],
      sessionID: userId
    });
  }
  res.json({ 
    success: true,
    messages: userSessions[userId].messages,
    sessionID: userId
  });
});

exports.getChatbot = asyncHandler((req, res) => {
  const user = req.user;
  if (!user?._id) return res.status(401).json({ success: false, error: req.t("auth.unauthorized") });

  const userId = user._id.toString();
  const userLanguage = req.getLanguage();

  if (!userSessions[userId]) {
    userSessions[userId] = {
      messages: [],
      language: userLanguage,
      createdAt: new Date(),
      messageCount: 0,
      pendingMessages: [],
    };
  }

  const session = userSessions[userId];
  
  // Ensure all properties exist for backward compatibility
  if (!session.messages) session.messages = [];
  if (typeof session.messageCount !== 'number') {
    session.messageCount = session.messages.filter(m => m.sender === "user").length;
  }
  if (!Array.isArray(session.pendingMessages)) {
    session.pendingMessages = [];
  }

  if (session.language !== userLanguage) {
    const oldLanguage = session.language;
    session.language = userLanguage;

    session.messages = session.messages.map((msg) => {
      if (msg.sender === "bot" && msg.type === "greeting") {
        return {
          ...msg,
          text: req.t("chatbot.welcomeAI", "Hello! I'm Vaidhya, your AI healthcare assistant. I'm here to help assess your mental health metrics, screening scores, and cognitive function. I'll ask you some questions to better understand your health. How are you feeling today?", { lng: userLanguage }),
          language: userLanguage,
        };
      }
      return msg;
    });

    logger.info('User language changed', { userId, oldLanguage, newLanguage: userLanguage, requestId: req.id });
  }

  if (!session.messages.length) {
  const welcomeText = req.t("chatbot.welcomeAI", "Hello! I'm your AI DOC (AI Doctor). I'm here to help assess your mental health metrics, screening scores, and cognitive function. I'll ask you some questions to better understand your health. How are you feeling today?");
  session.messages.push({
    sender: "bot",
    type: "greeting",
    text: welcomeText,
    timestamp: new Date().toISOString(),
    language: userLanguage
  });
}

session.messages = session.messages.map(msg => {
  if (msg.sender === "bot" && msg.type === "greeting") {
    const welcomeText = req.t("chatbot.welcomeAI", "Hello! I'm Vaidhya, your AI healthcare assistant. I'm here to help assess your mental health metrics, screening scores, and cognitive function. I'll ask you some questions to better understand your health. How are you feeling today?");
    return {
      ...msg,
      text: welcomeText,
      language: userLanguage
    };
  }
  return msg;
});

  res.json({
    success: true,
    messages: session.messages,
    sessionID: userId,
    language: userLanguage,
    suggestions: {
      greeting: req.t("chatbot.suggestions.greeting", { lng: userLanguage }),
      stress: req.t("chatbot.suggestions.stress", { lng: userLanguage }),
      anxiety: req.t("chatbot.suggestions.anxiety", { lng: userLanguage }),
      sadness: req.t("chatbot.suggestions.sadness", { lng: userLanguage }),
      sleep: req.t("chatbot.suggestions.sleep", { lng: userLanguage }),
      relationships: req.t("chatbot.suggestions.relationships", { lng: userLanguage }),
      work: req.t("chatbot.suggestions.work", { lng: userLanguage }),
      general: req.t("chatbot.suggestions.general", { lng: userLanguage })
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
      createdAt: new Date(),
      messageCount: 0,
      pendingMessages: [] // Store messages waiting for batch calculation
    };
  }
  
  const session = userSessions[userId];
  
  // Ensure backward compatibility: initialize new properties if they don't exist
  if (!session.messageCount) {
    session.messageCount = session.messages ? session.messages.filter(m => m.sender === "user").length : 0;
  }
  if (!session.pendingMessages) {
    session.pendingMessages = [];
  }
  if (!session.messages) {
    session.messages = [];
  }
  
  if (session.language !== userLanguage) {
    logger.info('User language changed during chat', {
      userId,
      oldLanguage: session.language,
      newLanguage: userLanguage,
      requestId: req.id,
    });
    session.language = userLanguage;
  }

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
  const MAX_INPUT_LEN = 2000;
  let safeMessage = message.trim();
  if (safeMessage.length > MAX_INPUT_LEN) {
    safeMessage = safeMessage.slice(0, MAX_INPUT_LEN);
  }
  // Check if this exact message was already added (prevent duplicates from retries)
  const lastMessage = session.messages[session.messages.length - 1];
  const isDuplicate = lastMessage && 
                      lastMessage.sender === "user" && 
                      lastMessage.text === safeMessage &&
                      new Date().getTime() - new Date(lastMessage.timestamp).getTime() < 5000; // Within 5 seconds
  
  if (!isDuplicate) {
    session.messages.push({ 
      sender: "user", 
      text: safeMessage, 
      timestamp: new Date().toISOString(),
      language: userLanguage
    });

    // Track message count and add to pending batch
    session.messageCount += 1;
    session.pendingMessages.push({
      sender: "user",
      text: safeMessage,
      timestamp: new Date().toISOString()
    });
  } else {
    logger.info('Duplicate message detected and skipped', { userId, message: safeMessage, requestId: req.id });
  }

  const history = session.messages.map(m => `${m.sender}: ${m.text}`).join("\n");
  
  // Determine if we should calculate chart data (every 5-10 messages)
  // Calculate when: message count is >= 5 AND (it's a multiple of 5 OR pending messages >= 10)
  const shouldCalculateMetrics = session.messageCount >= MIN_MESSAGES_FOR_CALCULATION && 
                                  (session.messageCount % MIN_MESSAGES_FOR_CALCULATION === 0 || 
                                   session.pendingMessages.length >= MAX_MESSAGES_FOR_CALCULATION);
  
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
  let cognitiveData = {}; // Initialize cognitiveData to prevent undefined errors
  let todosData = [];

  try {
    const LANGUAGE_MAP = { hi: 'Hindi', as: 'Assamese', en: 'English' };
    const normalizedLang = (session.language || 'en').toLowerCase().trim();
    const languageName = LANGUAGE_MAP[normalizedLang] || 'English';

    const chatbotPrompt = `You are Vaidhya - a professional, empathetic, and knowledgeable AI healthcare assistant. Respond in ${languageName}.
    
Your Role: You are Vaidhya who provides comprehensive health assessments including:
1. Mental Health Metrics (stress, happiness, anxiety, overall mood)
2. Mental Health Screening (PHQ-9, GAD-7, GHQ scores and risk levels)
3. Cognitive Impairment Assessment (based on MMSE, MoCA, ACE-III, Mini-Cog, SLUMS, RUDAS protocols)

User's language preference: ${languageName}

Conversation so far:
${history}

User just said: "${safeMessage}"

Assessment Protocol - You should INTERACTIVELY ASK QUESTIONS to gather data:

MENTAL HEALTH METRICS - Ask about:
- Stress levels and stress triggers
- Happiness and life satisfaction
- Anxiety symptoms and frequency
- Overall mood and emotional state

MENTAL HEALTH SCREENING - Ask PHQ-9, GAD-7, GHQ questions:
- Depression symptoms (PHQ-9): interest, mood, sleep, energy, appetite, concentration, self-worth, movement, suicidal thoughts
- Anxiety symptoms (GAD-7): worry, restlessness, fatigue, concentration, irritability, muscle tension, sleep
- General health (GHQ): psychological distress, social functioning, physical symptoms

COGNITIVE IMPAIRMENT ASSESSMENT - Ask questions based on validated tools:
- Orientation: "What day is it today?", "What month/year?", "Where are you?"
- Memory: "Repeat these words: apple, table, blue", "Recall the words I mentioned earlier"
- Attention: "Count backwards from 20", "Repeat: 3, 7, 2"
- Language: "Name 5 animals", "What is this object?" (if describing)
- Executive Function: "If you have Rs. 50 and buy items for Rs. 12 and Rs. 9, how much is left?"
- Visuospatial: "Draw a clock showing 3 o'clock"

Knowledge Base - Cognitive Impairment Assessment Tools:
1. MMSE (Mini-Mental State Examination) - 30-point questionnaire assessing orientation, memory, attention, calculation, language, visual-spatial skills
2. MoCA (Montreal Cognitive Assessment) - Detects mild cognitive impairment, evaluating attention, concentration, executive functions, memory, language, visuoconstructional skills
3. ACE-III (Addenbrooke's Cognitive Examination-III) - Comprehensive assessment evaluating attention, memory, fluency, language, visuospatial abilities
4. Mini-Cog - Brief screening combining three-item recall with clock drawing test
5. SLUMS (Saint Louis University Mental Status Examination) - Screening for mild cognitive impairment and dementia
6. RUDAS (Rowland Universal Dementia Assessment Scale) - Culturally fair cognitive screening

IMPORTANT GUIDELINES:
- Be proactive: Ask 1-2 relevant assessment questions per response to gather comprehensive data
- Be conversational: Don't make it feel like a formal test - weave questions naturally into conversation
- Be empathetic: Show understanding and support while asking questions
- Track progress: Remember what you've asked and what the user has answered
- Be thorough: Cover all assessment areas (metrics, screening, cognitive) over the conversation
- Never diagnose: Always emphasize these are screening tools and professional consultation is important
- Be professional yet warm: Maintain a doctor-like but friendly demeanor
- Use appropriate medical terminology but explain when needed
- Ask follow-up questions based on user responses
- Provide reassurance and guidance when appropriate

Your Response Strategy:
1. Acknowledge the user's message empathetically
2. Ask 1-2 relevant assessment questions (mix of metrics, screening, or cognitive)
3. Provide helpful information or suggestions
4. Continue the conversation naturally

Respond as Vaidhya in ${languageName}, asking assessment questions naturally:`;

    logger.info('Generating chatbot response', { userId, language: userLanguage, requestId: req.id });
    
    botResponse = await safeGenerate(chatbotPrompt);
    session.messages.push({ 
      sender: "bot", 
      text: botResponse, 
      timestamp: new Date().toISOString(),
      language: userLanguage
    });
    
    logger.info('Chatbot response generated successfully', { userId, responseLength: botResponse.length, language: userLanguage, requestId: req.id });
  } catch (err) {
    botResponse = req.t("chatbot.error");
    session.messages.push({ sender: "bot", text: botResponse, timestamp: new Date().toISOString(), language: userLanguage });
    logger.error('Chatbot response generation failed', { userId, error: err.message, language: userLanguage, ip: req.ip, requestId: req.id });
  }
  // Only calculate metrics if we've reached the batch threshold
  if (shouldCalculateMetrics) {
    // Get all messages from the current batch for analysis
    const batchHistory = session.pendingMessages.map(m => `${m.sender}: ${m.text}`).join("\n");
    const batchMessageCount = session.pendingMessages.length;
    
    logger.info('Calculating metrics for message batch', { 
      userId, 
      messageCount: session.messageCount,
      batchSize: batchMessageCount,
      requestId: req.id 
    });

  try {
    const metricsPrompt = `You are Vaidhya analyzing user responses for comprehensive health assessment using feature-based NLP analysis.

IMPORTANT CLINICAL DISCLAIMERS:
- Emotional metrics (stress, anxiety, happiness) are AI-estimated using psycholinguistic markers, NOT clinically validated diagnostic tools.
- PHQ-9, GAD-7, and GHQ scores are AI-ESTIMATED PROXY INDICATORS based on conversation patterns, NOT actual questionnaire responses.
- For verified PHQ-9/GAD-7/GHQ results, users must complete the standardized questionnaires.
- Cognitive scores are estimated from conversation linguistic features, not formal neuropsychological testing.

ANALYSIS METHODOLOGY:
You are using feature-based NLP analysis including:
1. Psycholinguistic markers (LIWC features):
   - First-person usage frequency
   - Negative emotion word density
   - Cognitive processing word frequency
   - Disfluency markers ("um", "uh", "I don't know")
   - Repetition patterns
   - Hesitation indicators

2. Transformer-based embeddings:
   - Sentence-BERT / DistilBERT finetuned on mental-health datasets
   - Semantic similarity to clinical symptom descriptions

3. Cognitive assessment linguistic features:
   - Memory markers: Repetition of earlier points, forgetting discussed details
   - Orientation markers: Confusion about events/time/day, difficulty with factual questions
   - Attention markers: Off-topic responses, delayed/incomplete answers
   - Language markers: Word-finding difficulty, reduced vocabulary richness
   - Executive function markers: Trouble following multi-step instructions, logical inconsistency

You are analyzing a BATCH of ${batchMessageCount} recent messages from the conversation. Consider ALL messages in this batch together to provide a comprehensive assessment.

Batch of messages to analyze:
${batchHistory}

Full conversation context (for reference):
${history}

Extract and analyze data for THREE assessment types:

1. MENTAL HEALTH METRICS - Emotional state indicators:
   - stress_level: 0-50 (based on stress mentions, triggers, physical symptoms)
   - happiness_level: 0-50 (based on positive emotions, satisfaction, joy)
   - anxiety_level: 0-50 (based on worry, nervousness, panic, restlessness)
   - overall_mood_level: 0-50 (general emotional state, can be average of above or independent)

2. MENTAL HEALTH SCREENING - Standardized screening scores:
   - phq9_score: 0-27 (depression screening - look for: interest loss, mood, sleep, energy, appetite, concentration, self-worth, movement, suicidal thoughts)
   - gad7_score: 0-21 (anxiety screening - look for: excessive worry, restlessness, fatigue, concentration issues, irritability, muscle tension, sleep problems)
   - ghq_score: 0-36 (general health questionnaire - psychological distress, social functioning, physical symptoms)
   - risk_level: "low", "moderate", or "high" (based on combined screening scores)

3. COGNITIVE IMPAIRMENT ASSESSMENT - Cognitive function indicators:
   - orientation_score: 0-10 (temporal/spatial orientation - date, time, location questions)
   - memory_score: 0-10 (immediate and delayed recall - word lists, story recall)
   - attention_score: 0-10 (attention span, concentration - digit span, counting)
   - language_score: 0-10 (language abilities - naming, fluency, comprehension)
   - executive_score: 0-10 (executive function - problem solving, calculations, planning)
   - cognitive_risk_level: "low", "moderate", or "high" (based on cognitive scores)

Respond ONLY in strict JSON format with exact keys:
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
  },
  "cognitive": {
    "orientation_score": number (0-10),
    "memory_score": number (0-10),
    "attention_score": number (0-10),
    "language_score": number (0-10),
    "executive_score": number (0-10),
    "cognitive_risk_level": string ("low", "moderate", "high")
  }
}

Analyze the ENTIRE conversation history, not just the latest message. Look for patterns, repeated mentions, and cumulative information.`;

    logger.info('Generating metrics and screening data', { userId, language: userLanguage, requestId: req.id });
    
    const metricsResultText = await safeGenerate(metricsPrompt);
    let parsed = {};
    try {
      parsed = JSON.parse(cleanJsonString(metricsResultText));
    } catch (parseErr) {
      logger.warn('Metrics JSON parse failed, using defaults', { error: parseErr.message });
      parsed = {};
    }
    metricsData = parsed.metrics || {};
    screeningData = parsed.screening || {};
    cognitiveData = parsed.cognitive || {}; // Update outer scope variable

    // Save Metrics - use batch summary message
    const batchSummary = `Batch of ${batchMessageCount} messages analyzed together`;
    await Metrics.create({
      userId: user._id,
      message: batchSummary,
      stress_level: Math.max(0, Math.min(50, Number(metricsData.stress_level) || 0)),
      happiness_level: Math.max(0, Math.min(50, Number(metricsData.happiness_level) || 0)),
      anxiety_level: Math.max(0, Math.min(50, Number(metricsData.anxiety_level) || 0)),
      overall_mood_level: Math.max(0, Math.min(50, Number(metricsData.overall_mood_level) || 0)),
      createdAt: new Date(),
    });

    // Save Screening - use batch summary message
    await Screening.create({
      userId: user._id,
      message: batchSummary,
      phq9_score: Math.max(0, Math.min(27, Number(screeningData.phq9_score) || 0)),
      gad7_score: Math.max(0, Math.min(21, Number(screeningData.gad7_score) || 0)),
      ghq_score: Math.max(0, Math.min(36, Number(screeningData.ghq_score) || 0)),
      risk_level: screeningData.risk_level || "low",
      createdAt: new Date(),
    });

    logger.info('Metrics, screening, and cognitive data saved successfully', { userId, metrics: metricsData, screening: screeningData, cognitive: cognitiveData, requestId: req.id });
    
    // Clear pending messages after successful calculation
    session.pendingMessages = [];
  } catch (err) {
    metricsData = { stress_level: 0, happiness_level: 0, anxiety_level: 0, overall_mood_level: 0 };
    screeningData = { phq9_score: 0, gad7_score: 0, ghq_score: 0, risk_level: "low" };
    logger.error('Metrics/Screening/Cognitive generation failed', { userId, error: err.message, language: userLanguage, ip: req.ip, requestId: req.id });
  }
  } else {
    // Skip metrics calculation - not enough messages yet
    metricsData = {};
    screeningData = {};
    cognitiveData = {};
    logger.info('Skipping metrics calculation - waiting for more messages', { 
      userId, 
      messageCount: session.messageCount,
      pendingMessages: session.pendingMessages.length,
      requestId: req.id 
    });
  }

  try {
    const todoPrompt = `You are a wellness assistant. Respond in English.
Based on the conversation and mental health metrics, suggest 5-10 actionable, personalized tasks.

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
- Use appropriate priority levels
- Respond in ${userLanguage}`;

    logger.info('Generating personalized todos', { userId, language: userLanguage, requestId: req.id });
    
    let todoResultText = "";
    try {
      todoResultText = await safeGenerate(todoPrompt);
      const todoResult = JSON.parse(cleanJsonString(todoResultText));
      todosData = Array.isArray(todoResult.todos) ? todoResult.todos : [];
    } catch (aiErr) {
      logger.warn('Todo AI generation failed, using fallback', { userId, error: aiErr.message, requestId: req.id });

      todosData = [
        { title: req.t("chatbot.todos.fallback1"), completed: false, priority: "medium", category: "self-care" },
        { title: req.t("chatbot.todos.fallback2"), completed: false, priority: "medium", category: "mindfulness" }
      ];
    }

    try {
      // Clean and validate tasks data to match schema
      const cleanedTasks = todosData.map(task => {
        const cleaned = {
          title: String(task.title || ''),
          completed: Boolean(task.completed || false),
          priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium',
          category: ['self-care', 'mindfulness', 'social', 'physical', 'professional'].includes(task.category)
            ? task.category
            : 'self-care',
        };
        
        // Add optional fields if they exist and are valid
        if (task._id) cleaned._id = String(task._id);
        if (task.dueDate) cleaned.dueDate = new Date(task.dueDate);
        if (task.createdAt) cleaned.createdAt = new Date(task.createdAt);
        if (task.updatedAt) cleaned.updatedAt = new Date(task.updatedAt);
        if (task.chatMessage) cleaned.chatMessage = String(task.chatMessage);
        if (task.chatTimestamp) cleaned.chatTimestamp = new Date(task.chatTimestamp);
        
        return cleaned;
      });

      await Todo.findOneAndUpdate(
        { userId: user._id },
        { tasks: cleanedTasks, updatedAt: new Date(), language: userLanguage },
        { upsert: true, new: true }
      );
      logger.info('Todos saved successfully', { userId, todoCount: cleanedTasks.length, requestId: req.id });
    } catch (dbErr) {
      logger.error('Saving todos to DB failed', { userId, error: dbErr.message, stack: dbErr.stack, requestId: req.id });
    }

  } catch (err) {
    todosData = [];
    logger.error('Todo generation failed', { userId, error: err.message, requestId: req.id });
  }

  const response = {
    success: true,
    messages: session.messages,
    botResponse,
    metrics: {
      ...metricsData,
      disclaimer: "Emotional metrics are AI-estimated using psycholinguistic markers (LIWC features, transformer embeddings) and are NOT clinically validated diagnostic tools.",
      analysisMethod: "Feature-based NLP analysis using Sentence-BERT/DistilBERT embeddings and psycholinguistic markers",
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
    screening: {
      ...screeningData,
      disclaimer: "PHQ-9, GAD-7, and GHQ scores are AI-ESTIMATED PROXY INDICATORS based on conversation patterns, NOT actual questionnaire responses. For verified results, users must complete the standardized questionnaires.",
      isProxy: true,
      clinicalNote: "These scores predict likelihood using conversation patterns. For clinical diagnosis, complete the official PHQ-9/GAD-7/GHQ questionnaires."
    },
    cognitive: cognitiveData ? {
      ...cognitiveData,
      disclaimer: "Cognitive scores are estimated from conversation linguistic features (memory markers, orientation markers, attention markers, language markers, executive function markers), not formal neuropsychological testing.",
      analysisMethod: "Linguistic feature analysis: Memory (repetition, forgetting), Orientation (confusion about time/events), Attention (off-topic, delayed responses), Language (word-finding difficulty), Executive (multi-step instructions, logical consistency)",
      linguisticFeatures: {
        memoryMarkers: "Repetition of earlier points, forgetting previously discussed details",
        orientationMarkers: "Confusion about events/time/day, difficulty answering direct factual questions",
        attentionMarkers: "Off-topic responses, delayed or incomplete answers",
        languageMarkers: "Word-finding difficulty, reduced vocabulary richness",
        executiveMarkers: "Trouble following multi-step instructions, logical inconsistency in conversation"
      },
      labels: {
        orientationScore: req.t("chatbot.cognitive.orientationScore"),
        memoryScore: req.t("chatbot.cognitive.memoryScore"),
        attentionScore: req.t("chatbot.cognitive.attentionScore"),
        languageScore: req.t("chatbot.cognitive.languageScore"),
        executiveScore: req.t("chatbot.cognitive.executiveScore"),
        cognitiveRiskLevel: req.t("chatbot.cognitive.cognitiveRiskLevel"),
        viewInChart: req.t("chatbot.cognitive.viewInChart")
      }
    } : null,
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

  logger.info('Chatbot response completed', { userId, messageCount: session.messages.length, language: userLanguage, requestId: req.id });

  res.json(response);
});
