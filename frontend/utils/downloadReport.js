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

// Wait for chart to be ready and visible
const waitForChartReady = (maxWait = 3000, checkInterval = 100) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const check = () => {
      const canvas = document.querySelector(".chart-wrapper canvas");
      const chartWrapper = document.querySelector(".chart-wrapper");
      
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
const captureChartImage = async () => {
  // Wait for chart to be ready
  const canvas = await waitForChartReady();
  
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

  // Raw data table (chart values)
  const tableData = buildTableData(normalizedChartData, chartLabels);
  if (tableData.columns.length && tableData.rows.length) {
    pdf.addPage();
    y = addPDFHeader(pdf, pageWidth, marginX);
    pdf.setFont("helvetica", "bold").setFontSize(12);
    pdf.text("All Metrics (Table View)", marginX, y);
    y += 8;

    const head = [tableData.columns];
    const body = tableData.rows.map((row) =>
      tableData.columns.map((col) => row[col] ?? "")
    );

    autoTable(pdf, {
      startY: y,
      head,
      body,
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [44, 62, 80], textColor: 255, halign: "center" },
      columnStyles: { 0: { cellWidth: 26 } },
      margin: { left: marginX, right: marginX },
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
      const chartImageData = await captureChartImage().catch((err) => {
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