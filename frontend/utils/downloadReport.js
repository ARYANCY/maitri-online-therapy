import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import GuLogo from "@/images/logo.png";
import { computeDementiaProbability } from "./probability";
import {
  calculateLinearTrend,
  predictFutureDate,
  detectThresholdCrossing,
  calculateEarlyRisk,
  predictDementiaTimeline
} from "./chartUtils";

// Constants
const PDF_CONFIG = {
  format: "a4",
  orientation: "p",
  unit: "mm",
  margin: 18,
  logoSize: 24,
};

const CHART_CAPTURE_CONFIG = {
  quality: 0.92,
  scale: 2,
  backgroundColor: "#ffffff",
  timeout: 10000,
  useCORS: true,
};

// Utility functions
const interpretValue = (val) => {
  const v = parseFloat(val);
  if (isNaN(v)) return "Unavailable";
  if (v <= 5) return "Healthy";
  if (v <= 10) return "Moderate";
  return "Severe";
};

const getMetricLabel = (key) => {
  const labels = {
    stress_level: "Stress Level",
    happiness_level: "Happiness Level",
    anxiety_level: "Anxiety Level",
    overall_mood_level: "Overall Mood",
    phq9_score: "PHQ-9 Score",
    gad7_score: "GAD-7 Score",
    ghq_score: "GHQ Score",
    reactionTimeAverage: "Reaction Time",
    accuracyPercentage: "Accuracy",
    workingMemorySpan: "Working Memory Span",
    executiveFunction: "Executive Function",
    visuospatialAccuracy: "Visuospatial Accuracy",
    attentionConsistency: "Attention Consistency",
    processingSpeed: "Processing Speed",
    learningCurve: "Learning Curve",
    errorRate: "Error Rate",
    dementia_risk_score: "Cognitive Risk Score",
  };
  return labels[key] || key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const getMetricDescription = (key) => {
  const descriptions = {
    stress_level: "Measures perceived stress levels",
    happiness_level: "Indicates overall happiness and satisfaction",
    anxiety_level: "Assesses anxiety and worry levels",
    overall_mood_level: "Overall emotional state assessment",
    phq9_score: "Patient Health Questionnaire-9 depression screening",
    gad7_score: "Generalized Anxiety Disorder-7 screening",
    ghq_score: "General Health Questionnaire assessment",
    reactionTimeAverage: "Average reaction time in milliseconds",
    accuracyPercentage: "Overall cognitive accuracy percentage",
    workingMemorySpan: "Short-term memory capacity",
    executiveFunction: "Decision-making and planning abilities",
    visuospatialAccuracy: "Spatial reasoning and visual processing",
    attentionConsistency: "Sustained attention and focus",
    processingSpeed: "Speed of cognitive processing",
    learningCurve: "Ability to learn and improve over time",
    errorRate: "Error patterns and types",
    dementia_risk_score: "Weighted cognitive impairment risk score",
  };
  return descriptions[key] || "Mental health metric";
};

const getMetricIdeal = (key) => {
  const ideals = {
    stress_level: "Low (0-5)",
    happiness_level: "High (6-10)",
    anxiety_level: "Low (0-5)",
    overall_mood_level: "Positive (6-10)",
    phq9_score: "Minimal (0-4)",
    gad7_score: "Minimal (0-4)",
    ghq_score: "Low (0-3)",
    reactionTimeAverage: "Lower is better",
    accuracyPercentage: "Higher is better (80%+)",
    workingMemorySpan: "Higher is better (5+)",
    executiveFunction: "Higher is better",
    visuospatialAccuracy: "Higher is better (80%+)",
    attentionConsistency: "Higher is better (80%+)",
    processingSpeed: "Lower is better",
    learningCurve: "Positive improvement",
    errorRate: "Lower is better (<20%)",
    dementia_risk_score: "Lower is better (<40%)",
  };
  return ideals[key] || "Varies";
};

const buildStats = (arr = []) => {
  const nums = (Array.isArray(arr) ? arr : [arr])
    .map(Number)
    .filter((n) => Number.isFinite(n));
  if (!nums.length) return { avg: "-", min: "-", max: "-", count: 0, stdDev: "-", trend: "-", latest: "-" };
  const sum = nums.reduce((a, b) => a + b, 0);
  const avg = sum / nums.length;
  const variance =
    nums.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / nums.length;
  const stdDev = Math.sqrt(variance);
  return {
    avg: avg.toFixed(1),
    min: Math.min(...nums).toFixed(1),
    max: Math.max(...nums).toFixed(1),
    count: nums.length,
    stdDev: stdDev.toFixed(2),
    trend: nums.length >= 2 ? (nums[nums.length - 1] > nums[0] ? "↑" : "↓") : "-",
    latest: nums[nums.length - 1].toFixed(1),
  };
};

// Wait for chart to be ready and visible
const safeLocalStorageGet = (key, fallback = "en") => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key) || fallback;
    }
  } catch (e) {
    console.warn("localStorage unavailable", e);
  }
  return fallback;
};

// Wait for chart to be ready and visible
const waitForChartReady = (
  maxWait = 3000,
  checkInterval = 100,
  selectors = { canvas: ".chart-wrapper canvas", wrapper: ".chart-wrapper" }
) => {
  if (typeof document === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const startTime = Date.now();
    const check = () => {
      const canvas = document.querySelector(selectors.canvas);
      const chartWrapper = document.querySelector(selectors.wrapper);
      
      if (canvas && chartWrapper) {
        const rect = canvas.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const hasContent = canvas.width > 0 && canvas.height > 0;
        
        if (isVisible && hasContent) {
          // Wait a bit more for Chart.js animations to complete
          setTimeout(() => resolve(canvas), 200);
          return;
        }
      }
      
      if (Date.now() - startTime < maxWait) {
        setTimeout(check, checkInterval);
      } else {
        resolve(null);
      }
    };
    check();
  });
};

// Optimized chart capture with Chart.js canvas support
const captureChartImage = async (selectors) => {
  if (typeof document === "undefined") return null;

  // Wait for chart to be ready
  const canvas = await waitForChartReady(3000, 100, selectors);
  
  if (!canvas) {
    console.warn("Chart canvas not found or not ready");
    return null;
  }

  try {
    // Ensure canvas is properly sized
    if (canvas.width === 0 || canvas.height === 0) {
      console.warn("Chart canvas has zero dimensions");
      return null;
    }

    // Try direct canvas export first (fastest and highest quality for Chart.js)
    // Chart.js renders directly to canvas, so toDataURL should work perfectly
    const dataUrl = canvas.toDataURL("image/png", CHART_CAPTURE_CONFIG.quality);
    
    if (dataUrl && dataUrl.length > 100 && !dataUrl.includes("data:,")) {
      console.log("[Chart Capture] Successfully captured Chart.js canvas directly");
      return dataUrl;
    }
  } catch (err) {
    console.warn("Direct canvas capture failed, trying html2canvas", err);
  }

  // Fallback to html2canvas with timeout (for edge cases)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHART_CAPTURE_CONFIG.timeout);

    // Capture the entire chart wrapper to include any labels/legends outside canvas
    const chartWrapper = document.querySelector(".chart-wrapper");
    const targetElement = chartWrapper || canvas;

    const h2c = await html2canvas(targetElement, {
      ...CHART_CAPTURE_CONFIG,
      signal: controller.signal,
      logging: false,
      useCORS: true,
      allowTaint: false,
    });

    clearTimeout(timeoutId);
    const result = h2c.toDataURL("image/png", CHART_CAPTURE_CONFIG.quality);
    console.log("[Chart Capture] Used html2canvas fallback");
    return result;
  } catch (e) {
    if (e.name === "AbortError") {
      console.error("Chart capture timeout");
    } else {
      console.error("html2canvas capture failed", e);
    }
    return null;
  }
};

// Helper to add header to PDF pages
const addPDFHeader = (pdf, pageWidth, y) => {
  pdf.addImage(GuLogo, "PNG", PDF_CONFIG.margin, y, PDF_CONFIG.logoSize, PDF_CONFIG.logoSize);
  pdf.setFont("helvetica", "bold").setFontSize(18);
  pdf.text("Gauhati University", pageWidth / 2, y + 11, { align: "center" });
  pdf.setFont("helvetica", "normal").setFontSize(12);
  pdf.text("Guwahati, Assam, India", pageWidth / 2, y + 19, { align: "center" });
  return y + 34;
};

// Helper to add disclaimer
const addDisclaimer = (pdf, pageWidth, y, marginX) => {
  pdf.setFont("times", "italic").setFontSize(9);
  pdf.setTextColor(100);
  pdf.text(
    "This report is AI-generated for self-assessment purposes only.",
    marginX,
    y,
    { maxWidth: pageWidth - 2 * marginX }
  );
  y += 4;
  pdf.text(
    "Consult a licensed mental health professional for any medical evaluation.",
    marginX,
    y,
    { maxWidth: pageWidth - 2 * marginX }
  );
  pdf.setTextColor(0, 0, 0);
  return y + 8;
};

// Generate comprehensive PDF report
const generatePDFReport = async (
  normalizedChartData,
  metricKeys,
  user,
  API,
  chartImageData,
  chartLabels = []
) => {
  const pdf = new jsPDF(PDF_CONFIG.orientation, PDF_CONFIG.unit, PDF_CONFIG.format);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = PDF_CONFIG.margin;
  let y = marginX;

  const toNumberArray = (arr = []) =>
    (Array.isArray(arr) ? arr : [arr]).map((v) => Number(v)).filter((v) => Number.isFinite(v));

  const formatDate = (d) => {
    if (!d) return "—";
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // Header
  y = addPDFHeader(pdf, pageWidth, y);

  // Title
  pdf.setFont("helvetica", "bold").setFontSize(16);
  pdf.text("Maitri Mental Health Report", pageWidth / 2, y, { align: "center" });
  y += 10;

  // Disclaimer
  y = addDisclaimer(pdf, pageWidth, y, marginX);

  // User Profile
  pdf.setFont("helvetica", "bold").setFontSize(12);
  pdf.text("User Profile", marginX, y);
  y += 7;
  pdf.setFont("helvetica", "normal").setFontSize(10);
  pdf.text(`Name: ${user?.name || "Guest"}`, marginX, y);
  y += 6;
  pdf.text(`Email: ${user?.email || "N/A"}`, marginX, y);
  y += 6;
  pdf.text(
    `Language: ${safeLocalStorageGet("preferredLang", "en")}`,
    marginX,
    y
  );
  y += 6;
  pdf.text(
    `Report Generated: ${new Date().toLocaleString()}`,
    marginX,
    y
  );
  y += 10;

  // Executive Summary Section
  pdf.setFont("helvetica", "bold").setFontSize(13);
  pdf.setTextColor(44, 62, 80);
  pdf.text("Executive Summary", marginX, y);
  y += 2;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(marginX, y, pageWidth - marginX, y);
  y += 6;
  pdf.setTextColor(0, 0, 0);

  const summaryStats = metricKeys.reduce(
    (acc, key) => {
      const stats = buildStats(normalizedChartData[key]);
      if (stats.count > 0) {
        acc.totalMetrics++;
        acc.totalDataPoints += stats.count;
      }
      return acc;
    },
    { totalMetrics: 0, totalDataPoints: 0 }
  );

  pdf.setFont("helvetica", "normal").setFontSize(9);
  pdf.text(
    `Total Metrics Tracked: ${summaryStats.totalMetrics} | Total Data Points: ${summaryStats.totalDataPoints}`,
    marginX,
    y
  );
  y += 8;

  // Cognitive Risk & Timeline (Dementia) quick summary
  const riskScoresRaw = normalizedChartData?.dementia_risk_score || [];
  const riskScores = toNumberArray(riskScoresRaw).map((s) => (s <= 1 ? s * 100 : s)); // normalize to 0-100
  const riskProbability = computeDementiaProbability({ riskScores });
  const thresholds = { low: 30, moderate: 50, high: 70 };
  const daysPerPoint = 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (riskScores.length * daysPerPoint));

  let trend = null;
  let thresholdPrediction = null;
  let earlyRisk = null;
  let timelinePrediction = null;

  if (riskScores.length >= 2) {
    trend = calculateLinearTrend(riskScores);
    thresholdPrediction = predictFutureDate(riskScores, thresholds.moderate, true, startDate, daysPerPoint);
    earlyRisk = calculateEarlyRisk(riskScores, {
      thresholds,
      higherIsWorse: true,
      startDate,
      daysPerPoint,
      riskMetric: "Cognitive Impairment Risk"
    });
    timelinePrediction = predictDementiaTimeline(riskScores, {
      startDate,
      daysPerPoint,
      criticalThreshold: 70,
      moderateThreshold: 50,
      highRiskThreshold: 80
    });
  }

  // Data point summary by metric
  const dataPointSummary = metricKeys.map((key) => ({
    label: getMetricLabel(key),
    count: Array.isArray(normalizedChartData[key]) ? normalizedChartData[key].length : 0,
  }));
  const totalDataPoints = dataPointSummary.reduce((sum, m) => sum + m.count, 0);

  // Helper to format year prediction from timeline
  const getCriticalYearPrediction = (timeline) => {
    if (!timeline || !timeline.isValid) return null;
    if (timeline.predictedDateCritical) return new Date(timeline.predictedDateCritical).getFullYear();
    if (timeline.yearsToCritical != null) {
      const nowYear = new Date().getFullYear();
      return nowYear + Math.max(0, Math.round(timeline.yearsToCritical));
    }
    return null;
  };

  pdf.setFont("helvetica", "bold").setFontSize(11);
  pdf.setTextColor(44, 62, 80);
  pdf.text("Cognitive Risk Snapshot", marginX, y);
  y += 6;
  pdf.setFont("helvetica", "normal").setFontSize(9);
  pdf.setTextColor(0, 0, 0);

  pdf.text(
    `Dementia Risk Probability: ${riskProbability.probabilityPercent?.toFixed(1) || "—"}% (${riskProbability.riskLabel || "N/A"})`,
    marginX,
    y
  );
  y += 5;
  pdf.text(
    `Trend: ${riskProbability.trend || "N/A"} | Data points: ${riskProbability.dataPoints || riskScores.length || 0}`,
    marginX,
    y
  );
  y += 5;
  if (trend) {
    pdf.text(`Trend equation: ${trend.equation} (R²: ${(trend.rSquared * 100).toFixed(1)}%)`, marginX, y);
    y += 5;
  }

  if (thresholdPrediction && thresholdPrediction.isValid) {
    const days = thresholdPrediction.daysFromNow;
    const years = days ? (days / 365.25).toFixed(1) : "—";
    pdf.text(
      `Threshold (50%) may be crossed in ~${days || "—"} days (~${years} years) on ${formatDate(thresholdPrediction.predictedDate)}`,
      marginX,
      y
    );
    y += 5;
  } else {
    pdf.text("Threshold crossing: Not projected (currently safe / stable trend)", marginX, y);
    y += 5;
  }

  if (timelinePrediction && timelinePrediction.isValid) {
    let timelineLine = "";
    if (timelinePrediction.isLowRisk) {
      timelineLine = `Low risk: ${timelinePrediction.message || "Stable or improving trend"}`;
    } else if (timelinePrediction.yearsToCritical !== null && timelinePrediction.yearsToCritical !== undefined) {
      const years = timelinePrediction.yearsToCritical;
      const months = timelinePrediction.monthsToCritical;
      const dateStr = formatDate(timelinePrediction.predictedDateCritical);
      timelineLine = `High risk in ~${years ?? "—"} years (${months ?? "—"} months), estimated date: ${dateStr}`;
    } else if (timelinePrediction.yearsToModerate !== null && timelinePrediction.yearsToModerate !== undefined) {
      const years = timelinePrediction.yearsToModerate;
      const months = timelinePrediction.monthsToModerate;
      const dateStr = formatDate(timelinePrediction.predictedDateModerate);
      timelineLine = `Moderate risk in ~${years ?? "—"} years (${months ?? "—"} months), estimated date: ${dateStr}`;
    } else {
      timelineLine = timelinePrediction.message || "Timeline prediction unavailable";
    }
    pdf.text(`Timeline: ${timelineLine}`, marginX, y, { maxWidth: pageWidth - 2 * marginX });
    y += 8;
  } else {
    pdf.text("Timeline: Not enough data for timeline prediction", marginX, y);
    y += 8;
  }

  // Data Point Summary section
  pdf.setFont("helvetica", "bold").setFontSize(11);
  pdf.setTextColor(44, 62, 80);
  pdf.text("Data Points Summary", marginX, y);
  y += 6;

  autoTable(pdf, {
    startY: y,
    head: [["Metric", "Data Points"]],
    body: dataPointSummary.map((row) => [row.label, row.count.toString()]),
    theme: "striped",
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: 255,
      halign: "center",
      valign: "middle",
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: 3,
    },
    bodyStyles: { fontSize: 9, cellPadding: 3, textColor: [33, 33, 33] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 90, fontStyle: "bold", textColor: [44, 62, 80] },
      1: { cellWidth: 25, halign: "center" },
    },
    margin: { left: marginX, right: marginX },
  });

  y = pdf.lastAutoTable.finalY + 8;

  pdf.setFont("helvetica", "normal").setFontSize(9);
  pdf.setTextColor(80);
  pdf.text(
    `Total recorded data points across all metrics: ${totalDataPoints}`,
    marginX,
    y
  );
  pdf.setTextColor(0, 0, 0);
  y += 10;

  // Metrics Overview Table Section
  pdf.setFont("helvetica", "bold").setFontSize(11);
  pdf.setTextColor(44, 62, 80);
  pdf.text("Metrics Overview", marginX, y);
  y += 6;

  // Metrics Table - Enhanced with better styling
  const tableRows = metricKeys.map((key, idx) => {
    const vals = normalizedChartData[key] || [];
    const stats = buildStats(vals);
    const status = interpretValue(vals[0]);
    
    // Determine status color
    let statusColor = [76, 175, 80]; // Green for Healthy
    if (status === "Severe") statusColor = [244, 67, 54]; // Red
    else if (status === "Moderate") statusColor = [255, 152, 0]; // Orange
    
    return {
      metric: getMetricLabel(key),
      latest: stats.latest !== "-" ? parseFloat(stats.latest).toFixed(1) : "-",
      avg: stats.avg !== "-" ? parseFloat(stats.avg).toFixed(1) : "-",
      min: stats.min !== "-" ? parseFloat(stats.min).toFixed(1) : "-",
      max: stats.max !== "-" ? parseFloat(stats.max).toFixed(1) : "-",
      count: stats.count,
      status: status,
      statusColor: statusColor,
      rowIndex: idx,
    };
  });

  autoTable(pdf, {
    startY: y,
    head: [
      [
        "Metric",
        "Latest",
        "Average",
        "Min",
        "Max",
        "Points",
        "Status",
      ],
    ],
    body: tableRows.map(row => [
      row.metric,
      row.latest,
      row.avg,
      row.min,
      row.max,
      row.count.toString(),
      row.status,
    ]),
    theme: "striped",
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: 255,
      halign: "center",
      valign: "middle",
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: 3,
    },
    bodyStyles: { 
      fontSize: 9, 
      cellPadding: 3, 
      overflow: "linebreak",
      textColor: [33, 33, 33],
    },
    alternateRowStyles: { 
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 48, fontStyle: "bold", textColor: [44, 62, 80] },
      1: { cellWidth: 22, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 20, halign: "center" },
      6: { 
        cellWidth: 28, 
        halign: "center",
        fontStyle: "bold",
      },
    },
    margin: { left: marginX, right: marginX },
    didParseCell: function(data) {
      // Color code status column
      if (data.column.index === 6 && data.row.index < tableRows.length) {
        const row = tableRows[data.row.index];
        data.cell.styles.textColor = row.statusColor;
      }
      // Highlight latest value column
      if (data.column.index === 1) {
        data.cell.styles.textColor = [25, 118, 210]; // Blue
      }
    },
  });

  y = pdf.lastAutoTable.finalY + 12;

  // Chart Image from Chart.jsx canvas - dedicated page for better quality
  if (chartImageData) {
    // Add a new page specifically for the chart to ensure it's visible and properly sized
    pdf.addPage();
    y = addPDFHeader(pdf, pageWidth, marginX);

    pdf.setFont("helvetica", "bold").setFontSize(14);
    pdf.text("Chart Visualization", pageWidth / 2, y, { align: "center" });
    y += 8;

    // Calculate optimal image dimensions
    // Try to maintain aspect ratio while fitting the page
    const maxWidth = pageWidth - 2 * marginX;
    const maxHeight = pageHeight - y - 30; // Leave space for footer
    
    // Parse image dimensions from data URL if possible, or use defaults
    let imgWidth = maxWidth;
    let imgHeight = Math.min((imgWidth * 9) / 16, maxHeight);
    
    // Try to get actual image dimensions and add to PDF
    try {
      // Load image to get dimensions
      const img = new Image();
      const imgLoaded = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = chartImageData;
      });
      
      const loadedImg = await imgLoaded;
      const aspectRatio = loadedImg.width / loadedImg.height;
      
      // Calculate dimensions maintaining aspect ratio
      if (aspectRatio > 1) {
        // Landscape
        imgWidth = Math.min(maxWidth, maxHeight * aspectRatio);
        imgHeight = imgWidth / aspectRatio;
      } else {
        // Portrait
        imgHeight = Math.min(maxHeight, maxWidth / aspectRatio);
        imgWidth = imgHeight * aspectRatio;
      }
      
      // Center the image horizontally
      const xOffset = Math.max(marginX, (pageWidth - imgWidth) / 2);
      
      // Add image to PDF with better quality
      pdf.addImage(
        chartImageData,
        "PNG",
        xOffset,
        y,
        imgWidth,
        imgHeight,
        undefined,
        "MEDIUM" // Better quality for chart visualization
      );
      
      y += imgHeight + 10;
      
      // Add caption
      pdf.setFont("helvetica", "italic").setFontSize(8);
      pdf.setTextColor(120);
      pdf.text(
        "Chart captured from Chart.jsx canvas visualization",
        pageWidth / 2,
        y,
        { align: "center" }
      );
      pdf.setTextColor(0, 0, 0);
    } catch (err) {
      console.error("Failed to add chart image to PDF:", err);
      pdf.setFont("helvetica", "normal").setFontSize(9);
      pdf.setTextColor(150);
      pdf.text("Chart image unavailable - chart may not be rendered yet", marginX, y);
      y += 8;
    }
  }

  // Detailed Summary Section
  if (y + 60 > pageHeight - 20) {
    pdf.addPage();
    y = addPDFHeader(pdf, pageWidth, marginX);
  }

  pdf.setFont("helvetica", "bold").setFontSize(13);
  pdf.setTextColor(44, 62, 80);
  pdf.text("Detailed Statistics", marginX, y);
  y += 2;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(marginX, y, pageWidth - marginX, y);
  y += 6;
  pdf.setTextColor(0, 0, 0);

  // Detailed Statistics Table - Enhanced
  const detailedRows = metricKeys.map((key, idx) => {
    const vals = normalizedChartData[key] || [];
    const stats = buildStats(vals);
    const trendSymbol = stats.trend;
    let trendColor = [100, 100, 100]; // Gray for stable
    if (trendSymbol === "↑") trendColor = [76, 175, 80]; // Green for improving
    else if (trendSymbol === "↓") trendColor = [244, 67, 54]; // Red for declining
    
    return {
      metric: getMetricLabel(key),
      avg: stats.avg !== "-" ? parseFloat(stats.avg).toFixed(2) : "-",
      min: stats.min !== "-" ? parseFloat(stats.min).toFixed(1) : "-",
      max: stats.max !== "-" ? parseFloat(stats.max).toFixed(1) : "-",
      stdDev: stats.stdDev !== "-" ? parseFloat(stats.stdDev).toFixed(2) : "-",
      trend: trendSymbol,
      trendColor: trendColor,
      ideal: getMetricIdeal(key),
      rowIndex: idx,
    };
  });

  autoTable(pdf, {
    startY: y,
    head: [["Metric", "Average", "Min", "Max", "Std Dev", "Trend", "Ideal Range"]],
    body: detailedRows.map(row => [
      row.metric,
      row.avg,
      row.min,
      row.max,
      row.stdDev,
      row.trend,
      row.ideal,
    ]),
    theme: "striped",
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: 255,
      halign: "center",
      valign: "middle",
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: 3,
    },
    bodyStyles: { 
      fontSize: 9, 
      cellPadding: 3,
      textColor: [33, 33, 33],
    },
    alternateRowStyles: { 
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: "bold", textColor: [44, 62, 80] },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 18, halign: "center", fontStyle: "bold", fontSize: 11 },
      6: { cellWidth: 32, fontSize: 8 },
    },
    margin: { left: marginX, right: marginX },
    didParseCell: function(data) {
      // Color code trend column
      if (data.column.index === 5 && data.row.index < detailedRows.length) {
        const row = detailedRows[data.row.index];
        data.cell.styles.textColor = row.trendColor;
      }
    },
  });

  y = pdf.lastAutoTable.finalY + 12;

  // Footer
  pdf.setFont("times", "italic").setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(
    `© Maitri ${new Date().getFullYear()} | Generated: ${new Date().toLocaleString()}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  // Dementia/Cognitive Assessment Page
  try {
    const reportData = await API.report.fetch();
    if (
      reportData?.dementiaSummary &&
      reportData.dementiaSummary.latestRiskScore !== undefined
    ) {
      pdf.addPage();
      y = addPDFHeader(pdf, pageWidth, marginX);

      pdf.setFont("helvetica", "bold").setFontSize(15);
      pdf.text(
        "Cognitive Impairment Assessment Report",
        pageWidth / 2,
        y,
        { align: "center" }
      );
      y += 12;

      // Warning Box
      pdf.setFillColor(255, 243, 205);
      pdf.roundedRect(marginX, y, pageWidth - 2 * marginX, 20, 3, 3, "FD");
      pdf.setDrawColor(255, 193, 7);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(marginX, y, pageWidth - 2 * marginX, 20, 3, 3, "D");
      pdf.setFont("helvetica", "bold").setFontSize(9);
      pdf.setTextColor(139, 69, 19);
      pdf.text("⚠️ AI-Generated Assessment Warning", marginX + 5, y + 6);
      pdf.setFont("helvetica", "normal").setFontSize(8);
      pdf.text(
        "These results are for informational purposes only. Consult a licensed healthcare professional for medical evaluation.",
        marginX + 5,
        y + 11,
        { maxWidth: pageWidth - 2 * marginX - 10 }
      );
      pdf.setTextColor(0, 0, 0);
      y += 26;

      const dSum = reportData.dementiaSummary;
      const riskScorePercent = Math.round((dSum.latestRiskScore || 0) * 100);
      const riskLevel = dSum.latestRiskLevel || "low";
      const riskLevelText =
        riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);

      // Calculate probability if we have chart data
      let probabilityData = null;
      if (normalizedChartData.dementia_risk_score) {
        try {
          probabilityData = computeDementiaProbability({
            riskScores: normalizedChartData.dementia_risk_score,
            metrics: {
              reactionTime: normalizedChartData.reactionTimeAverage,
              accuracy: normalizedChartData.accuracyPercentage,
              workingMemory: normalizedChartData.workingMemorySpan,
              executiveFunction: normalizedChartData.executiveFunction,
              visuospatial: normalizedChartData.visuospatialAccuracy,
              attention: normalizedChartData.attentionConsistency,
              processingSpeed: normalizedChartData.processingSpeed,
              learningCurve: normalizedChartData.learningCurve,
              errorRate: normalizedChartData.errorRate,
            },
          });
        } catch (err) {
          console.warn("Probability calculation failed:", err);
        }
      }

      // Assessment Summary
      pdf.setFont("helvetica", "bold").setFontSize(12);
      pdf.text("Assessment Summary", marginX, y);
      y += 8;

      const riskScoreRows = [
        ["Risk Score", `${riskScorePercent}%`, riskLevelText + " Risk"],
        [
          "Assessment Date",
          dSum.latestDate
            ? new Date(dSum.latestDate).toLocaleDateString()
            : "N/A",
          "",
        ],
        [
          "Difficulty Level",
          dSum.latestDifficulty
            ? dSum.latestDifficulty.charAt(0).toUpperCase() +
              dSum.latestDifficulty.slice(1)
            : "N/A",
          "",
        ],
      ];

      if (probabilityData) {
        riskScoreRows.push([
          "Deterioration Probability",
          `${probabilityData.probabilityPercent.toFixed(1)}%`,
          probabilityData.trend === "deteriorating" ? "⚠️ Increasing" : probabilityData.trend === "improving" ? "✅ Improving" : "➡️ Stable",
        ]);
        riskScoreRows.push([
          "Confidence Level",
          `${Math.round(probabilityData.confidence * 100)}%`,
          probabilityData.confidence > 0.7 ? "High" : probabilityData.confidence > 0.4 ? "Medium" : "Low",
        ]);
      }

      // Add critical-year prediction if available
      const criticalYear = getCriticalYearPrediction(timelinePrediction);
      if (criticalYear) {
        riskScoreRows.push([
          "Projected High-Risk Year",
          criticalYear.toString(),
          "Estimated year high-risk may be reached",
        ]);
      }

      // Enhanced risk assessment table with better styling
      const enhancedRiskRows = riskScoreRows.map((row, idx) => {
        let statusColor = [100, 100, 100]; // Default gray
        const metricName = row[0];
        const value = row[1];
        const status = row[2];
        
        // Color coding based on metric and value
        if (metricName.includes("Risk Score") || metricName.includes("Risk Level")) {
          if (riskLevel === "high") statusColor = [220, 53, 69]; // Red
          else if (riskLevel === "moderate") statusColor = [255, 193, 7]; // Orange/Yellow
          else statusColor = [40, 167, 69]; // Green
        } else if (metricName.includes("Probability")) {
          const probValue = parseFloat(value);
          if (probValue > 60) statusColor = [220, 53, 69]; // Red
          else if (probValue > 40) statusColor = [255, 193, 7]; // Orange
          else statusColor = [40, 167, 69]; // Green
        } else if (metricName.includes("Confidence")) {
          const confValue = parseFloat(value);
          if (confValue > 70) statusColor = [40, 167, 69]; // Green
          else if (confValue > 40) statusColor = [255, 193, 7]; // Orange
          else statusColor = [158, 158, 158]; // Gray
        } else if (status.includes("Increasing") || status.includes("⚠️")) {
          statusColor = [220, 53, 69]; // Red
        } else if (status.includes("Improving") || status.includes("✅")) {
          statusColor = [40, 167, 69]; // Green
        } else if (status.includes("Stable") || status.includes("➡️")) {
          statusColor = [100, 100, 100]; // Gray
        }
        
        return {
          metric: metricName,
          value: value,
          status: status,
          statusColor: statusColor,
          rowIndex: idx,
        };
      });

      autoTable(pdf, {
        startY: y,
        head: [["Assessment Metric", "Value", "Status"]],
        body: enhancedRiskRows.map(row => [row.metric, row.value, row.status]),
        theme: "striped",
        headStyles: {
          fillColor: [44, 62, 80],
          textColor: 255,
          halign: "center",
          valign: "middle",
          fontStyle: "bold",
          fontSize: 10,
          cellPadding: 4,
        },
        bodyStyles: { 
          fontSize: 9, 
          cellPadding: 3.5,
          textColor: [33, 33, 33],
        },
        alternateRowStyles: { 
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 58, fontStyle: "bold", textColor: [44, 62, 80] },
          1: { cellWidth: 38, halign: "center", fontStyle: "bold", fontSize: 10 },
          2: { cellWidth: 44, halign: "center", fontStyle: "bold" },
        },
        margin: { left: marginX, right: marginX },
        styles: { overflow: "linebreak" },
        didParseCell: function(data) {
          // Color code status column based on value
          if (data.column.index === 2 && data.row.index < enhancedRiskRows.length) {
            const row = enhancedRiskRows[data.row.index];
            data.cell.styles.textColor = row.statusColor;
          }
          // Highlight value column for risk score
          if (data.column.index === 1 && data.row.index < enhancedRiskRows.length) {
            const row = enhancedRiskRows[data.row.index];
            if (row.metric.includes("Risk Score") || row.metric.includes("Probability")) {
              data.cell.styles.textColor = row.statusColor;
              data.cell.styles.fontSize = 11;
            }
          }
        },
      });

      y = pdf.lastAutoTable.finalY + 12;

      // Cognitive Metrics Overview
      pdf.setFont("helvetica", "bold").setFontSize(11);
      pdf.text("Cognitive Metrics Overview", marginX, y);
      y += 7;

      const cognitiveMetricsList = [
        "Reaction Time - Processing speed & attention",
        "Accuracy - Overall cognitive efficiency",
        "Working Memory Span - Short-term memory capacity",
        "Executive Function - Decision-making & planning",
        "Visuospatial Ability - Spatial reasoning",
        "Attention & Focus - Sustained attention",
        "Processing Speed - Cognitive processing speed",
        "Learning Curve - Ability to learn over time",
        "Error Analytics - Error patterns & types",
      ];

      pdf.setFont("helvetica", "normal").setFontSize(8.5);
      pdf.setTextColor(50, 50, 50);
      cognitiveMetricsList.forEach((metric, idx) => {
        if (y + 6 > pageHeight - 20) {
          pdf.addPage();
          y = addPDFHeader(pdf, pageWidth, marginX);
        }
        pdf.text(`${idx + 1}. ${metric}`, marginX + 3, y);
        y += 5;
      });
      pdf.setTextColor(0, 0, 0);
      y += 8;

      // Risk Explanation
      if (dSum.explanation && y + 40 < pageHeight - 20) {
        pdf.setFont("helvetica", "bold").setFontSize(11);
        pdf.text("Risk Explanation", marginX, y);
        y += 7;

        const explanationLines = pdf.splitTextToSize(
          dSum.explanation,
          pageWidth - 2 * marginX - 8
        );
        const boxHeight = Math.min(explanationLines.length * 4.5 + 8, 50);

        pdf.setFillColor(245, 247, 250);
        pdf.roundedRect(
          marginX,
          y,
          pageWidth - 2 * marginX,
          boxHeight,
          3,
          3,
          "FD"
        );
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(
          marginX,
          y,
          pageWidth - 2 * marginX,
          boxHeight,
          3,
          3,
          "D"
        );

        pdf.setFont("helvetica", "normal").setFontSize(9);
        pdf.setTextColor(50, 50, 50);
        pdf.text(explanationLines, marginX + 4, y + 5, {
          maxWidth: pageWidth - 2 * marginX - 8,
        });
        pdf.setTextColor(0, 0, 0);
        y += boxHeight + 10;
      }

      // Recommendations
      if (
        Array.isArray(dSum.suggestions) &&
        dSum.suggestions.length > 0 &&
        y + 30 < pageHeight - 20
      ) {
        pdf.setFont("helvetica", "bold").setFontSize(11);
        pdf.text("Recommendations", marginX, y);
        y += 7;

        const suggestionsRows = dSum.suggestions
          .slice(0, 5)
          .map((suggestion, idx) => ({
            number: (idx + 1).toString(),
            text: suggestion,
            index: idx,
          }));

        autoTable(pdf, {
          startY: y,
          head: [["#", "Recommendation"]],
          body: suggestionsRows.map(row => [row.number, row.text]),
          theme: "striped",
          headStyles: {
            fillColor: [44, 62, 80],
            textColor: 255,
            halign: "center",
            valign: "middle",
            fontStyle: "bold",
            fontSize: 10,
            cellPadding: 4,
          },
          bodyStyles: { 
            fontSize: 9, 
            cellPadding: 3.5,
            halign: "left",
            valign: "top",
            textColor: [33, 33, 33],
          },
          columnStyles: {
            0: {
              cellWidth: 14,
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 10,
              fillColor: [240, 240, 240],
              textColor: [44, 62, 80],
            },
            1: { 
              cellWidth: "auto",
              halign: "left",
              valign: "top",
            },
          },
          alternateRowStyles: { 
            fillColor: [250, 250, 250],
          },
          margin: { left: marginX, right: marginX },
          styles: { overflow: "linebreak" },
        });

        y = pdf.lastAutoTable.finalY + 10;
      }

      // Footer
      pdf.setFont("times", "italic").setFontSize(9);
      pdf.setTextColor(120);
      pdf.text(
        `© Maitri ${new Date().getFullYear()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }
  } catch (err) {
    console.error("Failed to fetch dementia data for report:", err);
  }

  // Raw data table (chart values) - Enhanced
  const tableData = buildTableData(normalizedChartData, chartLabels);
  if (tableData.columns.length && tableData.rows.length) {
    pdf.addPage();
    y = addPDFHeader(pdf, pageWidth, marginX);
    pdf.setFont("helvetica", "bold").setFontSize(13);
    pdf.setTextColor(44, 62, 80);
    pdf.text("Complete Data Table", marginX, y);
    y += 2;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(marginX, y, pageWidth - marginX, y);
    y += 6;
    pdf.setFont("helvetica", "normal").setFontSize(9);
    pdf.setTextColor(100);
    pdf.text(
      "This table shows all recorded values for each metric across all assessment entries.",
      marginX,
      y
    );
    pdf.setTextColor(0, 0, 0);
    y += 8;

    // Format column headers
    const formattedColumns = tableData.columns.map(col => {
      if (col === "Entry") return col;
      return getMetricLabel(col);
    });

    const head = [formattedColumns];
    
    // Format body data with proper number formatting
    const body = tableData.rows.map((row, rowIdx) =>
      tableData.columns.map((col, colIdx) => {
        const value = row[col];
        if (colIdx === 0) return value; // Entry column
        if (value === "" || value === null || value === undefined) return "-";
        const numValue = Number(value);
        if (Number.isFinite(numValue)) {
          // Format numbers based on metric type
          if (col.includes("score") || col.includes("percentage") || col.includes("Accuracy")) {
            return numValue.toFixed(1);
          }
          return numValue.toFixed(2);
        }
        return String(value);
      })
    );

    // Calculate column widths dynamically
    const numCols = tableData.columns.length;
    const availableWidth = pageWidth - 2 * marginX;
    const entryColWidth = 28;
    const dataColWidth = (availableWidth - entryColWidth) / (numCols - 1);
    
    const columnStyles = { 0: { cellWidth: entryColWidth, fontStyle: "bold", textColor: [44, 62, 80] } };
    for (let i = 1; i < numCols; i++) {
      columnStyles[i] = { 
        cellWidth: Math.min(dataColWidth, 35),
        halign: "center",
        fontSize: 8,
      };
    }

    autoTable(pdf, {
      startY: y,
      head,
      body,
      theme: "striped",
      headStyles: { 
        fillColor: [44, 62, 80], 
        textColor: 255, 
        halign: "center",
        valign: "middle",
        fontStyle: "bold",
        fontSize: 9,
        cellPadding: 3,
      },
      bodyStyles: { 
        fontSize: 8, 
        cellPadding: 2.5,
        textColor: [33, 33, 33],
      },
      columnStyles,
      alternateRowStyles: { 
        fillColor: [250, 250, 250],
      },
      margin: { left: marginX, right: marginX },
      styles: { overflow: "linebreak" },
      didParseCell: function(data) {
        // Highlight entry column
        if (data.column.index === 0) {
          data.cell.styles.fillColor = [245, 245, 245];
        }
        // Format numeric values
        if (data.column.index > 0 && typeof data.cell.text === "string") {
          const numVal = parseFloat(data.cell.text);
          if (Number.isFinite(numVal)) {
            // Color code based on value ranges for certain metrics
            const colName = tableData.columns[data.column.index];
            if (colName.includes("stress") || colName.includes("anxiety")) {
              if (numVal > 30) data.cell.styles.textColor = [220, 53, 69];
              else if (numVal > 20) data.cell.styles.textColor = [255, 152, 0];
              else data.cell.styles.textColor = [76, 175, 80];
            } else if (colName.includes("happiness") || colName.includes("mood")) {
              if (numVal < 20) data.cell.styles.textColor = [220, 53, 69];
              else if (numVal < 30) data.cell.styles.textColor = [255, 152, 0];
              else data.cell.styles.textColor = [76, 175, 80];
            }
          }
        }
      },
    });
  }

  // Save PDF
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  pdf.save(`maitri-report-${timestamp}.pdf`);
};

// Optimized CSV generation
const generateCSVReport = (normalizedChartData, metricKeys) => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-");
  const filename = `maitri-mental-health-report-${timestamp}.csv`;

  const escapeCSV = (text) =>
    `"${String(text ?? "")
      .trim()
      .replace(/\r?\n|\r/g, " ")
      .replace(/"/g, '""')}"`;

  const headers = [
    "Metric",
    "Latest Value",
    "Average",
    "Min",
    "Max",
    "Data Points",
    "Status",
    "Description",
    "Ideal Range",
  ];

  const metaLines = [
    `# Maitri Mental Health Report`,
    `# Generated at: ${now.toLocaleString()}`,
    `# Institution: Gauhati University`,
    `# AI-generated self-assessment, not a clinical diagnosis.`,
    "#",
    headers.map(escapeCSV).join(","),
  ];

  const rows = metricKeys.map((key) => {
    const vals = normalizedChartData[key] || [];
    const stats = buildStats(vals);
    return [
      getMetricLabel(key),
      vals.length > 0 ? vals[vals.length - 1].toFixed(1) : "-",
      stats.avg,
      stats.min,
      stats.max,
      stats.count,
      interpretValue(vals[0]),
      getMetricDescription(key),
      getMetricIdeal(key),
    ].map(escapeCSV);
  });

  const csvContent =
    "\uFEFF" + metaLines.join("\n") + "\n" + rows.map((r) => r.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(link.href);
  }, 100);
};

// Enhanced JSON report with cognitive risk + timeline
const generateJSONReport = (normalizedChartData, metricKeys, user) => {
  const toNumberArray = (arr = []) =>
    (Array.isArray(arr) ? arr : [arr]).map((v) => Number(v)).filter((v) => Number.isFinite(v));

  const riskScores = toNumberArray(normalizedChartData?.dementia_risk_score).map((s) => (s <= 1 ? s * 100 : s));
  const thresholds = { low: 30, moderate: 50, high: 70 };
  const daysPerPoint = 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (riskScores.length * daysPerPoint));

  const prob = computeDementiaProbability({ riskScores });
  const trend = riskScores.length >= 2 ? calculateLinearTrend(riskScores) : null;
  const futurePrediction =
    riskScores.length >= 2
      ? predictFutureDate(riskScores, thresholds.moderate, true, startDate, daysPerPoint)
      : null;
  const earlyRisk =
    riskScores.length >= 2
      ? calculateEarlyRisk(riskScores, { thresholds, higherIsWorse: true, startDate, daysPerPoint })
      : null;
  const timeline =
    riskScores.length >= 2
      ? predictDementiaTimeline(riskScores, {
          startDate,
          daysPerPoint,
          criticalThreshold: 70,
          moderateThreshold: 50,
          highRiskThreshold: 80
        })
      : null;

  const report = {
    metadata: {
      title: "Maitri Mental Health Report",
      generated_at: new Date().toISOString(),
      institution: "Gauhati University",
      disclaimer: "AI-generated self-assessment, not a clinical diagnosis.",
      version: "2.1",
    },
    user: {
      name: user?.name || "Guest",
      email: user?.email || "N/A",
      language: safeLocalStorageGet("preferredLang", "en"),
    },
    summary: {
      total_metrics: metricKeys.length,
      total_data_points: metricKeys.reduce(
        (sum, key) => sum + (normalizedChartData[key]?.length || 0),
        0
      ),
      dementia_risk_probability_percent: prob?.probabilityPercent ?? null,
      dementia_risk_label: prob?.riskLabel ?? null,
      dementia_trend: prob?.trend ?? null,
      dementia_risk_points: prob?.dataPoints ?? riskScores.length,
      projected_high_risk_year: getCriticalYearPrediction(timeline),
    },
    cognitiveRisk: {
      probabilityPercent: prob?.probabilityPercent ?? null,
      riskLabel: prob?.riskLabel ?? null,
      trend: prob?.trend ?? null,
      dataPoints: prob?.dataPoints ?? riskScores.length,
      trendEquation: trend?.equation ?? null,
      rSquared: trend?.rSquared ?? null,
      thresholdPrediction: futurePrediction
        ? {
            predictedDate: futurePrediction.predictedDate ?? null,
            daysFromNow: futurePrediction.daysFromNow ?? null,
            confidence: futurePrediction.confidence ?? 0,
            isValid: futurePrediction.isValid ?? false,
            reason: futurePrediction.reason ?? null
          }
        : null,
      earlyRisk: earlyRisk
        ? {
            riskLevel: earlyRisk.riskLevel,
            earlyWarning: earlyRisk.earlyWarning,
            projectedRisk: earlyRisk.projectedRisk,
            daysToRisk: earlyRisk.daysToRisk,
            predictedDate: earlyRisk.predictedDate,
            confidence: earlyRisk.confidence
          }
        : null,
      timeline: timeline
        ? {
            isValid: timeline.isValid,
            currentRisk: timeline.currentRisk,
            yearsToModerate: timeline.yearsToModerate,
            yearsToCritical: timeline.yearsToCritical,
            yearsToHighRisk: timeline.yearsToHighRisk,
            monthsToModerate: timeline.monthsToModerate,
            monthsToCritical: timeline.monthsToCritical,
            monthsToHighRisk: timeline.monthsToHighRisk,
            predictedDateModerate: timeline.predictedDateModerate,
            predictedDateCritical: timeline.predictedDateCritical,
            predictedDateHighRisk: timeline.predictedDateHighRisk,
            isLowRisk: timeline.isLowRisk || false,
            message: timeline.message || null,
            confidence: timeline.confidence || 0
          }
        : null
    },
    table: buildTableData(normalizedChartData),
    metrics: metricKeys.map((key) => {
      const vals = normalizedChartData[key] || [];
      const stats = buildStats(vals);
      return {
        metric: getMetricLabel(key),
        key: key,
        latest_value: vals.length > 0 ? vals[vals.length - 1] : null,
        statistics: {
          average: stats.avg !== "-" ? parseFloat(stats.avg) : null,
          min: stats.min !== "-" ? parseFloat(stats.min) : null,
          max: stats.max !== "-" ? parseFloat(stats.max) : null,
          std_dev: stats.stdDev !== "-" ? parseFloat(stats.stdDev) : null,
          count: stats.count,
          trend: stats.trend,
        },
        interpretation: interpretValue(vals[0]),
        description: getMetricDescription(key),
        ideal_range: getMetricIdeal(key),
        all_values: vals,
      };
    }),
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `maitri-report-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(link.href);
  }, 100);
};

const SUPPORTED_FORMATS = ["pdf", "csv", "json"];
const MIME_BY_FORMAT = {
  pdf: "application/pdf",
  csv: "text/csv",
  json: "application/json",
};

const normalizeChartData = (chartData = {}) => {
  const normalized = {};
  Object.entries(chartData || {}).forEach(([key, val]) => {
    normalized[key] = Array.isArray(val) ? val : [val];
  });
  return normalized;
};

const buildTableData = (chartData = {}, chartLabels = []) => {
  const keys = Object.keys(chartData || {});
  if (!keys.length) return { columns: [], rows: [] };

  const maxLen = keys.reduce((len, k) => Math.max(len, (chartData[k] || []).length), 0);
  const columns = ["Entry", ...keys];
  const rows = Array.from({ length: maxLen }, (_, idx) => {
    const row = { Entry: chartLabels[idx] || idx + 1 };
    keys.forEach((k) => {
      const val = chartData[k]?.[idx];
      row[k] = Number.isFinite(Number(val)) ? Number(val) : val ?? "";
    });
    return row;
  });

  return { columns, rows };
};

const saveBlobToDisk = (payload, filename, mimeType) => {
  if (typeof document === "undefined") {
    throw new Error("Cannot download report: document is not available.");
  }

  const blob =
    payload instanceof Blob
      ? payload
      : new Blob([payload], { type: mimeType || "application/octet-stream" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const getFriendlyError = (error) => {
  if (!error) return "Unable to download report. Please try again.";

  if (error.status === 401 || error.status === 403) {
    return "Your session has expired. Please login again to download the report.";
  }

  if (error.status === 400) {
    return "The requested report format is not supported.";
  }

  if (error.message?.toLowerCase().includes("timeout")) {
    return "The report took too long to generate. Please retry in a moment.";
  }

  if (error.message?.toLowerCase().includes("network")) {
    return "Network error while downloading the report. Check your connection and try again.";
  }

  return error.message || "Failed to download report from the server.";
};

const fetchFallbackChartData = async (API) => {
  const dashboardData = await API.dashboard
    .get()
    .catch((err) => {
      console.error("Local dashboard data fetch failed:", err);
      return null;
    });

  const chartData =
    dashboardData?.chartData ||
    dashboardData?.data?.chartData ||
    {};
  const chartLabels =
    dashboardData?.chartLabels ||
    dashboardData?.data?.chartLabels ||
    [];

  return { chartData: normalizeChartData(chartData), chartLabels: Array.isArray(chartLabels) ? chartLabels : [] };
};

// Main export function with improved error handling and backend-first approach
// options: { onStatus?: (evt) => void }
export const downloadReport = async (format = "pdf", user, API, options = {}) => {
  const notify = (type, payload = {}) => {
    if (typeof options.onStatus === "function") {
      try {
        options.onStatus({ type, ...payload });
      } catch (e) {
        console.warn("[Report] onStatus handler failed:", e);
      }
    }
  };

  if (!user) {
    throw new Error("User data is required to generate report");
  }

  const normalizedFormat = String(format || "pdf").toLowerCase();
  if (!SUPPORTED_FORMATS.includes(normalizedFormat)) {
    throw new Error(`Unsupported report format: ${format}`);
  }

  if (!API?.report?.download) {
    throw new Error("Report API client is not available");
  }

  const filename = `maitri-report-${new Date().toISOString().slice(0, 10)}.${normalizedFormat}`;
  const mimeType = MIME_BY_FORMAT[normalizedFormat];

  try {
    notify("request", { format: normalizedFormat, stage: "backend" });
    const backendResp = await API.report.download(normalizedFormat);
    const payload = backendResp?.data ?? backendResp;

    if (normalizedFormat === "json") {
      if (!payload) throw new Error("Empty response from server");
      saveBlobToDisk(JSON.stringify(payload, null, 2), filename, mimeType);
      notify("success", { source: "backend", format: normalizedFormat });
      return { source: "backend", format: normalizedFormat };
    }

    if (payload instanceof Blob) {
      saveBlobToDisk(payload, filename, mimeType);
      notify("success", { source: "backend", format: normalizedFormat });
      return { source: "backend", format: normalizedFormat };
    }

    if (payload instanceof ArrayBuffer) {
      saveBlobToDisk(payload, filename, mimeType);
      notify("success", { source: "backend", format: normalizedFormat });
      return { source: "backend", format: normalizedFormat };
    }

    throw new Error("Server returned an unexpected response while generating the report");
  } catch (error) {
    const friendlyMessage = getFriendlyError(error);
    notify("warning", { source: "backend", format: normalizedFormat, message: friendlyMessage });
    console.warn("[Report] Backend download failed; attempting local fallback:", friendlyMessage, error);

    // If unauthorized, don't attempt client-side fallbacks
    if (error?.status === 401 || error?.status === 403) {
      notify("error", { source: "backend", format: normalizedFormat, message: friendlyMessage });
      throw new Error(friendlyMessage);
    }

    // Fallback using client-side data so the user still gets something
    const { chartData, chartLabels } = await fetchFallbackChartData(API);
    const metricKeys = Object.keys(chartData);

    if (!metricKeys.length) {
      notify("error", { source: "fallback", format: normalizedFormat, message: friendlyMessage });
      throw new Error(friendlyMessage);
    }

    notify("request", { format: normalizedFormat, stage: "fallback" });

    if (normalizedFormat === "pdf") {
      // Capture Chart.jsx canvas - wait for chart to be ready
      notify("request", { format: normalizedFormat, stage: "capturing_chart" });
      const chartImageData = await captureChartImage({
        canvas: options.chartSelector || ".chart-wrapper canvas",
        wrapper: options.chartWrapperSelector || ".chart-wrapper",
      }).catch((err) => {
        console.warn("[Report] Chart capture failed:", err);
        return null;
      });
      
      if (chartImageData) {
        notify("success", { format: normalizedFormat, stage: "chart_captured" });
      } else {
        notify("warning", { format: normalizedFormat, stage: "chart_not_available" });
      }
      
      await generatePDFReport(chartData, metricKeys, user, API, chartImageData, chartLabels);
      notify("success", { source: "fallback", format: normalizedFormat, message: friendlyMessage });
      return { source: "fallback", format: normalizedFormat, message: friendlyMessage };
    }

    if (normalizedFormat === "csv") {
      generateCSVReport(chartData, metricKeys);
      notify("success", { source: "fallback", format: normalizedFormat, message: friendlyMessage });
      return { source: "fallback", format: normalizedFormat, message: friendlyMessage };
    }

    generateJSONReport(chartData, metricKeys, user);
    notify("success", { source: "fallback", format: normalizedFormat, message: friendlyMessage });
    return { source: "fallback", format: normalizedFormat, message: friendlyMessage };
  }
};