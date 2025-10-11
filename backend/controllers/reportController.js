const Metrics = require("../models/metrics");
const Screening = require("../models/Screening");
const Todo = require("../models/todo");
const User = require("../models/User");
const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * Generate a comprehensive mental health report
 */
exports.generateReport = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.session?.userId;
  if (!userId) {
    logger.warn('Unauthorized report generation attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id,
    });
    return res.status(401).json({ 
      success: false,
      error: req.t("auth.unauthorized") 
    });
  }

  const userLanguage = req.getLanguage();
  const { format = 'json', period = '30' } = req.query;

  logger.info('Report generation requested', {
    userId,
    format,
    period,
    language: userLanguage,
    ip: req.ip,
    requestId: req.id,
  });

  try {
    // Get user information
    const user = await User.findById(userId).select('name email createdAt');
    if (!user) {
      logger.warn('User not found for report generation', {
        userId,
        language: userLanguage,
        requestId: req.id,
      });
      return res.status(404).json({ 
        success: false,
        error: req.t("general.notFound") 
      });
    }

    // Calculate date range
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get metrics data
    const metricsData = await Metrics.find({
      userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 }).lean();

    // Get screening data
    const screeningData = await Screening.find({
      userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 }).lean();

    // Get todos data
    const todoData = await Todo.findOne({ userId }).lean();

    if (metricsData.length === 0 && screeningData.length === 0) {
      logger.info('No data available for report', {
        userId,
        period,
        language: userLanguage,
        requestId: req.id,
      });
      return res.status(404).json({ 
        success: false,
        error: req.t("report.noData") 
      });
    }

    // Calculate statistics
    const stats = calculateStatistics(metricsData, screeningData, todoData?.tasks || []);

    // Generate report data
    const reportData = {
      user: {
        name: user.name,
        email: user.email,
        memberSince: user.createdAt
      },
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      },
      summary: stats.summary,
      trends: stats.trends,
      recommendations: generateRecommendations(stats, userLanguage),
      charts: generateChartData(metricsData, screeningData),
      todos: {
        total: todoData?.tasks?.length || 0,
        completed: todoData?.tasks?.filter(t => t.completed).length || 0,
        pending: todoData?.tasks?.filter(t => !t.completed).length || 0
      },
      generatedAt: new Date().toISOString(),
      language: userLanguage,
      labels: {
        title: req.t("report.title"),
        disclaimer: req.t("report.disclaimer"),
        userInfo: req.t("report.userInfo"),
        screeningMetrics: req.t("report.screeningMetrics"),
        visualChart: req.t("report.visualChart"),
        generatedOn: req.t("report.generatedOn"),
        language: req.t("report.language"),
        name: req.t("report.name"),
        email: req.t("report.email"),
        stressLevel: req.t("chatbot.metrics.stressLevel"),
        happinessLevel: req.t("chatbot.metrics.happinessLevel"),
        anxietyLevel: req.t("chatbot.metrics.anxietyLevel"),
        overallMood: req.t("chatbot.metrics.overallMood"),
        phq9Score: req.t("chatbot.metrics.phq9Score"),
        gad7Score: req.t("chatbot.metrics.gad7Score"),
        ghqScore: req.t("chatbot.metrics.ghqScore"),
        riskLevel: req.t("chatbot.metrics.riskLevel"),
        low: req.t("chatbot.metrics.low"),
        moderate: req.t("chatbot.metrics.moderate"),
        high: req.t("chatbot.metrics.high")
      }
    };

    logger.info('Report generated successfully', {
      userId,
      dataPoints: metricsData.length + screeningData.length,
      period,
      language: userLanguage,
      requestId: req.id,
    });

    if (format === 'pdf') {
      // TODO: Implement PDF generation
      res.json({
        success: true,
        message: req.t("report.generating"),
        reportData
      });
    } else {
      res.json({
        success: true,
        message: req.t("report.generated"),
        report: reportData
      });
    }
  } catch (err) {
    logger.error('Report generation failed', {
      userId,
      error: err.message,
      period,
      language: userLanguage,
      ip: req.ip,
      requestId: req.id,
    });
    
    res.status(500).json({ 
      success: false,
      error: req.t("report.error") 
    });
  }
});

/**
 * Download report as file
 */
exports.downloadReport = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.session?.userId;
  if (!userId) {
    return res.status(401).json({ 
      success: false,
      error: req.t("auth.unauthorized") 
    });
  }

  const userLanguage = req.getLanguage();
  const { format = 'json' } = req.query;

  logger.info('Report download requested', {
    userId,
    format,
    language: userLanguage,
    ip: req.ip,
    requestId: req.id,
  });

  try {
    // Generate report data (reuse the same logic)
    const reportData = await generateReportData(userId, userLanguage, req);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="maitri-report-${Date.now()}.json"`);
      res.json(reportData);
    } else if (format === 'csv') {
      const csvData = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="maitri-report-${Date.now()}.csv"`);
      res.send(csvData);
    } else {
      res.status(400).json({ 
        success: false,
        error: req.t("general.badRequest") 
      });
    }

    logger.info('Report downloaded successfully', {
      userId,
      format,
      language: userLanguage,
      requestId: req.id,
    });
  } catch (err) {
    logger.error('Report download failed', {
      userId,
      error: err.message,
      format,
      language: userLanguage,
      ip: req.ip,
      requestId: req.id,
    });
    
    res.status(500).json({ 
      success: false,
      error: req.t("report.error") 
    });
  }
});

// Helper functions

function calculateStatistics(metricsData, screeningData, todos) {
  const totalEntries = metricsData.length;
  
  if (totalEntries === 0) {
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
        riskLevel: 'low'
      },
      trends: {
        stressTrend: 'stable',
        happinessTrend: 'stable',
        anxietyTrend: 'stable',
        moodTrend: 'stable'
      }
    };
  }

  // Calculate averages
  const avgStress = metricsData.reduce((sum, m) => sum + (m.stress_level || 0), 0) / totalEntries;
  const avgHappiness = metricsData.reduce((sum, m) => sum + (m.happiness_level || 0), 0) / totalEntries;
  const avgAnxiety = metricsData.reduce((sum, m) => sum + (m.anxiety_level || 0), 0) / totalEntries;
  const avgMood = metricsData.reduce((sum, m) => sum + (m.overall_mood_level || 0), 0) / totalEntries;
  
  const avgPHQ9 = screeningData.reduce((sum, s) => sum + (s.phq9_score || 0), 0) / Math.max(screeningData.length, 1);
  const avgGAD7 = screeningData.reduce((sum, s) => sum + (s.gad7_score || 0), 0) / Math.max(screeningData.length, 1);
  const avgGHQ = screeningData.reduce((sum, s) => sum + (s.ghq_score || 0), 0) / Math.max(screeningData.length, 1);

  // Determine risk level
  let riskLevel = 'low';
  if (avgPHQ9 > 15 || avgGAD7 > 10 || avgGHQ > 20) {
    riskLevel = 'high';
  } else if (avgPHQ9 > 10 || avgGAD7 > 7 || avgGHQ > 15) {
    riskLevel = 'moderate';
  }

  // Calculate trends (comparing first half vs second half)
  const midPoint = Math.floor(totalEntries / 2);
  const firstHalf = metricsData.slice(0, midPoint);
  const secondHalf = metricsData.slice(midPoint);

  const calculateTrend = (firstHalf, secondHalf, field) => {
    if (firstHalf.length === 0 || secondHalf.length === 0) return 'stable';
    
    const firstAvg = firstHalf.reduce((sum, m) => sum + (m[field] || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + (m[field] || 0), 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    if (Math.abs(diff) < 2) return 'stable';
    return diff > 0 ? 'improving' : 'declining';
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
      stressTrend: calculateTrend(firstHalf, secondHalf, 'stress_level'),
      happinessTrend: calculateTrend(firstHalf, secondHalf, 'happiness_level'),
      anxietyTrend: calculateTrend(firstHalf, secondHalf, 'anxiety_level'),
      moodTrend: calculateTrend(firstHalf, secondHalf, 'overall_mood_level')
    }
  };
}

function generateRecommendations(stats, language) {
  const recommendations = [];
  
  if (stats.summary.averageStress > 30) {
    recommendations.push({
      category: 'stress',
      priority: 'high',
      message: language === 'hi' 
        ? 'तनाव का स्तर उच्च है। ध्यान और व्यायाम की सलाह दी जाती है।'
        : language === 'as'
        ? 'মানসিক চাপৰ স্তৰ উচ্চ। ধ্যান আৰু ব্যায়ামৰ পৰামৰ্শ দিয়া হয়।'
        : 'Stress levels are high. Consider meditation and exercise.'
    });
  }
  
  if (stats.summary.averageHappiness < 20) {
    recommendations.push({
      category: 'happiness',
      priority: 'high',
      message: language === 'hi'
        ? 'खुशी का स्तर कम है। सामाजिक गतिविधियों में भाग लेने की सलाह दी जाती है।'
        : language === 'as'
        ? 'সুখৰ স্তৰ কম। সামাজিক কাৰ্যকলাপত অংশগ্ৰহণৰ পৰামৰ্শ দিয়া হয়।'
        : 'Happiness levels are low. Consider engaging in social activities.'
    });
  }
  
  if (stats.summary.riskLevel === 'high') {
    recommendations.push({
      category: 'professional',
      priority: 'urgent',
      message: language === 'hi'
        ? 'पेशेवर मदद की सिफारिश की जाती है। कृपया एक योग्य काउंसलर से संपर्क करें।'
        : language === 'as'
        ? 'পেছাদাৰী সহায়ৰ পৰামৰ্শ দিয়া হয়। অনুগ্ৰহ কৰি এজন যোগ্য কাউন্সেলৰৰ সৈতে যোগাযোগ কৰক।'
        : 'Professional help is recommended. Please contact a qualified counselor.'
    });
  }
  
  return recommendations;
}

function generateChartData(metricsData, screeningData) {
  const chartData = {
    labels: metricsData.map(m => new Date(m.createdAt).toISOString().split('T')[0]),
    datasets: [
      {
        label: 'Stress Level',
        data: metricsData.map(m => m.stress_level || 0),
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255, 107, 107, 0.1)'
      },
      {
        label: 'Happiness Level',
        data: metricsData.map(m => m.happiness_level || 0),
        borderColor: '#4ecdc4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)'
      },
      {
        label: 'Anxiety Level',
        data: metricsData.map(m => m.anxiety_level || 0),
        borderColor: '#ffe66d',
        backgroundColor: 'rgba(255, 230, 109, 0.1)'
      },
      {
        label: 'Overall Mood',
        data: metricsData.map(m => m.overall_mood_level || 0),
        borderColor: '#a8e6cf',
        backgroundColor: 'rgba(168, 230, 207, 0.1)'
      }
    ]
  };
  
  return chartData;
}

function convertToCSV(reportData) {
  const headers = [
    'Date',
    'Stress Level',
    'Happiness Level',
    'Anxiety Level',
    'Overall Mood',
    'PHQ-9 Score',
    'GAD-7 Score',
    'GHQ Score'
  ];
  
  const rows = [headers.join(',')];
  
  // Add data rows (this would need to be implemented based on actual data structure)
  // For now, return a simple CSV structure
  
  return rows.join('\n');
}

async function generateReportData(userId, userLanguage, req) {
  // This is a simplified version - in production, you'd want to cache this
  const user = await User.findById(userId).select('name email createdAt');
  const metricsData = await Metrics.find({ userId }).sort({ createdAt: 1 }).lean();
  const screeningData = await Screening.find({ userId }).sort({ createdAt: 1 }).lean();
  const todoData = await Todo.findOne({ userId }).lean();
  
  const stats = calculateStatistics(metricsData, screeningData, todoData?.tasks || []);
  
  return {
    user: {
      name: user.name,
      email: user.email,
      memberSince: user.createdAt
    },
    summary: stats.summary,
    trends: stats.trends,
    recommendations: generateRecommendations(stats, userLanguage),
    generatedAt: new Date().toISOString(),
    language: userLanguage
  };
}
