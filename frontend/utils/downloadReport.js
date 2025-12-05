import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import GuLogo from "@/images/logo.png";


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
    ghq_score: "GHQ Score"
  };
  return labels[key] || key;
};

const getMetricDescription = (key) => {
  const descriptions = {
    stress_level: "Measures perceived stress levels",
    happiness_level: "Indicates overall happiness and satisfaction",
    anxiety_level: "Assesses anxiety and worry levels",
    overall_mood_level: "Overall emotional state assessment",
    phq9_score: "Patient Health Questionnaire-9 depression screening",
    gad7_score: "Generalized Anxiety Disorder-7 screening",
    ghq_score: "General Health Questionnaire assessment"
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
    ghq_score: "Low (0-3)"
  };
  return ideals[key] || "Varies";
};


const generatePDFReport = async (normalizedChartData, metricKeys, user, API) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 18;
  let y = 18;

  
  pdf.addImage(GuLogo, "PNG", marginX, y, 24, 24);
  pdf.setFont("helvetica", "bold").setFontSize(18);
  pdf.text("Gauhati University", pageWidth / 2, y + 11, { align: "center" });
  pdf.setFont("helvetica", "normal").setFontSize(12);
  pdf.text("Guwahati, Assam, India", pageWidth / 2, y + 19, { align: "center" });
  y += 34;

  pdf.setFont("helvetica", "bold").setFontSize(15);
  pdf.text("Maitri Mental Health Report", pageWidth / 2, y, { align: "center" });
  y += 12;

  
  pdf.setFont("times", "italic").setFontSize(10);
  pdf.setTextColor(100);
  pdf.text("This report is AI-generated for self-assessment purposes only.", marginX, y, { maxWidth: pageWidth - 2*marginX });
  y += 5;
  pdf.text("Consult a licensed mental health professional for any medical evaluation.", marginX, y, { maxWidth: pageWidth - 2*marginX });
  pdf.setTextColor(0,0,0);
  y += 10;

  
  pdf.setFont("helvetica", "bold").setFontSize(13);
  pdf.text("User Profile", marginX, y);
  y += 8;
  pdf.setFont("helvetica", "normal").setFontSize(11);
  pdf.text(`Name: ${user?.name || "Guest"}`, marginX, y); y+=6;
  pdf.text(`Email: ${user?.email || "N/A"}`, marginX, y); y+=6;
  pdf.text(`Language: ${localStorage.getItem("preferredLang") || "en"}`, marginX, y); y+=12;

  
  const tableRows = metricKeys.map(key => {
    const vals = normalizedChartData[key];
    return [
      getMetricLabel(key),
      vals.join(", "),
      interpretValue(vals[0]),
      getMetricDescription(key),
      getMetricIdeal(key)
    ];
  });

  autoTable(pdf, {
    startY: y,
    head: [["Metric", "Value", "Interpretation", "Description", "Ideal Range"]],
    body: tableRows,
    theme: "grid",
    headStyles: { fillColor:[44,62,80], textColor:255, halign:"center", valign:"middle" },
    styles: { fontSize:10, cellPadding:3, overflow:"linebreak" },
    alternateRowStyles: { fillColor:[250,250,250] },
    columnStyles: { 0:{cellWidth:40}, 1:{cellWidth:25}, 2:{cellWidth:35}, 3:{cellWidth:55}, 4:{cellWidth:35} },
    margin: { left: marginX, right: marginX }
  });

  y = pdf.lastAutoTable.finalY + 20;
  pdf.setFont("times", "italic").setFontSize(10);
  pdf.setTextColor(120);
  pdf.text(`© Maitri ${new Date().getFullYear()}`, pageWidth/2, pageHeight - 10, { align: "center" });

  
  try {
    const reportData = await API.report.fetch();
    if (reportData && reportData.dementiaSummary && reportData.dementiaSummary.latestRiskScore !== undefined) {
      pdf.addPage();
      y = 18;

      pdf.addImage(GuLogo, "PNG", marginX, y, 24, 24);
      pdf.setFont("helvetica", "bold").setFontSize(18);
      pdf.text("Gauhati University", pageWidth / 2, y + 11, { align: "center" });
      pdf.setFont("helvetica", "normal").setFontSize(12);
      pdf.text("Guwahati, Assam, India", pageWidth / 2, y + 19, { align: "center" });
      y += 34;

      pdf.setFont("helvetica", "bold").setFontSize(15);
      pdf.text("Cognitive Impairment Assessment Report", pageWidth / 2, y, { align: "center" });
      y += 12;

      
      pdf.setFillColor(255, 243, 205);
      pdf.roundedRect(marginX, y, pageWidth - 2*marginX, 22, 3, 3, "FD");
      pdf.setDrawColor(255, 193, 7);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(marginX, y, pageWidth - 2*marginX, 22, 3, 3, "D");
      pdf.setFont("helvetica", "bold").setFontSize(10);
      pdf.setTextColor(139, 69, 19);
      pdf.text("⚠️ AI-Generated Assessment Warning", marginX + 6, y + 7);
      pdf.setFont("helvetica", "normal").setFontSize(8.5);
      pdf.text("The cognitive impairment assessment results below are calculated using AI technology. These results are for informational and self-assessment purposes only and should not be considered a clinical diagnosis. Please consult a licensed healthcare professional for any medical evaluation or concerns.", marginX + 6, y + 12, { maxWidth: pageWidth - 2*marginX - 12 });
      pdf.setTextColor(0, 0, 0);
      y += 28;

      const dSum = reportData.dementiaSummary;
      const riskScorePercent = Math.round((dSum.latestRiskScore || 0) * 100);
      const riskLevel = dSum.latestRiskLevel || "low";
      const riskLevelText = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
      
      pdf.setFont("helvetica", "bold").setFontSize(13);
      pdf.text("Assessment Summary", marginX, y);
      y += 10;

      const riskScoreRows = [
        ["Risk Score", `${riskScorePercent}%`, riskLevelText + " Risk"],
        ["Assessment Date", dSum.latestDate ? new Date(dSum.latestDate).toLocaleDateString() : "N/A", ""],
        ["Difficulty Level", dSum.latestDifficulty ? dSum.latestDifficulty.charAt(0).toUpperCase() + dSum.latestDifficulty.slice(1) : "N/A", ""]
      ];

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
          fontStyle: "bold"
        },
        bodyStyles: { 
          fontSize: 10, 
          cellPadding: 4,
          halign: "left"
        },
        columnStyles: { 
          0: { cellWidth: 50, fontStyle: "bold" },
          1: { cellWidth: 50, halign: "center" },
          2: { cellWidth: 50, halign: "center", textColor: riskColor }
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: marginX, right: marginX },
        styles: { overflow: "linebreak" }
      });

      y = pdf.lastAutoTable.finalY + 15;

      
      pdf.setFont("helvetica", "bold").setFontSize(13);
      pdf.text("Cognitive Metrics", marginX, y);
      y += 8;
      
      const cognitiveMetrics = [
        "📊 Reaction Time (RT) - Processing speed & attention (from Reaction Time game)",
        "🧭 Accuracy - Overall cognitive efficiency (from Pattern Recall game)",
        "🔄 Working Memory Span - Short-term memory capacity (from Digit Span & N-Back games)",
        "🧩 Executive Function - Decision-making, planning, inhibition (from Stroop Test)",
        "🧭 Visuospatial Ability - Spatial reasoning and visual processing (from Clock Drawing)",
        "🧠 Attention & Focus - Sustained attention and focus (from all games)",
        "🛎️ Processing Speed - Speed of cognitive processing (from all games)",
        "🔁 Learning Curve - Ability to learn and improve (comparing first vs last games)",
        "📉 Error Analytics - Error patterns and types (from game scores)"
      ];
      
      pdf.setFont("helvetica", "normal").setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      cognitiveMetrics.forEach(metric => {
        pdf.text(metric, marginX + 4, y);
        y += 6;
      });
      pdf.setTextColor(0, 0, 0);
      y += 8;

      
      if (dSum.explanation) {
        pdf.setFont("helvetica", "bold").setFontSize(13);
        pdf.text("Risk Explanation", marginX, y);
        y += 8;

        const explanationLines = pdf.splitTextToSize(dSum.explanation, pageWidth - 2*marginX - 8);
        const boxHeight = explanationLines.length * 5 + 10;
        
        pdf.setFillColor(245, 247, 250);
        pdf.roundedRect(marginX, y, pageWidth - 2*marginX, boxHeight, 3, 3, "FD");
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(marginX, y, pageWidth - 2*marginX, boxHeight, 3, 3, "D");
        
        pdf.setFont("helvetica", "normal").setFontSize(10);
        pdf.setTextColor(50, 50, 50);
        pdf.text(explanationLines, marginX + 4, y + 6, { maxWidth: pageWidth - 2*marginX - 8 });
        pdf.setTextColor(0, 0, 0);
        y += boxHeight + 12;
      }

      
      if (Array.isArray(dSum.suggestions) && dSum.suggestions.length > 0) {
        pdf.setFont("helvetica", "bold").setFontSize(13);
        pdf.text("Recommendations & Suggestions", marginX, y);
        y += 8;

        const suggestionsRows = dSum.suggestions.map((suggestion, idx) => [
          (idx + 1).toString(),
          suggestion
        ]);

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
            fontStyle: "bold"
          },
          bodyStyles: { 
            fontSize: 10, 
            cellPadding: 4,
            halign: "left"
          },
          columnStyles: { 
            0: { cellWidth: 15, halign: "center", fontStyle: "bold", fillColor: [240, 240, 240] },
            1: { cellWidth: "auto", halign: "left" }
          },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          margin: { left: marginX, right: marginX },
          styles: { overflow: "linebreak" }
        });

        y = pdf.lastAutoTable.finalY + 15;
      }

      pdf.setFont("times", "italic").setFontSize(10);
      pdf.setTextColor(120);
      pdf.text(`© Maitri ${new Date().getFullYear()}`, pageWidth/2, pageHeight - 10, { align: "center" });
    }
  } catch (err) {
    console.error("Failed to fetch dementia data for report:", err);
  }

  pdf.save("maitri-mental-health-report.pdf");
};


const generateCSVReport = (normalizedChartData, metricKeys) => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g,"-");
  const filename = `maitri-mental-health-report-${timestamp}.csv`;

  const headers = ["Metric", "Value", "Interpretation", "Description", "Ideal Range"];

  const metaLines = [
    `# Maitri Mental Health Report`,
    `# Generated at: ${now.toLocaleString()}`,
    `# Institution: Gauhati University`,
    `# AI-generated self-assessment, not a clinical diagnosis.`,
    "#",
    headers.join(",")
  ];

  const escapeCSV = text => `"${String(text ?? "").trim().replace(/\r?\n|\r/g," ").replace(/"/g,'""')}"`;

  const rows = metricKeys.map(key => {
    const vals = normalizedChartData[key];
    return [
      getMetricLabel(key),
      vals.join(", "),
      interpretValue(vals[0]),
      getMetricDescription(key),
      getMetricIdeal(key)
    ].map(escapeCSV).join(",");
  });

  const csvContent = "\uFEFF" + metaLines.join("\n") + "\n" + rows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};


const generateJSONReport = (normalizedChartData, metricKeys, user) => {
  const report = {
    metadata: {
      title: "Maitri Mental Health Report",
      generated_at: new Date().toISOString(),
      institution: "Gauhati University",
      disclaimer: "AI-generated self-assessment, not a clinical diagnosis."
    },
    user: {
      name: user?.name || "Guest",
      email: user?.email || "N/A",
      language: localStorage.getItem("preferredLang") || "en"
    },
    metrics: metricKeys.map(key => {
      const vals = normalizedChartData[key];
      return {
        metric: getMetricLabel(key),
        value: vals[0] || 0,
        interpretation: interpretValue(vals[0]),
        description: getMetricDescription(key),
        ideal_range: getMetricIdeal(key)
      };
    })
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "maitri-mental-health-report.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
};


export const downloadReport = async (format = "pdf", user, API) => {
  if (!user) {
    throw new Error("User data is required to generate report");
  }

  try {
    const data = await API.dashboard.get();

    const normalizedChartData = {};
    Object.keys(data.chartData || {}).forEach(key => {
      normalizedChartData[key] = Array.isArray(data.chartData[key])
        ? data.chartData[key]
        : [data.chartData[key]];
    });

    const metricKeys = Object.keys(normalizedChartData);

    switch (format) {
      case "pdf":
        await generatePDFReport(normalizedChartData, metricKeys, user, API);
        break;
      case "csv":
        generateCSVReport(normalizedChartData, metricKeys);
        break;
      case "json":
        generateJSONReport(normalizedChartData, metricKeys, user);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error("Report generation failed:", error);
    throw error;
  }
};

