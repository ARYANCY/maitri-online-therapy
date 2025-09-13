const mongoose = require("mongoose");
const Metrics = require("../models/metrics");
const Screening = require("../models/Screening");
const Todo = require("../models/todo");

exports.getDashboard = async (req, res) => {
  try {
    // 1️⃣ Get User ID safely
    const userId = req.user?._id || req.query.userId || req.session?.userId;
    if (!userId) return res.status(401).json({ error: "User ID is missing." });
    const userIdStr = userId.toString();
    const type = req.query.type || "entries";

    let metricsRecords = [];
    let screeningRecords = [];

    // 2️⃣ Fetch Metrics and Screening
    if (type === "daily") {
      // Aggregate daily
      const aggregateMetrics = [
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
      ];

      metricsRecords = (await Metrics.aggregate(aggregateMetrics))
        .reverse()
        .map(r => ({
          createdAt: new Date(r._id.year, r._id.month - 1, r._id.day),
          metrics: {
            stress_level: r.stress || 0,
            happiness_level: r.happiness || 0,
            anxiety_level: r.anxiety || 0,
            overall_mood_level: r.mood || 0,
          },
        }));

      const aggregateScreening = [
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
      ];

      screeningRecords = (await Screening.aggregate(aggregateScreening))
        .reverse()
        .map(r => ({
          createdAt: new Date(r._id.year, r._id.month - 1, r._id.day),
          screening: {
            phq9_score: r.phq9 || 0,
            gad7_score: r.gad7 || 0,
            ghq_score: r.ghq || 0,
          },
        }));
    } else {
      // Latest 7 entries
      metricsRecords = (await Metrics.find({ userId: userIdStr }).sort({ createdAt: -1 }).limit(7).lean()).reverse();
      screeningRecords = (await Screening.find({ userId: userIdStr }).sort({ createdAt: -1 }).limit(7).lean()).reverse();
    }

    // 3️⃣ Sort arrays by date
    metricsRecords.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    screeningRecords.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // 4️⃣ Safe helper
    const getValue = (obj, field) => obj?.screening?.[field] ?? obj?.[field] ?? 0;

    // 5️⃣ Prepare chart data
    const length = Math.max(metricsRecords.length, screeningRecords.length);
    const chartLabels = length
      ? Array.from({ length }, (_, i) => {
          const date = metricsRecords[i]?.createdAt || screeningRecords[i]?.createdAt || new Date();
          return date.toISOString().split("T")[0];
        })
      : ["No Data"];

    const chartData = {
      stress_level: metricsRecords.map(m => m.metrics?.stress_level ?? 0).slice(0, length),
      happiness_level: metricsRecords.map(m => m.metrics?.happiness_level ?? 0).slice(0, length),
      anxiety_level: metricsRecords.map(m => m.metrics?.anxiety_level ?? 0).slice(0, length),
      overall_mood_level: metricsRecords.map(m => m.metrics?.overall_mood_level ?? 0).slice(0, length),
      phq9_score: screeningRecords.map(s => getValue(s, "phq9_score")).slice(0, length),
      gad7_score: screeningRecords.map(s => getValue(s, "gad7_score")).slice(0, length),
      ghq_score: screeningRecords.map(s => getValue(s, "ghq_score")).slice(0, length),
    };

    // 6️⃣ Fetch todos safely
    const todosRecord = await Todo.findOne({ userId: userIdStr }).lean();
    const todos = Array.isArray(todosRecord?.tasks) ? todosRecord.tasks : [];

    res.json({ chartLabels, chartData, todos, mode: type });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: "Error fetching dashboard data." });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    let todo = await Todo.findOne({ userId });
    if (!todo) todo = await Todo.create({ userId, tasks: [] });

    res.json({ tasks: Array.isArray(todo.tasks) ? todo.tasks : [] });
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
    if (!Array.isArray(tasks)) return res.status(400).json({ error: "Invalid tasks array" });

    const todo = await Todo.findOneAndUpdate(
      { userId },
      { tasks },
      { new: true, upsert: true }
    );

    res.json({ success: true, tasks: Array.isArray(todo.tasks) ? todo.tasks : [] });
  } catch (err) {
    console.error("Error updating tasks:", err);
    res.status(500).json({ error: "Failed to update tasks" });
  }
};
