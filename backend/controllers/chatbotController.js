const { GoogleGenerativeAI } = require("@google/generative-ai");
const Metrics = require("../models/metrics");
const Screening = require("../models/Screening");
const Todo = require("../models/todo");

const apiKeys = process.env.GEMINI_API_KEYS?.split(",").map(k => k.trim()) || [];
if (!apiKeys.length) console.error("No GEMINI_API_KEYS found in .env");

let currentKeyIndex = 0;
function getNextGenAI() {
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return new GoogleGenerativeAI(key);
}

async function safeGenerate(prompt) {
  let lastError;
  for (let i = 0; i < apiKeys.length; i++) {
    const client = getNextGenAI();
    try {
      const model = await client.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = typeof result.response.text === "function"
        ? await result.response.text()
        : result.response.text;
      if (!text) throw new Error("Empty response from Gemini");
      return text;
    } catch (err) {
      console.error(`API key attempt ${i + 1} failed:`, err.message);
      lastError = err;
    }
  }
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

// GET Chatbot Session
exports.getChatbot = (req, res) => {
  try {
    const user = req.user;
    if (!user?._id) return res.status(401).json({ error: "Unauthorized" });

    const userId = user._id.toString();
    if (!userSessions[userId]) userSessions[userId] = { messages: [] };
    const session = userSessions[userId];

    if (!session.messages.length) {
      session.messages.push({
        sender: "bot",
        text: "Hello! I’m your therapist chatbot. How are you feeling today?",
        timestamp: new Date().toISOString()
      });
    }

    res.json({ messages: session.messages, sessionID: userId });
  } catch (err) {
    console.error("Error getting chatbot session:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

// POST Chatbot Message
exports.postChatbot = async (req, res) => {
  try {
    const user = req.user;
    if (!user?._id) return res.status(401).json({ error: "Unauthorized" });
    const userId = user._id.toString();

    if (!userSessions[userId]) userSessions[userId] = { messages: [] };
    const session = userSessions[userId];

    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message cannot be empty" });

    const timestamp = new Date().toISOString();
    session.messages.push({ sender: "user", text: message, timestamp });
    const history = session.messages.map(m => `${m.sender}: ${m.text}`).join("\n");

    let botResponse = "";
    let metricsData = {};
    let screeningData = {};
    let todosData = [];

    // 1️⃣ Chatbot Response
    try {
      const chatbotPrompt = `You are a friendly therapist chatbot.
Conversation so far:
${history}
User just said: "${message}"
Respond empathetically and naturally.`;

      botResponse = await safeGenerate(chatbotPrompt);
      session.messages.push({ sender: "bot", text: botResponse, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error("Chatbot generation error:", err);
      botResponse = "Sorry, I couldn't process that message.";
      session.messages.push({ sender: "bot", text: botResponse, timestamp });
    }

    // 2️⃣ Metrics + Screening
    try {
      const metricsPrompt = `Analyze the user's emotional state and screening results.
Respond ONLY in strict JSON format with keys "metrics" and "screening".
Metrics (0-50): stress_level, happiness_level, anxiety_level, focus_level, energy_level,
confidence_level, motivation_level, calmness_level, sadness_level, loneliness_level,
gratitude_level, overall_mood_level
Screening: phq9_score (0-27), gad7_score (0-21), ghq_score (0-36), risk_level ("low","moderate","high")
User message: "${message}"`;

      const metricsResultText = await safeGenerate(metricsPrompt);
      const parsed = JSON.parse(cleanJsonString(metricsResultText));

      // Ensure all emotional metrics are numbers
      const EMOTIONAL_KEYS = [
        "stress_level", "happiness_level", "anxiety_level", "focus_level", "energy_level",
        "confidence_level", "motivation_level", "calmness_level", "sadness_level",
        "loneliness_level", "gratitude_level", "overall_mood_level"
      ];
      metricsData = {};
      EMOTIONAL_KEYS.forEach(key => {
        metricsData[key] = Number(parsed.metrics?.[key]) || 0;
      });

      // Screening metrics
      screeningData = {
        phq9_score: Number(parsed.screening?.phq9_score) || 0,
        gad7_score: Number(parsed.screening?.gad7_score) || 0,
        ghq_score: Number(parsed.screening?.ghq_score) || 0,
        risk_level: parsed.screening?.risk_level || "low",
      };

      // Save Metrics
      await Metrics.create({
        userId: user._id,
        message,
        ...metricsData,
        createdAt: new Date(),
      });

      // Save Screening
      await Screening.create({
        userId: user._id,
        message,
        ...screeningData,
        createdAt: new Date(),
      });

    } catch (err) {
      console.error("Metrics/Screening error:", err);
      // Default fallback
      metricsData = EMOTIONAL_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
      screeningData = { phq9_score: 0, gad7_score: 0, ghq_score: 0, risk_level: "low" };
    }

    // 3️⃣ Todo Suggestions
    try {
      const todoPrompt = `You are a wellness assistant. Based on the conversation and metrics, suggest 5 actionable tasks.
Metrics: ${JSON.stringify(metricsData)}
Screening: ${JSON.stringify(screeningData)}
Respond ONLY in strict JSON: { "todos": [ { "title": "...", "completed": false }, ... ] }`;

      const todoResultText = await safeGenerate(todoPrompt);
      todosData = JSON.parse(cleanJsonString(todoResultText)).todos || [];

      await Todo.findOneAndUpdate(
        { userId: user._id },
        { tasks: todosData, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error("Todos generation error:", err);
      todosData = [];
    }

    res.json({
      messages: session.messages,
      botResponse,
      metrics: metricsData,
      screening: screeningData,
      todos: todosData,
      sessionID: userId,
    });

  } catch (err) {
    console.error("Unexpected error in postChatbot:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};
