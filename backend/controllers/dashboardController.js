const Metrics = require("../models/metrics");
const Screening = require("../models/Screening");
const Todo = require("../models/todo");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user?._id || req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Please log in first" });

    const type = req.query.type || "entries";

    let metricsRecords = [];
    let screeningRecords = [];

    if (type === "daily") {
      metricsRecords = await Metrics.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            stress_level: { $avg: "$stress_level" },
            happiness_level: { $avg: "$happiness_level" },
            anxiety_level: { $avg: "$anxiety_level" },
            overall_mood_level: { $avg: "$overall_mood_level" },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
        { $limit: 7 },
      ]);

      metricsRecords = metricsRecords.reverse().map(r => ({
        createdAt: new Date(r._id.year, r._id.month - 1, r._id.day),
        stress_level: r.stress_level,
        happiness_level: r.happiness_level,
        anxiety_level: r.anxiety_level,
        overall_mood_level: r.overall_mood_level,
      }));

      screeningRecords = await Screening.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            phq9_score: { $avg: "$phq9_score" },
            gad7_score: { $avg: "$gad7_score" },
            ghq_score: { $avg: "$ghq_score" },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
        { $limit: 7 },
      ]);

      screeningRecords = screeningRecords.reverse().map(r => ({
        createdAt: new Date(r._id.year, r._id.month - 1, r._id.day),
        phq9_score: r.phq9_score,
        gad7_score: r.gad7_score,
        ghq_score: r.ghq_score,
      }));
    } else {
      metricsRecords = await Metrics.find({ userId }).sort({ createdAt: -1 }).limit(7).lean();
      metricsRecords = metricsRecords.reverse();

      screeningRecords = await Screening.find({ userId }).sort({ createdAt: -1 }).limit(7).lean();
      screeningRecords = screeningRecords.reverse();
    }

    const getScreeningValue = (s, field) => s.screening?.[field] ?? s[field] ?? 0;
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
      stress_level: metricsRecords.map(m => m?.stress_level ?? 0).slice(0, length),
      happiness_level: metricsRecords.map(m => m?.happiness_level ?? 0).slice(0, length),
      anxiety_level: metricsRecords.map(m => m?.anxiety_level ?? 0).slice(0, length),
      overall_mood_level: metricsRecords.map(m => m?.overall_mood_level ?? 0).slice(0, length),
      phq9_score: screeningRecords.map(s => getScreeningValue(s, "phq9_score")).slice(0, length),
      gad7_score: screeningRecords.map(s => getScreeningValue(s, "gad7_score")).slice(0, length),
      ghq_score: screeningRecords.map(s => getScreeningValue(s, "ghq_score")).slice(0, length),
    };

    const todosRecord = await Todo.findOne({ userId }).lean();
    const todos = todosRecord?.tasks ?? [];

    res.json({ chartLabels, chartData, todos, mode: type });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: "Error fetching dashboard data." });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const userId = req.user?._id || req.session?.userId;
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
    const userId = req.user?._id || req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { tasks } = req.body;
    if (!Array.isArray(tasks)) return res.status(400).json({ error: "Tasks must be an array" });

    const todo = await Todo.findOneAndUpdate(
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
