import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import GuLogo from "@/images/logo.png";
import { computeDementiaProbability } from "./probability";

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

// Optimized chart capture with timeout and better error handling
const captureChartImage = async () => {
  const canvas = document.querySelector(".chart-wrapper canvas");
  if (!canvas) {
    console.warn("Chart canvas not found");
    return null;
  }

  try {
    // Try direct canvas export first (fastest)
    const dataUrl = canvas.toDataURL("image/png", CHART_CAPTURE_CONFIG.quality);
    if (dataUrl && dataUrl.length > 100) {
      return dataUrl;
    }
  } catch (err) {
    console.warn("Direct canvas capture failed, trying html2canvas", err);
  }

  // Fallback to html2canvas with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHART_CAPTURE_CONFIG.timeout);

    const h2c = await html2canvas(canvas, {
      ...CHART_CAPTURE_CONFIG,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return h2c.toDataURL("image/png", CHART_CAPTURE_CONFIG.quality);
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
  chartImageData
) => {
  const pdf = new jsPDF(PDF_CONFIG.orientation, PDF_CONFIG.unit, PDF_CONFIG.format);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = PDF_CONFIG.margin;
  let y = marginX;

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
    `Language: ${localStorage.getItem("preferredLang") || "en"}`,
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

  // Executive Summary
  pdf.setFont("helvetica", "bold").setFontSize(12);
  pdf.text("Executive Summary", marginX, y);
  y += 7;

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

  // Metrics Table
  const tableRows = metricKeys.map((key) => {
    const vals = normalizedChartData[key] || [];
    const stats = buildStats(vals);
    return [
      getMetricLabel(key),
      stats.latest,
      stats.avg,
      stats.min,
      stats.max,
      stats.count,
      interpretValue(vals[0]),
    ];
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
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: 255,
      halign: "center",
      valign: "middle",
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 2.5, overflow: "linebreak" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: "bold" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 18, halign: "center" },
      5: { cellWidth: 18, halign: "center" },
      6: { cellWidth: 25, halign: "center" },
    },
    margin: { left: marginX, right: marginX },
  });

  y = pdf.lastAutoTable.finalY + 12;

  // Chart Image
  if (chartImageData) {
    if (y + 80 > pageHeight - 20) {
      pdf.addPage();
      y = addPDFHeader(pdf, pageWidth, marginX);
    }

    pdf.setFont("helvetica", "bold").setFontSize(11);
    pdf.text("Visual Chart Snapshot", marginX, y);
    y += 6;

    const imgWidth = pageWidth - 2 * marginX;
    const imgHeight = Math.min((imgWidth * 9) / 16, 80);

    try {
      pdf.addImage(
        chartImageData,
        "PNG",
        marginX,
        y,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      y += imgHeight + 10;
    } catch (err) {
      console.error("Failed to add chart image:", err);
      pdf.setFont("helvetica", "normal").setFontSize(9);
      pdf.setTextColor(150);
      pdf.text("Chart image unavailable", marginX, y);
      y += 8;
    }
  }

  // Detailed Summary Section
  if (y + 60 > pageHeight - 20) {
    pdf.addPage();
    y = addPDFHeader(pdf, pageWidth, marginX);
  }

  pdf.setFont("helvetica", "bold").setFontSize(12);
  pdf.text("Detailed Statistics", marginX, y);
  y += 7;

  const detailedRows = metricKeys.map((key) => {
    const vals = normalizedChartData[key] || [];
    const stats = buildStats(vals);
    return [
      getMetricLabel(key),
      stats.avg,
      stats.min,
      stats.max,
      stats.stdDev,
      stats.trend,
      getMetricIdeal(key),
    ];
  });

  autoTable(pdf, {
    startY: y,
    head: [["Metric", "Avg", "Min", "Max", "Std Dev", "Trend", "Ideal"]],
    body: detailedRows,
    theme: "grid",
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: 255,
      halign: "center",
      valign: "middle",
    },
    styles: { fontSize: 9, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 15, halign: "center" },
      6: { cellWidth: 30 },
    },
    margin: { left: marginX, right: marginX },
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

      let riskColor = [40, 167, 69];
      if (riskLevel === "high") riskColor = [220, 53, 69];
      else if (riskLevel === "moderate") riskColor = [255, 193, 7];

      autoTable(pdf, {
        startY: y,
        head: [["Metric", "Value", "Status"]],
        body: riskScoreRows,
        theme: "grid",
        headStyles: {
          fillColor: [44, 62, 80],
          textColor: 255,
          halign: "center",
          valign: "middle",
          fontStyle: "bold",
        },
        bodyStyles: { fontSize: 9, cellPadding: 3, halign: "left" },
        columnStyles: {
          0: { cellWidth: 55, fontStyle: "bold" },
          1: { cellWidth: 40, halign: "center" },
          2: { cellWidth: 45, halign: "center", textColor: riskColor },
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: marginX, right: marginX },
        styles: { overflow: "linebreak" },
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
          .map((suggestion, idx) => [(idx + 1).toString(), suggestion]);

        autoTable(pdf, {
          startY: y,
          head: [["#", "Recommendation"]],
          body: suggestionsRows,
          theme: "grid",
          headStyles: {
            fillColor: [44, 62, 80],
            textColor: 255,
            halign: "center",
            valign: "middle",
            fontStyle: "bold",
          },
          bodyStyles: { fontSize: 9, cellPadding: 3, halign: "left" },
          columnStyles: {
            0: {
              cellWidth: 12,
              halign: "center",
              fontStyle: "bold",
              fillColor: [240, 240, 240],
            },
            1: { cellWidth: "auto", halign: "left" },
          },
          alternateRowStyles: { fillColor: [250, 250, 250] },
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

// Enhanced JSON report
const generateJSONReport = (normalizedChartData, metricKeys, user) => {
  const report = {
    metadata: {
      title: "Maitri Mental Health Report",
      generated_at: new Date().toISOString(),
      institution: "Gauhati University",
      disclaimer: "AI-generated self-assessment, not a clinical diagnosis.",
      version: "2.0",
    },
    user: {
      name: user?.name || "Guest",
      email: user?.email || "N/A",
      language: localStorage.getItem("preferredLang") || "en",
    },
    summary: {
      total_metrics: metricKeys.length,
      total_data_points: metricKeys.reduce(
        (sum, key) => sum + (normalizedChartData[key]?.length || 0),
        0
      ),
    },
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

// Main export function with improved error handling
export const downloadReport = async (format = "pdf", user, API) => {
  if (!user) {
    throw new Error("User data is required to generate report");
  }

  try {
    // Prefer backend-generated report (model/controller) for full data coverage
    try {
      const resp = await API.report?.download?.(format);
      if (resp?.data) {
        const mime =
          format === "pdf"
            ? "application/pdf"
            : format === "csv"
              ? "text/csv"
              : "application/json";
        const blob = new Blob([resp.data], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `maitri-report.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch (backendErr) {
      console.warn("Backend report download failed; falling back to local generation:", backendErr);
    }

    // Local generation fallback
    const data = await API.dashboard.get().catch((err) => {
      console.error("Local dashboard data fetch failed:", err);
      return { chartData: {} };
    });
    let chartData = data?.chartData || {};
    let keys = Object.keys(chartData);
    if (!keys.length) {
      // If client-side data missing, try backend JSON to populate chartData
      try {
        const reportJson = await API.report?.fetch?.("json");
        if (reportJson?.chartData && Object.keys(reportJson.chartData).length) {
          chartData = reportJson.chartData;
          keys = Object.keys(chartData);
        }
      } catch (err) {
        console.warn("Backend JSON report fetch failed:", err);
      }

      // If still empty, attempt backend download once (file)
      if (!keys.length) {
        try {
          const resp = await API.report?.download?.(format);
          if (resp?.data) {
            const mime =
              format === "pdf"
                ? "application/pdf"
                : format === "csv"
                  ? "text/csv"
                  : "application/json";
            const blob = new Blob([resp.data], { type: mime });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `maitri-report.${format}`;
            a.click();
            URL.revokeObjectURL(url);
            return;
          }
        } catch (err) {
          console.error("Backend report download failed:", err);
        }
      }

      // Last resort: placeholder so PDF/CSV/JSON still generate
      if (!keys.length) {
        chartData = { placeholder: [0] };
        keys = ["placeholder"];
      }
    }

    if (format === "json") {
      const blob = new Blob([JSON.stringify(chartData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "maitri-report.json";
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (format === "csv") {
      const lines = ["metric,latest,avg,min,max,count"];
      keys.forEach((k) => {
        const vals = chartData[k] || [];
        const st = stat(vals);
        lines.push([label(k), fmt(vals.at(-1)), st.avg, st.min, st.max, st.count].join(","));
      });
      const blob = new Blob([lines.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "maitri-report.csv";
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // PDF (screening + cognitive pages with summary)
    const pdf = new jsPDF("p", "mm", "a4");

    addHeader(pdf, "Maitri Mental Health Report");
    renderTable(
      pdf,
      [["Metric", "Latest", "Avg", "Min", "Max", "Points"]],
      screeningRows(chartData),
      34
    );
    renderSummary(pdf, chartData, (pdf.lastAutoTable?.finalY || 80) + 10);

    pdf.addPage();
    addPDFHeader(pdf, "Cognitive Assessment");
    renderTable(
      pdf,
      [["Metric", "Latest", "Avg", "Min", "Max", "Points"]],
      cognitiveRows(chartData),
      34
    );
    renderSummary(pdf, chartData, (pdf.lastAutoTable?.finalY || 80) + 10);

    pdf.save("maitri-report.pdf");
  } catch (error) {
    console.error("Report generation failed:", error);
  }
};