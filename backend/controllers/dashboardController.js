const mongoose = require("mongoose");
const Metrics = require("../models/metrics");
const Screening = require("../models/Screening");
const Todo = require("../models/todo");

exports.getDashboard = async (req, res) => {
  try {
    // 1️⃣ Get User ID
    const userId = req.user?._id || req.query.userId || req.session.userId;
    if (!userId) return res.status(401).json({ error: "User ID is missing." });

    const userIdStr = userId.toString();
    const type = req.query.type || "entries";

    let metricsRecords = [];
    let screeningRecords = [];

    // 2️⃣ Fetch Metrics and Screening
    if (type === "daily") {
      // Daily aggregation
      metricsRecords = await Metrics.aggregate([
        { $match: { userId: userIdStr } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            stress: { $avg: "$metrics.stress_level" },
            happiness: { $avg: "$metrics.happiness_level" },
            anxiety: { $avg: "$metrics.anxiety_level" },
            mood: { $avg: "$metrics.overall_mood_level" },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
        { $limit: 7 },
      ]);

      metricsRecords = metricsRecords.reverse().map(r => ({
        createdAt: new Date(r._id.year, r._id.month - 1, r._id.day),
        metrics: {
          stress_level: r.stress,
          happiness_level: r.happiness,
          anxiety_level: r.anxiety,
          overall_mood_level: r.mood,
        },
      }));

      screeningRecords = await Screening.aggregate([
        { $match: { userId: userIdStr } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            phq9: { $avg: "$phq9_score" },
            gad7: { $avg: "$gad7_score" },
            ghq: { $avg: "$ghq_score" },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
        { $limit: 7 },
      ]);

      screeningRecords = screeningRecords.reverse().map(r => ({
        createdAt: new Date(r._id.year, r._id.month - 1, r._id.day),
        screening: {
          phq9_score: r.phq9,
          gad7_score: r.gad7,
          ghq_score: r.ghq,
        },
      }));

    } else {
      // Latest 7 entries
      metricsRecords = await Metrics.find({ userId: userIdStr }).sort({ createdAt: -1 }).limit(7).lean();
      metricsRecords = metricsRecords.reverse();

      screeningRecords = await Screening.find({ userId: userIdStr }).sort({ createdAt: -1 }).limit(7).lean();
      screeningRecords = screeningRecords.reverse();
    }

    // 3️⃣ Sort arrays by createdAt to keep oldest -> newest
    metricsRecords.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    screeningRecords.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // 4️⃣ Helper to safely get screening values
    const getScreeningValue = (s, field) => s.screening?.[field] ?? s[field] ?? 0;

    // 5️⃣ Prepare labels and data
    const length = Math.max(metricsRecords.length, screeningRecords.length);

    const chartLabels =
      length > 0
        ? Array.from({ length }, (_, i) => {
            const mDate = metricsRecords[i]?.createdAt;
            const sDate = screeningRecords[i]?.createdAt;
            const date = mDate || sDate || new Date();
            return new Date(date).toISOString().split("T")[0];
          })
        : ["No Data"];

    const chartData = {
      stress_level: metricsRecords.map(m => m?.metrics?.stress_level ?? 0).slice(0, length),
      happiness_level: metricsRecords.map(m => m?.metrics?.happiness_level ?? 0).slice(0, length),
      anxiety_level: metricsRecords.map(m => m?.metrics?.anxiety_level ?? 0).slice(0, length),
      overall_mood_level: metricsRecords.map(m => m?.metrics?.overall_mood_level ?? 0).slice(0, length),
      phq9_score: screeningRecords.map(s => getScreeningValue(s, "phq9_score")).slice(0, length),
      gad7_score: screeningRecords.map(s => getScreeningValue(s, "gad7_score")).slice(0, length),
      ghq_score: screeningRecords.map(s => getScreeningValue(s, "ghq_score")).slice(0, length),
    };

    // 6️⃣ Fetch todos
    const todosRecord = await Todo.findOne({ userId: userIdStr }).lean();
    const todos = todosRecord?.tasks ?? [];

    // 7️⃣ Respond
    res.json({ chartLabels, chartData, todos, mode: type });

  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: "Error fetching dashboard data." });
  }
};

// Tasks controllers remain unchanged
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    let todo = await Todo.findOne({ userId });
    if (!todo) todo = await Todo.create({ userId, tasks: [] });

    res.json({ tasks: todo.tasks });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

exports.updateTasks = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { tasks } = req.body;
    const todo = await Todo.findOneAndUpdate({ userId }, { tasks }, { new: true, upsert: true });

    res.json({ success: true, tasks: todo.tasks });
  } catch (err) {
    console.error("Error updating tasks:", err);
    res.status(500).json({ error: "Failed to update tasks" });
  }
};
