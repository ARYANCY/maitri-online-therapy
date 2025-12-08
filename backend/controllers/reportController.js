const Metrics = require("../models/metrics");
const Screening = require("../models/Screening");
const Todo = require("../models/todo");
const User = require("../models/User");
const DementiaAssessment = require("../models/DementiaAssessment");
const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/errorHandler");
const PDFDocument = require("pdfkit");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const SUPPORTED_FORMATS = ["json", "csv", "pdf"];

// Gemini AI setup for enhanced text generation
const apiKeys = process.env.GEMINI_API_KEYS?.split(",").map(k => k.trim()).filter(Boolean) || [];
let currentGeminiKeyIndex = 0;

function getNextGeminiClient() {
  if (!apiKeys.length) return null;
  const key = apiKeys[currentGeminiKeyIndex];
  currentGeminiKeyIndex = (currentGeminiKeyIndex + 1) % apiKeys.length;
  return new GoogleGenerativeAI(key);
}

async function generateWithGemini(prompt, fallbackText = null) {
  if (!apiKeys.length) {
    logger.debug("[Report] Gemini not configured, using fallback text");
    return fallbackText;
  }

  const client = getNextGeminiClient();
  if (!client) return fallbackText;

  try {
    const model = await client.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini timeout")), 10000)
      ),
    ]);

    const text = typeof result.response.text === "function"
      ? await result.response.text()
      : result.response.text;

    if (text && text.trim().length > 10) {
      return text.trim();
    }
  } catch (err) {
    logger.warn("[Report] Gemini generation failed, using fallback", {
      error: err.message,
    });
  }

  return fallbackText;
}

async function generateReportData(userId, language = "en", req) {
  try {
    const user = await User.findById(userId).lean();
    if (!user) throw new Error("User not found");

    const metricsData = await Metrics.find({ user: userId }).sort({ createdAt: 1 }).lean();
    const screeningData = await Screening.find({ user: userId }).sort({ createdAt: 1 }).lean();
    const todos = await Todo.find({ user: userId }).sort({ createdAt: 1 }).lean();
    const dementiaSessions = await DementiaAssessment.find({ userId }).sort({ createdAt: 1 }).lean();

    const hasAnyData =
      (metricsData && metricsData.length) ||
      (screeningData && screeningData.length) ||
      (dementiaSessions && dementiaSessions.length);

    const stats = calculateStatistics(metricsData, screeningData);
    const recommendations = await generateRecommendations(stats, language, user);
    const summaryText = await generateSummaryText(stats, language);
    const chartData = hasAnyData
      ? generateChartData(metricsData, screeningData)
      : {
          stress_level: [0],
          happiness_level: [0],
          anxiety_level: [0],
          overall_mood_level: [0],
          phq9_score: [0],
          gad7_score: [0],
          ghq_score: [0],
          dementia_risk_score: [0],
          labels: [new Date().toISOString().split("T")[0]],
        };

    const latestDementia = dementiaSessions.length ? dementiaSessions[dementiaSessions.length - 1] : null;
    const dementiaSummary = latestDementia ? {
      latestRiskScore: Math.round((latestDementia.riskScore || 0) * 100) / 100,
      latestRiskLevel: latestDementia.riskLevel || "low",
      latestDifficulty: latestDementia.difficulty || "easy",
      latestDate: latestDementia.updatedAt || latestDementia.createdAt,
      explanation: latestDementia.explanation || "",
      suggestions: Array.isArray(latestDementia.suggestions) ? latestDementia.suggestions : []
    } : {
      latestRiskScore: 0,
      latestRiskLevel: "low",
      latestDifficulty: "easy",
      latestDate: null,
      explanation: "",
      suggestions: []
    };

    return {
      user,
      metricsData,
      screeningData,
      todos,
      summary: stats.summary,
      summaryText,
      dementiaSessions,
      dementiaSummary,
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

async function generateRecommendations(stats, language, userData = null) {
  const recs = [];
  const langCode = language || "en";

  // Build context for Gemini
  const context = {
    stress: stats.summary.averageStress,
    happiness: stats.summary.averageHappiness,
    anxiety: stats.summary.averageAnxiety,
    mood: stats.summary.averageMood,
    phq9: stats.summary.averagePHQ9,
    gad7: stats.summary.averageGAD7,
    ghq: stats.summary.averageGHQ,
    riskLevel: stats.summary.riskLevel,
    trends: stats.trends,
    totalEntries: stats.summary.totalEntries,
  };

  // Language-specific prompts
  const prompts = {
    en: `Generate personalized mental health recommendations based on these metrics:
Stress: ${context.stress}/50, Happiness: ${context.happiness}/50, Anxiety: ${context.anxiety}/50, Mood: ${context.mood}/50
PHQ-9: ${context.phq9}/27, GAD-7: ${context.gad7}/21, GHQ: ${context.ghq}/36
Risk Level: ${context.riskLevel}
Trends: Stress ${context.trends.stressTrend}, Happiness ${context.trends.happinessTrend}, Anxiety ${context.trends.anxietyTrend}, Mood ${context.trends.moodTrend}
Total Data Points: ${context.totalEntries}

Provide 2-4 specific, actionable recommendations. Be empathetic, supportive, and practical. Format as JSON array: [{"category": "string", "priority": "high|moderate|low", "message": "string"}]`,

    hi: `इन मेट्रिक्स के आधार पर व्यक्तिगत मानसिक स्वास्थ्य सुझाव उत्पन्न करें:
तनाव: ${context.stress}/50, खुशी: ${context.happiness}/50, चिंता: ${context.anxiety}/50, मूड: ${context.mood}/50
PHQ-9: ${context.phq9}/27, GAD-7: ${context.gad7}/21, GHQ: ${context.ghq}/36
जोखिम स्तर: ${context.riskLevel}
ट्रेंड्स: तनाव ${context.trends.stressTrend}, खुशी ${context.trends.happinessTrend}, चिंता ${context.trends.anxietyTrend}, मूड ${context.trends.moodTrend}
कुल डेटा पॉइंट्स: ${context.totalEntries}

2-4 विशिष्ट, कार्रवाई योग्य सुझाव प्रदान करें। सहानुभूतिपूर्ण, सहायक और व्यावहारिक हो। JSON array के रूप में: [{"category": "string", "priority": "high|moderate|low", "message": "string"}]`,

    as: `এই মেট্ৰিকসমূহৰ ভিত্তিত ব্যক্তিগত মানসিক স্বাস্থ্যৰ পৰামৰ্শ উৎপাদন কৰক:
মানসিক চাপ: ${context.stress}/50, সুখ: ${context.happiness}/50, উদ্বেগ: ${context.anxiety}/50, মেজাজ: ${context.mood}/50
PHQ-9: ${context.phq9}/27, GAD-7: ${context.gad7}/21, GHQ: ${context.ghq}/36
ঝুঁকিৰ স্তৰ: ${context.riskLevel}
ট্ৰেণ্ড: মানসিক চাপ ${context.trends.stressTrend}, সুখ ${context.trends.happinessTrend}, উদ্বেগ ${context.trends.anxietyTrend}, মেজাজ ${context.trends.moodTrend}
মুঠ ডাটা পইণ্ট: ${context.totalEntries}

2-4 টা নিৰ্দিষ্ট, কাৰ্যকৰী পৰামৰ্শ দিয়ক। সহানুভূতিশীল, সহায়ক আৰু ব্যৱহাৰিক হ'ব। JSON array ৰূপত: [{"category": "string", "priority": "high|moderate|low", "message": "string"}]`,
  };

  const prompt = prompts[langCode] || prompts.en;

  try {
    const geminiResponse = await generateWithGemini(prompt, null);
    if (geminiResponse) {
      try {
        const cleaned = geminiResponse
          .replace(/^```json\s*/i, "")
          .replace(/```$/i, "")
          .trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 5); // Limit to 5 recommendations
        }
      } catch (parseErr) {
        logger.warn("[Report] Failed to parse Gemini recommendations", {
          error: parseErr.message,
        });
      }
    }
  } catch (err) {
    logger.warn("[Report] Gemini recommendations generation failed", {
      error: err.message,
    });
  }

  // Fallback to basic recommendations
  if (context.stress > 30) {
    recs.push({
      category: "stress",
      priority: "high",
      message:
        langCode === "hi"
          ? "तनाव का स्तर उच्च है। ध्यान, व्यायाम और नियमित आराम की सलाह दी जाती है।"
          : langCode === "as"
          ? "মানসিক চাপৰ স্তৰ উচ্চ। ধ্যান, ব্যায়াম আৰু নিয়মিত বিশ্ৰামৰ পৰামৰ্শ দিয়া হয়।"
          : "Your stress levels are elevated. Consider incorporating daily meditation, regular physical exercise, and ensuring adequate rest. Deep breathing exercises and mindfulness practices can also be beneficial.",
    });
  }

  if (context.happiness < 20) {
    recs.push({
      category: "happiness",
      priority: "high",
      message:
        langCode === "hi"
          ? "खुशी का स्तर कम है। सामाजिक गतिविधियों, शौक और सकारात्मक संबंधों में भाग लेने की सलाह दी जाती है।"
          : langCode === "as"
          ? "সুখৰ স্তৰ কম। সামাজিক কাৰ্যকলাপ, শখ আৰু ইতিবাচক সম্পৰ্কত অংশগ্ৰহণৰ পৰামৰ্শ দিয়া হয়।"
          : "Your happiness levels are lower than ideal. Engaging in social activities, pursuing hobbies, and nurturing positive relationships can help improve your overall wellbeing. Consider activities that bring you joy and fulfillment.",
    });
  }

  if (context.anxiety > 25) {
    recs.push({
      category: "anxiety",
      priority: "moderate",
      message:
        langCode === "hi"
          ? "चिंता का स्तर बढ़ा हुआ है। तनाव प्रबंधन तकनीक और नियमित दिनचर्या अपनाने की सलाह दी जाती है।"
          : langCode === "as"
          ? "উদ্বেগৰ স্তৰ বৃদ্ধি পাইছে। মানসিক চাপ পৰিচালনাৰ কৌশল আৰু নিয়মিত দৈনন্দিন কাৰ্যক্ৰম গ্ৰহণৰ পৰামৰ্শ দিয়া হয়।"
          : "Your anxiety levels are elevated. Stress management techniques, maintaining a regular routine, and progressive muscle relaxation can help. Consider limiting caffeine intake and ensuring quality sleep.",
    });
  }

  if (context.phq9 > 10 || context.gad7 > 10 || context.ghq > 15) {
    recs.push({
      category: "screening",
      priority: "high",
      message:
        langCode === "hi"
          ? "स्क्रीनिंग स्कोर बढ़े हुए हैं। पेशेवर मानसिक स्वास्थ्य सहायता लेने की सिफारिश की जाती है।"
          : langCode === "as"
          ? "স্ক্ৰীনিং স্ক'ৰ বৃদ্ধি পাইছে। পেছাদাৰী মানসিক স্বাস্থ্য সহায়তা লোৱাৰ পৰামৰ্শ দিয়া হয়।"
          : "Your screening scores indicate elevated levels of concern. Professional mental health support is strongly recommended. Consider reaching out to a qualified counselor or therapist for a comprehensive assessment.",
    });
  }

  if (context.riskLevel === "high") {
    recs.push({
      category: "professional",
      priority: "urgent",
      message:
        langCode === "hi"
          ? "उच्च जोखिम स्तर का पता चला है। कृपया तुरंत एक योग्य मानसिक स्वास्थ्य पेशेवर से संपर्क करें।"
          : langCode === "as"
          ? "উচ্চ ঝুঁকিৰ স্তৰ ধৰা পৰিছে। অনুগ্ৰহ কৰি তৎক্ষণাত এজন যোগ্য মানসিক স্বাস্থ্য পেছাদাৰীৰ সৈতে যোগাযোগ কৰক।"
          : "Your assessment indicates a high risk level. Please contact a qualified mental health professional immediately for proper evaluation and support. Your wellbeing is important, and professional guidance can make a significant difference.",
    });
  }

  if (recs.length === 0) {
    recs.push({
      category: "general",
      priority: "low",
      message:
        langCode === "hi"
          ? "आपके मेट्रिक्स सामान्य सीमा के भीतर हैं। नियमित निगरानी जारी रखें और स्वस्थ आदतों को बनाए रखें।"
          : langCode === "as"
          ? "আপোনাৰ মেট্ৰিকসমূহ সাধাৰণ পৰিসৰৰ ভিতৰত আছে। নিয়মিত নিৰীক্ষণ অব্যাহত ৰাখক আৰু স্বাস্থ্যকৰ অভ্যাস বজায় ৰাখক।"
          : "Your metrics are within normal ranges. Continue regular monitoring and maintain healthy habits. Remember that mental health is an ongoing journey, and small consistent actions contribute to overall wellbeing.",
    });
  }

  return recs;
}

async function generateSummaryText(stats, language = "en") {
  const langCode = language || "en";
  
  const prompts = {
    en: `Generate a brief, empathetic summary (2-3 sentences) for a mental health report based on:
Average Stress: ${stats.summary.averageStress}/50, Happiness: ${stats.summary.averageHappiness}/50, Anxiety: ${stats.summary.averageAnxiety}/50, Mood: ${stats.summary.averageMood}/50
PHQ-9: ${stats.summary.averagePHQ9}/27, GAD-7: ${stats.summary.averageGAD7}/21, GHQ: ${stats.summary.averageGHQ}/36
Risk Level: ${stats.summary.riskLevel}
Trends: Stress ${stats.trends.stressTrend}, Happiness ${stats.trends.happinessTrend}, Anxiety ${stats.trends.anxietyTrend}, Mood ${stats.trends.moodTrend}
Total Entries: ${stats.summary.totalEntries}

Be supportive, professional, and encouraging. Return only the summary text, no JSON.`,

    hi: `मानसिक स्वास्थ्य रिपोर्ट के लिए एक संक्षिप्त, सहानुभूतिपूर्ण सारांश (2-3 वाक्य) उत्पन्न करें:
औसत तनाव: ${stats.summary.averageStress}/50, खुशी: ${stats.summary.averageHappiness}/50, चिंता: ${stats.summary.averageAnxiety}/50, मूड: ${stats.summary.averageMood}/50
PHQ-9: ${stats.summary.averagePHQ9}/27, GAD-7: ${stats.summary.averageGAD7}/21, GHQ: ${stats.summary.averageGHQ}/36
जोखिम स्तर: ${stats.summary.riskLevel}
ट्रेंड्स: तनाव ${stats.trends.stressTrend}, खुशी ${stats.trends.happinessTrend}, चिंता ${stats.trends.anxietyTrend}, मूड ${stats.trends.moodTrend}
कुल प्रविष्टियां: ${stats.summary.totalEntries}

सहायक, पेशेवर और प्रोत्साहन देने वाला हो। केवल सारांश पाठ लौटाएं, JSON नहीं।`,

    as: `মানসিক স্বাস্থ্যৰ ৰিপোৰ্টৰ বাবে এটা সংক্ষিপ্ত, সহানুভূতিশীল সাৰাংশ (2-3 বাক্য) উৎপাদন কৰক:
গড় মানসিক চাপ: ${stats.summary.averageStress}/50, সুখ: ${stats.summary.averageHappiness}/50, উদ্বেগ: ${stats.summary.averageAnxiety}/50, মেজাজ: ${stats.summary.averageMood}/50
PHQ-9: ${stats.summary.averagePHQ9}/27, GAD-7: ${stats.summary.averageGAD7}/21, GHQ: ${stats.summary.averageGHQ}/36
ঝুঁকিৰ স্তৰ: ${stats.summary.riskLevel}
ট্ৰেণ্ড: মানসিক চাপ ${stats.trends.stressTrend}, সুখ ${stats.trends.happinessTrend}, উদ্বেগ ${stats.trends.anxietyTrend}, মেজাজ ${stats.trends.moodTrend}
মুঠ প্ৰবিষ্টি: ${stats.summary.totalEntries}

সহায়ক, পেছাদাৰী আৰু উৎসাহজনক হ'ব। কেৱল সাৰাংশ পাঠ ঘূৰাই দিয়ক, JSON নহয়।`,
  };

  const prompt = prompts[langCode] || prompts.en;
  
  const fallbackTexts = {
    en: `This report summarizes your mental health metrics over ${stats.summary.totalEntries} assessment${stats.summary.totalEntries !== 1 ? 's' : ''}. Your overall risk level is ${stats.summary.riskLevel}. ${stats.trends.stressTrend === 'improving' ? 'Stress levels are showing improvement.' : stats.trends.stressTrend === 'declining' ? 'Stress levels have increased recently.' : 'Stress levels remain stable.'} Continue monitoring your wellbeing and consider the recommendations provided.`,

    hi: `यह रिपोर्ट ${stats.summary.totalEntries} मूल्यांकन${stats.summary.totalEntries !== 1 ? 'ों' : ''} में आपके मानसिक स्वास्थ्य मेट्रिक्स को सारांशित करती है। आपका समग्र जोखिम स्तर ${stats.summary.riskLevel} है। ${stats.trends.stressTrend === 'improving' ? 'तनाव के स्तर में सुधार दिख रहा है।' : stats.trends.stressTrend === 'declining' ? 'तनाव के स्तर में हाल ही में वृद्धि हुई है।' : 'तनाव का स्तर स्थिर बना हुआ है।'} अपने कल्याण की निगरानी जारी रखें और प्रदान किए गए सुझावों पर विचार करें।`,

    as: `এই ৰিপোৰ্টটোৱে ${stats.summary.totalEntries}টা মূল্যাংকন${stats.summary.totalEntries !== 1 ? 'ত' : ''} আপোনাৰ মানসিক স্বাস্থ্যৰ মেট্ৰিকসমূহ সাৰাংশ কৰে। আপোনাৰ সামগ্ৰিক ঝুঁকিৰ স্তৰ ${stats.summary.riskLevel}। ${stats.trends.stressTrend === 'improving' ? 'মানসিক চাপৰ স্তৰ উন্নতি দেখুৱাইছে।' : stats.trends.stressTrend === 'declining' ? 'মানসিক চাপৰ স্তৰ সম্প্ৰতি বৃদ্ধি পাইছে।' : 'মানসিক চাপৰ স্তৰ স্থিৰ হৈ আছে।'} আপোনাৰ কল্যাণ নিৰীক্ষণ অব্যাহত ৰাখক আৰু প্ৰদান কৰা পৰামৰ্শসমূহ বিবেচনা কৰক।`,
  };

  const fallback = fallbackTexts[langCode] || fallbackTexts.en;
  
  return await generateWithGemini(prompt, fallback);
}

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
    "Risk Level",
    "Dementia Risk Score",
    "Dementia Risk Level",
    "Dementia Difficulty"
  ];
  const rows = [headers.join(",")];
  const metricsData = reportData.metricsData || [];
  const screeningData = reportData.screeningData || [];
  const dementiaSessions = reportData.dementiaSessions || [];
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

  dementiaSessions.forEach(ds => {
    const date = new Date(ds.updatedAt || ds.createdAt).toISOString().split("T")[0];
    dataByDate[date] = {
      ...dataByDate[date],
      dementiaRiskScore: typeof ds.riskScore === "number" ? Math.round(ds.riskScore * 100) / 100 : 0,
      dementiaRiskLevel: ds.riskLevel || "",
      dementiaDifficulty: ds.difficulty || ""
    };
  });

  Object.keys(dataByDate)
    .sort()
    .forEach(date => {
      const d = dataByDate[date];
      rows.push(
        [
          date,
          d.stress ?? "",
          d.happiness ?? "",
          d.anxiety ?? "",
          d.mood ?? "",
          d.phq9 ?? "",
          d.gad7 ?? "",
          d.ghq ?? "",
          reportData.summary.riskLevel || "low",
          d.dementiaRiskScore ?? "",
          d.dementiaRiskLevel ?? "",
          d.dementiaDifficulty ?? ""
        ].join(",")
      );
    });

  return rows.join("\n");
}

function sendPDF(reportData, res, req) {
  const t = req?.t || ((_, fallback) => fallback);

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

    doc.on("error", (error) => {
      logger.error("PDF generation stream error", { error: error.message });
      if (!res.headersSent) {
        res
          .status(500)
          .json({ success: false, error: t("report.pdfGenerationFailed", "Failed to generate PDF report") });
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="maitri-report-${Date.now()}.pdf"`
    );
    doc.pipe(res);

    doc.fontSize(22).text("Maitri Mental Health Report", {
      align: "center",
      underline: true,
    });
    doc.moveDown(1.5);
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

    doc.fontSize(16).text("Executive Summary", { underline: true });
    doc.moveDown(0.5);
    
    // Add AI-generated summary text if available
    if (reportData.summaryText) {
      doc.fontSize(11).fillColor("#333333");
      const summaryLines = doc.splitTextToSize(reportData.summaryText, pageWidth - 2 * marginX);
      summaryLines.forEach(line => {
        doc.text(line, { align: "left" });
      });
      doc.moveDown(1);
      doc.fillColor("#000000");
    }
    
    // Add key metrics in a structured format
    doc.fontSize(12).fillColor("#000000").text("Key Metrics:", { underline: false });
    doc.moveDown(0.3);
    doc.fontSize(10);
    
    const keyMetrics = [
      { label: "Average Stress Level", value: `${reportData.summary.averageStress?.toFixed(1) || 0}/50` },
      { label: "Average Happiness Level", value: `${reportData.summary.averageHappiness?.toFixed(1) || 0}/50` },
      { label: "Average Anxiety Level", value: `${reportData.summary.averageAnxiety?.toFixed(1) || 0}/50` },
      { label: "Overall Mood", value: `${reportData.summary.averageMood?.toFixed(1) || 0}/50` },
    ];
    
    if (reportData.summary.averagePHQ9 > 0 || reportData.summary.averageGAD7 > 0 || reportData.summary.averageGHQ > 0) {
      keyMetrics.push(
        { label: "PHQ-9 Score", value: `${reportData.summary.averagePHQ9?.toFixed(1) || 0}/27` },
        { label: "GAD-7 Score", value: `${reportData.summary.averageGAD7?.toFixed(1) || 0}/21` },
        { label: "GHQ Score", value: `${reportData.summary.averageGHQ?.toFixed(1) || 0}/36` }
      );
    }
    
    keyMetrics.push({ label: "Overall Risk Level", value: reportData.summary.riskLevel || "low" });
    keyMetrics.push({ label: "Total Data Points", value: reportData.summary.totalEntries || 0 });
    
    keyMetrics.forEach(({ label, value }) => {
      doc.text(`${label}: ${value}`, { indent: 10 });
    });
    
    doc.moveDown(1);

    if (reportData.dementiaSummary) {
      const dsum = reportData.dementiaSummary;
      doc.fontSize(16).text("Cognitive Impairment Assessment", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#666666");
      doc.text("This section provides insights from cognitive assessment games designed to evaluate various cognitive domains.", { align: "left" });
      doc.moveDown(0.5);
      doc.fillColor("#000000");
      
      doc.fontSize(11).text("Assessment Results:", { underline: false });
      doc.moveDown(0.3);
      doc.fontSize(10);
      doc.text(`Risk Level: ${dsum.latestRiskLevel?.charAt(0).toUpperCase() + dsum.latestRiskLevel?.slice(1) || "Low"}`, { indent: 10 });
      doc.text(`Risk Score: ${Math.round((dsum.latestRiskScore || 0) * 100)}%`, { indent: 10 });
      doc.text(`Difficulty Level: ${dsum.latestDifficulty?.charAt(0).toUpperCase() + dsum.latestDifficulty?.slice(1) || "Easy"}`, { indent: 10 });
      if (dsum.latestDate) {
        doc.text(`Assessment Date: ${new Date(dsum.latestDate).toLocaleString()}`, { indent: 10 });
      }
      doc.moveDown(0.5);
      
      doc.fontSize(11).text("Assessment Methodology:", { underline: false });
      doc.moveDown(0.3);
      doc.fontSize(9).fillColor("#555555");
      doc.text("This assessment incorporates validated cognitive testing paradigms including:", { indent: 10 });
      doc.moveDown(0.2);
      const tools = [
        "MMSE (Mini-Mental State Examination)",
        "MoCA (Montreal Cognitive Assessment)",
        "ACE-III (Addenbrooke's Cognitive Examination-III)",
        "Mini-Cog",
        "RUDAS (Rowland Universal Dementia Assessment Scale)"
      ];
      tools.forEach(tool => {
        doc.text(`• ${tool}`, { indent: 15 });
      });
      doc.moveDown(0.5);
      doc.fillColor("#000000");
      
      if (dsum.explanation) {
        doc.fontSize(11).text("Assessment Interpretation:", { underline: false });
        doc.moveDown(0.3);
        doc.fontSize(10);
        const explanationLines = doc.splitTextToSize(dsum.explanation, pageWidth - 2 * marginX - 10);
        explanationLines.forEach(line => {
          doc.text(line, { indent: 10, align: "left" });
        });
        doc.moveDown(0.5);
      }
      
      if (Array.isArray(dsum.suggestions) && dsum.suggestions.length) {
        doc.fontSize(11).text("Cognitive Health Recommendations:", { underline: false });
        doc.moveDown(0.3);
        doc.fontSize(10);
        dsum.suggestions.slice(0, 5).forEach((s, i) => {
          const suggestionLines = doc.splitTextToSize(`${i + 1}. ${s}`, pageWidth - 2 * marginX - 10);
          suggestionLines.forEach((line, lineIdx) => {
            doc.text(line, { indent: lineIdx === 0 ? 10 : 15, align: "left" });
          });
          doc.moveDown(0.2);
        });
      }
      doc.moveDown(1);
    }

    if (reportData.recommendations?.length) {
      doc.fontSize(16).text("Personalized Recommendations", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#666666");
      doc.text("Based on your assessment data, the following recommendations are provided to support your mental health journey:", { align: "left" });
      doc.moveDown(0.5);
      doc.fillColor("#000000");
      
      reportData.recommendations.forEach((r, idx) => {
        // Priority color coding
        let priorityColor = "#333333";
        if (r.priority === "urgent") priorityColor = "#d32f2f";
        else if (r.priority === "high") priorityColor = "#f57c00";
        else if (r.priority === "moderate") priorityColor = "#1976d2";
        
        doc.fontSize(11).fillColor(priorityColor);
        doc.text(`${idx + 1}. [${r.priority.toUpperCase()}]`, { continued: false });
        doc.fillColor("#000000");
        doc.fontSize(10);
        
        // Wrap long messages
        const messageLines = doc.splitTextToSize(r.message, pageWidth - 2 * marginX - 20);
        messageLines.forEach((line, lineIdx) => {
          doc.text(lineIdx === 0 ? line : line, { indent: 20, align: "left" });
        });
        
        doc.moveDown(0.4);
      });
      doc.moveDown(1);
    }

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor("#666666")
      .text(
        "This report is automatically generated by the Maitri Mental Health System.",
        { align: "center" }
      );
    doc.moveDown(0.3);
    doc
      .fontSize(8)
      .fillColor("#999999")
      .text(
        "AI-generated content is for informational purposes only and should not replace professional medical advice.",
        { align: "center" }
      );
    doc.moveDown(0.3);
    doc
      .fontSize(8)
      .fillColor("#999999")
      .text(
        "For clinical evaluation and diagnosis, please consult a qualified healthcare professional.",
        { align: "center" }
      );

    doc.end();
  } catch (err) {
    logger.error("Failed to build PDF report", { error: err.message, stack: err.stack });
    if (!res.headersSent) {
      res
        .status(500)
        .json({ success: false, error: t("report.pdfGenerationFailed", "Failed to generate PDF report") });
    }
  }
}

const downloadReport = asyncHandler(async (req, res) => {
  const t = req.t || ((_, fallback) => fallback);
  const userId = req.user?._id || req.session?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, error: t("auth.unauthorized", "Unauthorized") });
  }

  const userLanguage = req.getLanguage ? req.getLanguage() : "en";
  const format = String(req.query?.format || "json").toLowerCase();

  if (!SUPPORTED_FORMATS.includes(format)) {
    return res
      .status(400)
      .json({ success: false, error: t("report.invalidFormat", "Invalid report format") });
  }

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
      res.setHeader("Content-Disposition", `attachment; filename="maitri-report-${Date.now()}.json"`);
      res.json(reportData);
    } else if (format === "csv") {
      const csvData = convertToCSV(reportData);
      if (!csvData) {
        return res.status(204).send();
      }
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="maitri-report-${Date.now()}.csv"`
      );
      res.send(csvData);
    } else {
      sendPDF(reportData, res, req);
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
    res.status(500).json({ success: false, error: t("report.reportGenerationFailed", "Failed to generate report") });
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
