const { GoogleGenerativeAI } = require("@google/generative-ai");
const Metrics = require("../models/metrics");
const Screening = require("../models/Screening");
const Todo = require("../models/todo");

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

exports.getChatbot = (req, res) => {
  const user = req.user;
  if (!user?._id) {
    console.error("[getChatbot] Unauthorized access attempt");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = user._id.toString();
  if (!userSessions[userId]) userSessions[userId] = { messages: [] };
  const session = userSessions[userId];

  if (!session.messages.length) {
    session.messages.push({
      sender: "bot",
      text: "Hello! I’m your therapist chatbot. How are you feeling today?",
      timestamp: new Date().toISOString()
    });
    console.log(`[getChatbot] Started session for user ${userId}`);
  }

  res.json({ messages: session.messages, sessionID: userId });
};

exports.postChatbot = async (req, res) => {
  const user = req.user;
  if (!user?._id) {
    console.error("[postChatbot] Unauthorized access attempt");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = user._id.toString();
  if (!userSessions[userId]) userSessions[userId] = { messages: [] };
  const session = userSessions[userId];

  const { message } = req.body;
  if (!message?.trim()) {
    console.warn(`[postChatbot] Empty message received from user ${userId}`);
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  session.messages.push({ sender: "user", text: message, timestamp: new Date().toISOString() });
  const history = session.messages.map(m => `${m.sender}: ${m.text}`).join("\n");
  console.log(`[postChatbot] Received message from user ${userId}: "${message}"`);

  let botResponse = "";
  let metricsData = {};
  let screeningData = {};
  let todosData = [];

  try {
    const chatbotPrompt = `You are a friendly therapist chatbot.
Conversation so far:
${history}
User just said: "${message}"
Respond empathetically and naturally.`;

    console.log(`[postChatbot] Generating chatbot response for user ${userId}`);
    botResponse = await safeGenerate(chatbotPrompt);
    session.messages.push({ sender: "bot", text: botResponse, timestamp: new Date().toISOString() });
    console.log(`[postChatbot] Bot response generated successfully for user ${userId}`);
  } catch (err) {
    botResponse = "Sorry, I couldn't process that message.";
    session.messages.push({ sender: "bot", text: botResponse });
    console.error(`[postChatbot] Bot response generation failed for user ${userId}: ${err.message || err}`);
  }

  try {
    const metricsPrompt = `Analyze the user's emotional state and screening results.
Respond ONLY in strict JSON with keys "metrics" and "screening".
Metrics (0-50): stress_level, happiness_level, anxiety_level, overall_mood_level
Screening: phq9_score (0-27), gad7_score (0-21), ghq_score (0-36), risk_level ("low","moderate","high")
User message: "${message}"`;

    console.log(`[postChatbot] Generating metrics and screening for user ${userId}`);
    const metricsResultText = await safeGenerate(metricsPrompt);
    const parsed = JSON.parse(cleanJsonString(metricsResultText));
    metricsData = parsed.metrics || {};
    screeningData = parsed.screening || {};

    await Metrics.create({
      userId: user._id,
      message,
      stress_level: Number(metricsData.stress_level) || 0,
      happiness_level: Number(metricsData.happiness_level) || 0,
      anxiety_level: Number(metricsData.anxiety_level) || 0,
      overall_mood_level: Number(metricsData.overall_mood_level) || 0,
      createdAt: new Date(),
    });

    await Screening.create({
      userId: user._id,
      message,
      phq9_score: Number(screeningData.phq9_score) || 0,
      gad7_score: Number(screeningData.gad7_score) || 0,
      ghq_score: Number(screeningData.ghq_score) || 0,
      risk_level: screeningData.risk_level || "low",
      createdAt: new Date(),
    });

    console.log(`[postChatbot] Metrics & Screening saved successfully for user ${userId}`);
  } catch (err) {
    metricsData = { stress_level: 0, happiness_level: 0, anxiety_level: 0, overall_mood_level: 0 };
    screeningData = { phq9_score: 0, gad7_score: 0, ghq_score: 0, risk_level: "low" };
    console.error(`[postChatbot] Metrics/Screening generation failed for user ${userId}: ${err.message || err}`);
  }

  try {
    const todoPrompt = `You are a wellness assistant. Based on conversation and metrics, suggest 5-10 actionable tasks.
Metrics: ${JSON.stringify(metricsData)}
Screening: ${JSON.stringify(screeningData)}
Respond ONLY in strict JSON: { "todos": [ { "title": "...", "completed": false }, ... ] }`;

    console.log(`[postChatbot] Generating todos for user ${userId}`);
    const todoResultText = await safeGenerate(todoPrompt);
    todosData = JSON.parse(cleanJsonString(todoResultText)).todos || [];

    await Todo.findOneAndUpdate(
      { userId: user._id },
      { tasks: todosData, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`[postChatbot] Todos generated and saved successfully for user ${userId}`);
  } catch (err) {
    todosData = [];
    console.error(`[postChatbot] Todo generation failed for user ${userId}: ${err.message || err}`);
  }

  res.json({
    messages: session.messages,
    botResponse,
    metrics: metricsData,
    screening: screeningData,
    todos: todosData,
    sessionID: userId,
  });
};
