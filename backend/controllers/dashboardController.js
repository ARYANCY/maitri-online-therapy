const mongoose = require("mongoose"); 
const Metrics = require("../models/metrics");
const Todo = require("../models/todo");  

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : (req.query.userId || req.session.userId);
    if (!userId) return res.status(401).json({ error: "User ID is missing." });

    const userIdStr = userId.toString();
    console.log("Dashboard fetch for userId:", userIdStr);

    const type = req.query.type || "entries"; 
    let metricsRecords = [];

    if (type === "daily") {
      metricsRecords = await Metrics.aggregate([
        { $match: { userId: userIdStr } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" }
            },
            stress: { $avg: "$metrics.stress_level" },
            happiness: { $avg: "$metrics.happiness_level" },
            anxiety: { $avg: "$metrics.anxiety_level" },
            mood: { $avg: "$metrics.overall_mood_level" }
          }
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
        { $limit: 7 }
      ]);

      metricsRecords = metricsRecords.reverse().map(r => ({
        createdAt: new Date(r._id.year, r._id.month - 1, r._id.day),
        metrics: {
          stress_level: r.stress,
          happiness_level: r.happiness,
          anxiety_level: r.anxiety,
          overall_mood_level: r.mood
        }
      }));

      const today = new Date();
      const todayKey = today.toISOString().split("T")[0];
      const hasToday = metricsRecords.some(m =>
        new Date(m.createdAt).toISOString().split("T")[0] === todayKey
      );

      if (!hasToday) {
        metricsRecords.push({
          createdAt: today,
          metrics: {
            stress_level: null,
            happiness_level: null,
            anxiety_level: null,
            overall_mood_level: null
          }
        });
      }
    } else {
      metricsRecords = await Metrics.find({ userId: userIdStr })
        .sort({ createdAt: -1 })
        .limit(7)
        .lean();
      metricsRecords = metricsRecords.reverse();
    }

    const chartLabels = metricsRecords.map(m =>
      new Date(m.createdAt).toISOString().split("T")[0]
    );

    const chartData = {
      stress_level: metricsRecords.map(m => m.metrics?.stress_level ?? null),
      happiness_level: metricsRecords.map(m => m.metrics?.happiness_level ?? null),
      anxiety_level: metricsRecords.map(m => m.metrics?.anxiety_level ?? null),
      overall_mood_level: metricsRecords.map(m => m.metrics?.overall_mood_level ?? null)
    };

    const todosRecord = await Todo.findOne({ userId: userIdStr }).lean();
    const todos = todosRecord?.tasks || [];

    console.log("Metrics records:", metricsRecords);
    console.log("Todos record:", todosRecord);

    res.json({
      chartLabels,
      chartData,
      todos,
      mode: type
    });

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
    if (!todo) {
      todo = await Todo.create({ userId, tasks: [] });
    }

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

    let todo = await Todo.findOneAndUpdate(
      { userId },
      { tasks },
      { new: true, upsert: true }
    );

    res.json({ success: true, tasks: todo.tasks });
  } catch (err) {
    console.error("Error updating tasks:", err);
    res.status(500).json({ error: "Failed to update tasks" });
  }
};
