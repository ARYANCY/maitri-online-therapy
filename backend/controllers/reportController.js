const Metrics = require("../models/metrics");
const Screening = require("../models/Screening");
const Todo = require("../models/todo");
const User = require("../models/User");
const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/errorHandler");
const PDFDocument = require("pdfkit");

/**
 * Generate full report data for a given user
 */
async function generateReportData(userId, language = "en", req) {
  try {
    const user = await User.findById(userId).lean();
    if (!user) throw new Error("User not found");

    const metricsData = await Metrics.find({ user: userId }).sort({ createdAt: 1 }).lean();
    const screeningData = await Screening.find({ user: userId }).sort({ createdAt: 1 }).lean();
    const todos = await Todo.find({ user: userId }).sort({ createdAt: 1 }).lean();

    const stats = calculateStatistics(metricsData, screeningData);
    const recommendations = generateRecommendations(stats, language);
    const chartData = generateChartData(metricsData, screeningData);

    return {
      user,
      metricsData,
      screeningData,
      todos,
      summary: stats.summary,
      trends: stats.trends,
      recommendations,
      chartData,
      generatedAt: new Date()
    };
  } catch (err) {
    logger.error("Failed to generate report data", {
      userId,
      error: err.message,
      stack: err.stack
    });
    throw err;
  }
}

/**
 * Compute statistics and trends from metrics and screenings
 */
function calculateStatistics(metricsData, screeningData) {
  const totalEntries = metricsData.length;
  if (!totalEntries) {
    return {
      summary: {
        totalEntries: 0,
        averageStress: 0,
        averageHappiness: 0,
        averageAnxiety: 0,
        averageMood: 0,
        averagePHQ9: 0,
        averageGAD7: 0,
        averageGHQ: 0,
        riskLevel: "low"
      },
      trends: {
        stressTrend: "stable",
        happinessTrend: "stable",
        anxietyTrend: "stable",
        moodTrend: "stable"
      }
    };
  }

  const avg = (arr, field) =>
    arr.reduce((sum, m) => sum + (m[field] || 0), 0) / arr.length;

  const avgStress = avg(metricsData, "stress_level");
  const avgHappiness = avg(metricsData, "happiness_level");
  const avgAnxiety = avg(metricsData, "anxiety_level");
  const avgMood = avg(metricsData, "overall_mood_level");
  const avgPHQ9 = screeningData.length ? avg(screeningData, "phq9_score") : 0;
  const avgGAD7 = screeningData.length ? avg(screeningData, "gad7_score") : 0;
  const avgGHQ = screeningData.length ? avg(screeningData, "ghq_score") : 0;

  let riskLevel = "low";
  if (avgPHQ9 > 15 || avgGAD7 > 10 || avgGHQ > 20) riskLevel = "high";
  else if (avgPHQ9 > 10 || avgGAD7 > 7 || avgGHQ > 15) riskLevel = "moderate";

  const mid = Math.floor(totalEntries / 2);
  const firstHalf = metricsData.slice(0, mid);
  const secondHalf = metricsData.slice(mid);

  const trend = (first, second, field) => {
    if (!first.length || !second.length) return "stable";
    const firstAvg = avg(first, field);
    const secondAvg = avg(second, field);
    const diff = secondAvg - firstAvg;
    if (Math.abs(diff) < 2) return "stable";
    return diff > 0 ? "improving" : "declining";
  };

  return {
    summary: {
      totalEntries,
      averageStress: Math.round(avgStress * 100) / 100,
      averageHappiness: Math.round(avgHappiness * 100) / 100,
      averageAnxiety: Math.round(avgAnxiety * 100) / 100,
      averageMood: Math.round(avgMood * 100) / 100,
      averagePHQ9: Math.round(avgPHQ9 * 100) / 100,
      averageGAD7: Math.round(avgGAD7 * 100) / 100,
      averageGHQ: Math.round(avgGHQ * 100) / 100,
      riskLevel
    },
    trends: {
      stressTrend: trend(firstHalf, secondHalf, "stress_level"),
      happinessTrend: trend(firstHalf, secondHalf, "happiness_level"),
      anxietyTrend: trend(firstHalf, secondHalf, "anxiety_level"),
      moodTrend: trend(firstHalf, secondHalf, "overall_mood_level")
    }
  };
}

/**
 * Create personalized recommendations
 */
function generateRecommendations(stats, language) {
  const recs = [];

  if (stats.summary.averageStress > 30)
    recs.push({
      category: "stress",
      priority: "high",
      message:
        language === "hi"
          ? "तनाव का स्तर उच्च है। ध्यान और व्यायाम की सलाह दी जाती है।"
          : language === "as"
          ? "মানসিক চাপৰ স্তৰ উচ্চ। ধ্যান আৰু ব্যায়ামৰ পৰামৰ্শ দিয়া হয়।"
          : "Stress levels are high. Consider meditation and exercise."
    });

  if (stats.summary.averageHappiness < 20)
    recs.push({
      category: "happiness",
      priority: "high",
      message:
        language === "hi"
          ? "खुशी का स्तर कम है। सामाजिक गतिविधियों में भाग लेने की सलाह दी जाती है।"
          : language === "as"
          ? "সুখৰ স্তৰ কম। সামাজিক কাৰ্যকলাপত অংশগ্ৰহণৰ পৰামৰ্শ দিয়া হয়।"
          : "Happiness levels are low. Consider engaging in social activities."
    });

  if (stats.summary.riskLevel === "high")
    recs.push({
      category: "professional",
      priority: "urgent",
      message:
        language === "hi"
          ? "पेशेवर मदद की सिफारिश की जाती है। कृपया एक योग्य काउंसलर से संपर्क करें।"
          : language === "as"
          ? "পেছাদাৰী সহায়ৰ পৰামৰ্শ দিয়া হয়। অনুগ্ৰহ কৰি এজন যোগ্য কাউন্সেলৰৰ সৈতে যোগাযোগ কৰক।"
          : "Professional help is recommended. Please contact a qualified counselor."
    });

  return recs;
}

/**
 * Generate line chart data for visualization
 */
function generateChartData(metricsData, screeningData) {
  return {
    labels: metricsData.map(m =>
      new Date(m.createdAt).toISOString().split("T")[0]
    ),
    datasets: [
      {
        label: "Stress Level",
        data: metricsData.map(m => m.stress_level || 0),
        borderColor: "#ff6b6b",
        backgroundColor: "rgba(255,107,107,0.1)"
      },
      {
        label: "Happiness Level",
        data: metricsData.map(m => m.happiness_level || 0),
        borderColor: "#4ecdc4",
        backgroundColor: "rgba(78,205,196,0.1)"
      },
      {
        label: "Anxiety Level",
        data: metricsData.map(m => m.anxiety_level || 0),
        borderColor: "#ffe66d",
        backgroundColor: "rgba(255,230,109,0.1)"
      },
      {
        label: "Overall Mood",
        data: metricsData.map(m => m.overall_mood_level || 0),
        borderColor: "#a8e6cf",
        backgroundColor: "rgba(168,230,207,0.1)"
      }
    ]
  };
}

/**
 * Convert report data to CSV
 */
function convertToCSV(reportData) {
  if (!reportData || !reportData.summary) return "";

  const headers = [
    "Date",
    "Stress Level",
    "Happiness Level",
    "Anxiety Level",
    "Overall Mood",
    "PHQ-9 Score",
    "GAD-7 Score",
    "GHQ Score",
    "Risk Level"
  ];
  const rows = [headers.join(",")];
  const metricsData = reportData.metricsData || [];
  const screeningData = reportData.screeningData || [];
  const dataByDate = {};

  metricsData.forEach(m => {
    const date = new Date(m.createdAt).toISOString().split("T")[0];
    dataByDate[date] = {
      stress: m.stress_level || 0,
      happiness: m.happiness_level || 0,
      anxiety: m.anxiety_level || 0,
      mood: m.overall_mood_level || 0
    };
  });

  screeningData.forEach(s => {
    const date = new Date(s.createdAt).toISOString().split("T")[0];
    dataByDate[date] = {
      ...dataByDate[date],
      phq9: s.phq9_score || 0,
      gad7: s.gad7_score || 0,
      ghq: s.ghq_score || 0
    };
  });

  Object.keys(dataByDate)
    .sort()
    .forEach(date => {
      const d = dataByDate[date];
      rows.push(
        [
          date,
          d.stress,
          d.happiness,
          d.anxiety,
          d.mood,
          d.phq9,
          d.gad7,
          d.ghq,
          reportData.summary.riskLevel || "low"
        ].join(",")
      );
    });

  return rows.join("\n");
}

/**
 * Generate and send a PDF version of the report
 */
function sendPDF(reportData, res) {
  try {
    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      info: {
        Title: "Maitri Mental Health Report",
        Author: "Maitri System",
        Subject: "User Mental Health Summary Report",
      },
    });

    // Stream PDF directly to response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="maitri-report-${Date.now()}.pdf"`
    );
    doc.pipe(res);

    // Title
    doc.fontSize(22).text("Maitri Mental Health Report", {
      align: "center",
      underline: true,
    });
    doc.moveDown(1.5);

    // User info
    const { user, generatedAt } = reportData;
    doc
      .fontSize(14)
      .text(`User: ${user?.name || "N/A"} (${user?.email || "N/A"})`);
    if (user?.memberSince)
      doc.text(
        `Member Since: ${new Date(user.memberSince).toLocaleDateString()}`
      );
    doc.text(`Generated On: ${new Date(generatedAt).toLocaleDateString()}`);
    doc.moveDown(1.5);

    // Summary section
    doc.fontSize(16).text("Summary", { underline: true });
    doc.moveDown(0.5);
    Object.entries(reportData.summary || {}).forEach(([key, value]) => {
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase());
      doc.fontSize(12).text(`${label}: ${value}`);
    });
    doc.moveDown(1.5);

    // Recommendations section
    if (reportData.recommendations?.length) {
      doc.fontSize(16).text("Recommendations", { underline: true });
      doc.moveDown(0.5);
      reportData.recommendations.forEach((r, idx) => {
        doc
          .fontSize(12)
          .text(`${idx + 1}. [${r.priority.toUpperCase()}] ${r.message}`);
      });
      doc.moveDown(1.5);
    }

    // Footer
    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor("gray")
      .text(
        "This report is automatically generated by the Maitri Mental Health System.",
        { align: "center" }
      );

    // Finalize
    doc.end();
  } catch (err) {
    console.error("PDF generation failed:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to generate PDF report" });
  }
}


/**
 * Controller to handle `/download` route
 */
const downloadReport = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.session?.userId;
  if (!userId)
    return res.status(401).json({ success: false, error: "Unauthorized" });

  const userLanguage = req.getLanguage ? req.getLanguage() : "en";
  const { format = "json" } = req.query;

  logger.info("Report download requested", {
    userId,
    format,
    language: userLanguage,
    ip: req.ip
  });

  try {
    const reportData = await generateReportData(userId, userLanguage, req);

    if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.json(reportData);
    } else if (format === "csv") {
      const csvData = convertToCSV(reportData);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="maitri-report-${Date.now()}.csv"`
      );
      res.send(csvData);
    } else if (format === "pdf") {
      sendPDF(reportData, res);
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Invalid format specified" });
    }

    logger.info("Report successfully generated", {
      userId,
      format,
      language: userLanguage
    });
  } catch (err) {
    logger.error("Report generation failed", {
      userId,
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ success: false, error: "Failed to generate report" });
  }
});

module.exports = {
  generateReportData,
  sendPDF,
  convertToCSV,
  generateRecommendations,
  calculateStatistics,
  generateChartData,
  downloadReport
};
