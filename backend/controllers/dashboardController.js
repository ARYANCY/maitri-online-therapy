const Metrics = require("../models/metrics");
const Screening = require("../models/Screening");
const Todo = require("../models/todo");
const User = require("../models/User");
const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/errorHandler");
const { v4: uuidv4 } = require("uuid");

exports.getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.session?.userId;
  if (!userId) return res.status(401).json({ success: false, error: req.t("auth.unauthorized") });

  const type = req.query.type || "entries";
  const userLanguage = req.getLanguage();

  let metricsRecords = [];
  let screeningRecords = [];

  try {
    // Metrics and Screening retrieval (unchanged)
    if (type === "daily") {
      metricsRecords = await Metrics.aggregate([
        { $match: { userId } },
        { $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
            stress_level: { $avg: "$stress_level" },
            happiness_level: { $avg: "$happiness_level" },
            anxiety_level: { $avg: "$anxiety_level" },
            overall_mood_level: { $avg: "$overall_mood_level" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
        { $limit: 7 },
      ]);

      metricsRecords = metricsRecords.reverse().map(r => ({
        createdAt: new Date(r._id.year, r._id.month - 1, r._id.day),
        stress_level: Math.round(r.stress_level * 100) / 100,
        happiness_level: Math.round(r.happiness_level * 100) / 100,
        anxiety_level: Math.round(r.anxiety_level * 100) / 100,
        overall_mood_level: Math.round(r.overall_mood_level * 100) / 100,
        count: r.count
      }));

      screeningRecords = await Screening.aggregate([
        { $match: { userId } },
        { $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
            phq9_score: { $avg: "$phq9_score" },
            gad7_score: { $avg: "$gad7_score" },
            ghq_score: { $avg: "$ghq_score" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
        { $limit: 7 },
      ]);

      screeningRecords = screeningRecords.reverse().map(r => ({
        createdAt: new Date(r._id.year, r._id.month - 1, r._id.day),
        phq9_score: Math.round(r.phq9_score * 100) / 100,
        gad7_score: Math.round(r.gad7_score * 100) / 100,
        ghq_score: Math.round(r.ghq_score * 100) / 100,
        count: r.count
      }));
    } else {
      metricsRecords = (await Metrics.find({ userId }).sort({ createdAt: -1 }).limit(7).lean()).reverse();
      screeningRecords = (await Screening.find({ userId }).sort({ createdAt: -1 }).limit(7).lean()).reverse();
    }

    // Helper functions
    const getScreeningValue = (s, field) => s.screening?.[field] ?? s[field] ?? 0;
    const length = Math.max(metricsRecords.length, screeningRecords.length);

    const chartLabels = length > 0
      ? Array.from({ length }, (_, i) => {
          const mDate = metricsRecords[i]?.createdAt;
          const sDate = screeningRecords[i]?.createdAt;
          const date = mDate || sDate || new Date();
          return new Date(date).toISOString().split("T")[0];
        })
      : [req.t("dashboard.noData", "No Data")];

    const chartData = {
      stress_level: metricsRecords.map(m => m?.stress_level ?? 0).slice(0, length),
      happiness_level: metricsRecords.map(m => m?.happiness_level ?? 0).slice(0, length),
      anxiety_level: metricsRecords.map(m => m?.anxiety_level ?? 0).slice(0, length),
      overall_mood_level: metricsRecords.map(m => m?.overall_mood_level ?? 0).slice(0, length),
      phq9_score: screeningRecords.map(s => getScreeningValue(s, "phq9_score")).slice(0, length),
      gad7_score: screeningRecords.map(s => getScreeningValue(s, "gad7_score")).slice(0, length),
      ghq_score: screeningRecords.map(s => getScreeningValue(s, "ghq_score")).slice(0, length),
    };

    // --- Todos retrieval & normalization ---
    const todosRecord = await Todo.findOne({ userId }).lean();
    const todos = (todosRecord?.tasks || []).map(task => {
      const t = { ...task };
      // Ensure each task has a unique _id
      if (!t._id) t._id = require("uuid").v4();
      // Normalize timestamps
      t.createdAt = t.createdAt ? new Date(t.createdAt) : new Date();
      t.updatedAt = t.updatedAt ? new Date(t.updatedAt) : new Date();
      // Validate category
      t.category = ['self-care','mindfulness','social','physical','professional'].includes(t.category) ? t.category : 'self-care';
      return t;
    });

    // Summary statistics
    const summary = {
      totalEntries: metricsRecords.length,
      averageStress: metricsRecords.length ? Math.round(metricsRecords.reduce((sum, m) => sum + (m.stress_level || 0), 0) / metricsRecords.length * 100) / 100 : 0,
      averageHappiness: metricsRecords.length ? Math.round(metricsRecords.reduce((sum, m) => sum + (m.happiness_level || 0), 0) / metricsRecords.length * 100) / 100 : 0,
      averageAnxiety: metricsRecords.length ? Math.round(metricsRecords.reduce((sum, m) => sum + (m.anxiety_level || 0), 0) / metricsRecords.length * 100) / 100 : 0,
      completedTasks: todos.filter(t => t.completed).length,
      totalTasks: todos.length
    };

    res.json({
      success: true,
      chartLabels,
      chartData,
      todos,
      summary,
      mode: type,
      language: userLanguage,
      labels: {
        stressLevel: req.t("chatbot.metrics.stressLevel"),
        happinessLevel: req.t("chatbot.metrics.happinessLevel"),
        anxietyLevel: req.t("chatbot.metrics.anxietyLevel"),
        overallMood: req.t("chatbot.metrics.overallMood"),
        phq9Score: req.t("chatbot.metrics.phq9Score"),
        gad7Score: req.t("chatbot.metrics.gad7Score"),
        ghqScore: req.t("chatbot.metrics.ghqScore"),
        noData: req.t("dashboard.noData", "No Data")
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: req.t("dashboard.dataError") });
  }
});


exports.getTasks = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.session?.userId;
  if (!userId) return res.status(401).json({ success: false, error: req.t("auth.unauthorized") });

  const userLanguage = req.getLanguage();
  const includeChat = req.query.includeChat === 'true';

  let todo = await Todo.findOne({ userId });
  if (!todo) {
    todo = await Todo.create({ 
      userId, 
      tasks: [],
      language: userLanguage
    });
  }

  const tasks = todo.tasks.map(task => {
    const taskObj = task.toObject ? task.toObject() : task;
    // Ensure unique _id
    if (!taskObj._id) taskObj._id = uuidv4();

    if (!includeChat) {
      const { chatMessageId, chatMessage, chatTimestamp, ...taskWithoutChat } = taskObj;
      return taskWithoutChat;
    }

    return taskObj;
  });

  res.json({ 
    success: true,
    tasks,
    language: userLanguage,
    labels: {
      taskTitle: req.t("chatbot.todos.taskTitle"),
      completed: req.t("chatbot.todos.completed"),
      pending: req.t("chatbot.todos.pending"),
      noTasks: req.t("dashboard.noTasks"),
      chatContext: req.t("dashboard.chatContext", "Chat Context")
    }
  });
});

exports.updateTasks = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.session?.userId;
  if (!userId) return res.status(401).json({ success: false, error: req.t("auth.unauthorized") });

  const { tasks } = req.body;
  const userLanguage = req.getLanguage();

  if (!Array.isArray(tasks)) return res.status(400).json({ success: false, error: req.t("dashboard.tasksRequired") });

  const validatedTasks = tasks.map(task => ({
    _id: task._id || uuidv4(),
    title: task.title || '',
    completed: Boolean(task.completed),
    priority: task.priority || 'medium',
    category: ['self-care','mindfulness','social','physical','professional'].includes(task.category)
      ? task.category
      : 'self-care',
    createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
    updatedAt: new Date()
  }));

  const todo = await Todo.findOneAndUpdate(
    { userId },
    { tasks: validatedTasks, updatedAt: new Date(), language: userLanguage },
    { new: true, upsert: true }
  );

  res.json({ 
    success: true, 
    tasks: todo.tasks,
    language: userLanguage,
    message: req.t("dashboard.tasksUpdated")
  });
});
