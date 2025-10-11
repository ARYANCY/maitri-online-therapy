const Metrics = require("../models/metrics");
const Screening = require("../models/Screening");
const Todo = require("../models/todo");
const User = require("../models/User");
const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/errorHandler");
const PDFDocument = require("pdfkit");

// Generate full report data
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
    logger.error("Failed to generate report data", { userId, error: err.message, stack: err.stack });
    throw err;
  }
}

// Calculate summary statistics and trends
function calculateStatistics(metricsData, screeningData) {
  const totalEntries = metricsData.length;
  if (!totalEntries) return {
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

  const avg = (arr, field) => arr.reduce((sum, m) => sum + (m[field] || 0), 0) / arr.length;

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

// Generate recommendations based on stats
function generateRecommendations(stats, language) {
  const recs = [];

  if (stats.summary.averageStress > 30) recs.push({
    category: "stress",
    priority: "high",
    message:
      language === "hi" ? "तनाव का स्तर उच्च है। ध्यान और व्यायाम की सलाह दी जाती है।" :
      language === "as" ? "মানসিক চাপৰ স্তৰ উচ্চ। ধ্যান আৰু ব্যায়ামৰ পৰামৰ্শ দিয়া হয়।" :
      "Stress levels are high. Consider meditation and exercise."
  });

  if (stats.summary.averageHappiness < 20) recs.push({
    category: "happiness",
    priority: "high",
    message:
      language === "hi" ? "खुशी का स्तर कम है। सामाजिक गतिविधियों में भाग लेने की सलाह दी जाती है।" :
      language === "as" ? "সুখৰ স্তৰ কম। সামাজিক কাৰ্যকলাপত অংশগ্ৰহণৰ পৰামৰ্শ দিয়া হয়।" :
      "Happiness levels are low. Consider engaging in social activities."
  });

  if (stats.summary.riskLevel === "high") recs.push({
    category: "professional",
    priority: "urgent",
    message:
      language === "hi" ? "पेशेवर मदद की सिफारिश की जाती है। कृपया एक योग्य काउंसलर से संपर्क करें।" :
      language === "as" ? "পেছাদাৰী সহায়ৰ পৰামৰ্শ দিয়া হয়। অনুগ্ৰহ কৰি এজন যোগ্য কাউন্সেলৰৰ সৈতে যোগাযোগ কৰক।" :
      "Professional help is recommended. Please contact a qualified counselor."
  });

  return recs;
}

// Generate chart-ready data
function generateChartData(metricsData, screeningData) {
  return {
    labels: metricsData.map(m => new Date(m.createdAt).toISOString().split("T")[0]),
    datasets: [
      { label: "Stress Level", data: metricsData.map(m => m.stress_level || 0), borderColor: "#ff6b6b", backgroundColor: "rgba(255,107,107,0.1)" },
      { label: "Happiness Level", data: metricsData.map(m => m.happiness_level || 0), borderColor: "#4ecdc4", backgroundColor: "rgba(78,205,196,0.1)" },
      { label: "Anxiety Level", data: metricsData.map(m => m.anxiety_level || 0), borderColor: "#ffe66d", backgroundColor: "rgba(255,230,109,0.1)" },
      { label: "Overall Mood", data: metricsData.map(m => m.overall_mood_level || 0), borderColor: "#a8e6cf", backgroundColor: "rgba(168,230,207,0.1)" }
    ]
  };
}

// Convert report to CSV
function convertToCSV(reportData) {
  if (!reportData || !reportData.summary) return "";
  const headers = ["Date","Stress Level","Happiness Level","Anxiety Level","Overall Mood","PHQ-9 Score","GAD-7 Score","GHQ Score","Risk Level"];
  const rows = [headers.join(",")];
  const metricsData = reportData.metricsData || [];
  const screeningData = reportData.screeningData || [];
  const dataByDate = {};

  metricsData.forEach(m => {
    const date = new Date(m.createdAt).toISOString().split("T")[0];
    dataByDate[date] = { stress: m.stress_level || 0, happiness: m.happiness_level || 0, anxiety: m.anxiety_level || 0, mood: m.overall_mood_level || 0 };
  });

  screeningData.forEach(s => {
    const date = new Date(s.createdAt).toISOString().split("T")[0];
    dataByDate[date] = { ...dataByDate[date], phq9: s.phq9_score || 0, gad7: s.gad7_score || 0, ghq: s.ghq_score || 0 };
  });

  Object.keys(dataByDate).sort().forEach(date => {
    const d = dataByDate[date];
    rows.push([date,d.stress,d.happiness,d.anxiety,d.mood,d.phq9,d.gad7,d.ghq,reportData.summary.riskLevel || "low"].join(","));
  });

  return rows.join("\n");
}

// Send report as PDF
function sendPDF(reportData, res) {
  const doc = new PDFDocument({ margin: 30 });
  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    const pdfData = Buffer.concat(buffers);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="maitri-report-${Date.now()}.pdf"`);
    res.send(pdfData);
  });

  doc.fontSize(20).text("Maitri Mental Health Report", { align: "center" }).moveDown();
  doc.fontSize(14).text(`User: ${reportData.user.name} (${reportData.user.email})`);
  doc.text(`Member Since: ${new Date(reportData.user.memberSince).toDateString()}`);
  doc.text(`Generated On: ${new Date(reportData.generatedAt).toDateString()}`).moveDown();
  doc.fontSize(16).text("Summary");
  Object.entries(reportData.summary).forEach(([k,v]) => doc.fontSize(12).text(`${k}: ${v}`));
  doc.moveDown();
  if (reportData.recommendations.length) {
    doc.fontSize(16).text("Recommendations");
    reportData.recommendations.forEach(r => doc.fontSize(12).text(`- [${r.priority}] ${r.message}`));
  }
  doc.end();
}

// Export all functions
module.exports = {
  generateReportData,
  sendPDF,
  convertToCSV,
  generateRecommendations,
  calculateStatistics,
  generateChartData
};
