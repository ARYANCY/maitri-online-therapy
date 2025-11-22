import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import Chart from "../components/Chart";
import Todo from "../components/Todo";
import Navbar from "../components/Navbar";
import API from "../utils/axiosClient";
import Reminder from "../components/reminder";
import Game from "./game";
import "../css/Dashboard.css";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import GuLogo from "@/images/logo.png";
import autoTable from "jspdf-autotable";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const reportRef = useRef();

  const [activeTab, setActiveTab] = useState("chatbot");
  const [user, setUser] = useState(null);
  const [chartData, setChartData] = useState({});
  const [chartLabels, setChartLabels] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState({ user: true, dashboard: true, todos: true });
  const [error, setError] = useState({ user: null, dashboard: null, todos: null });
  const [downloading, setDownloading] = useState(false);
  const [showFormatPopup, setShowFormatPopup] = useState(false);
  const isFetchingRef = useRef(false);
  const lastFetchAtRef = useRef(0);

  // --- Fetch user and set language ---
  const fetchUser = useCallback(async () => {
    try {
      const data = await API.auth.checkSession();
      if (!data?.user) {
        // Clear session storage
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("sessionTime");
        navigate("/");
        return;
      }

      setUser(data.user);

      // Store session info properly
      if (data.user) {
        localStorage.setItem("userId", data.user._id || "");
        localStorage.setItem("userEmail", data.user.email || "");
        localStorage.setItem("userName", data.user.name || "");
        localStorage.setItem("isAdmin", data.user.isAdmin ? "true" : "false");
        localStorage.setItem("sessionTime", Date.now().toString());
      }

      // Only change language if needed
      const prefLang = data.user.preferredLang || localStorage.getItem("preferredLang") || "en";
      if (i18n.language !== prefLang) i18n.changeLanguage(prefLang);
      localStorage.setItem("preferredLang", prefLang);

      setError(prev => ({ ...prev, user: null }));
    } catch (err) {
      console.error("Session check failed:", err);
      setError(prev => ({ ...prev, user: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  }, [navigate, i18n]);

  // --- Fetch dashboard data ---
  const fetchDashboardData = useCallback(async () => {
    if (!user || isFetchingRef.current) return;

    const now = Date.now();
    if (now - lastFetchAtRef.current < 800) return;
    lastFetchAtRef.current = now;

    isFetchingRef.current = true;
    setLoading(prev => ({ ...prev, dashboard: true, todos: true }));

    try {
      const data = await API.dashboard.get({ includeChat: true });

      const normalizedChartData = {};
      Object.entries(data.chartData || {}).forEach(([key, val]) => {
        normalizedChartData[key] = Array.isArray(val) ? val : [val];
      });

      setChartData(normalizedChartData);
      setChartLabels(Array.isArray(data.chartLabels) ? data.chartLabels : []);
      setTodos(Array.isArray(data.todos) ? data.todos : []);
      setError(prev => ({ ...prev, dashboard: null }));
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      if (err.message.includes("401")) navigate("/");
      else setError(prev => ({ ...prev, dashboard: err.message || t("dashboard.error.fetchFailed", "Failed to fetch dashboard") }));
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false, todos: false }));
      isFetchingRef.current = false;
    }
  }, [navigate, user]);


  // --- Handle todos update ---
  const handleTodosUpdate = useCallback(async (updatedTodos) => {
    setLoading(prev => ({ ...prev, todos: true }));

    try {
      await API.dashboard.updateTasks(updatedTodos, { preserveChat: true });
      setTodos(updatedTodos);
      setError(prev => ({ ...prev, todos: null }));
    } catch (err) {
      console.error("Failed to update tasks:", err);
      setError(prev => ({ ...prev, todos: err.message || t("dashboard.error.updateTodosFailed", "Todo update failed") }));
    } finally {
      setLoading(prev => ({ ...prev, todos: false }));
    }
  }, []);

  // --- Download report (PDF/CSV/JSON) ---
  const handleDownloadReport = useCallback(async (format = "pdf") => {
    if (!user) return;
    setDownloading(true);

    try {
      const data = await API.dashboard.get();

      // Normalize chart data
      const normalizedChartData = {};
      Object.keys(data.chartData || {}).forEach(key => {
        normalizedChartData[key] = Array.isArray(data.chartData[key])
          ? data.chartData[key]
          : [data.chartData[key]];
      });

      // For PDF, always use English translations
      const tPdf = format === "pdf" ? i18n.getFixedT("en") : t;

      const interpretValue = (val) => {
        const v = parseFloat(val);
        if (isNaN(v)) return tPdf("interpretation.unavailable");
        if (v <= 5) return tPdf("interpretation.healthy");
        if (v <= 10) return tPdf("interpretation.moderate");
        return tPdf("interpretation.severe");
      };

      const metricKeys = Object.keys(normalizedChartData);

      // --- PDF Export ---
      if (format === "pdf") {
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const marginX = 18;
        let y = 18;

        // ========== PAGE 1: EXISTING REPORT ==========
        pdf.addImage(GuLogo, "PNG", marginX, y, 24, 24);
        pdf.setFont("helvetica", "bold").setFontSize(18);
        pdf.text(tPdf("university.name"), pageWidth / 2, y + 11, { align: "center" });
        pdf.setFont("helvetica", "normal").setFontSize(12);
        pdf.text(tPdf("university.location"), pageWidth / 2, y + 19, { align: "center" });
        y += 34;

        pdf.setFont("helvetica", "bold").setFontSize(15);
        pdf.text(tPdf("report.title"), pageWidth / 2, y, { align: "center" });
        y += 12;

        pdf.setFont("times", "italic").setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(tPdf("report.disclaimer.1"), marginX, y, { maxWidth: pageWidth - 2*marginX });
        y += 5;
        pdf.text(tPdf("report.disclaimer.2"), marginX, y, { maxWidth: pageWidth - 2*marginX });
        pdf.setTextColor(0,0,0);
        y += 10;

        pdf.setFont("helvetica", "bold").setFontSize(13);
        pdf.text(tPdf("section.userProfile"), marginX, y);
        y += 8;
        pdf.setFont("helvetica", "normal").setFontSize(11);
        pdf.text(`${tPdf("user.name")}: ${user?.name || tPdf("user.guest")}`, marginX, y); y+=6;
        pdf.text(`${tPdf("user.email")}: ${user?.email || "N/A"}`, marginX, y); y+=6;
        pdf.text(`${tPdf("user.language")}: ${localStorage.getItem("preferredLang") || "en"}`, marginX, y); y+=12;

        const tableRows = metricKeys.map(key => {
          const vals = normalizedChartData[key];
          return [
            tPdf(`metrics.${key}.label`),
            vals.join(", "),
            interpretValue(vals[0]),
            tPdf(`metrics.${key}.description`),
            tPdf(`metrics.${key}.ideal`)
          ];
        });

        autoTable(pdf, {
          startY: y,
          head: [[tPdf("table.metric"), tPdf("table.value"), tPdf("table.interpretation"), tPdf("table.description"), tPdf("table.ideal")]],
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
        pdf.text(`${tPdf("footer.text")} ${new Date().getFullYear()}`, pageWidth/2, pageHeight - 10, { align: "center" });

        // ========== PAGE 2: DEMENTIA ASSESSMENT ==========
        try {
          const reportData = await API.report.fetch();
          if (reportData && reportData.dementiaSummary && reportData.dementiaSummary.latestRiskScore !== undefined) {
            pdf.addPage();
            y = 18;

            // Header
            pdf.addImage(GuLogo, "PNG", marginX, y, 24, 24);
            pdf.setFont("helvetica", "bold").setFontSize(18);
            pdf.text(tPdf("university.name"), pageWidth / 2, y + 11, { align: "center" });
            pdf.setFont("helvetica", "normal").setFontSize(12);
            pdf.text(tPdf("university.location"), pageWidth / 2, y + 19, { align: "center" });
            y += 34;

            pdf.setFont("helvetica", "bold").setFontSize(15);
            pdf.text(tPdf("chart.dementiaMetrics", "Dementia Assessment Report"), pageWidth / 2, y, { align: "center" });
            y += 12;

            // AI WARNING BOX
            pdf.setFillColor(255, 193, 7); // Yellow background
            pdf.roundedRect(marginX, y, pageWidth - 2*marginX, 20, 3, 3, "FD");
            pdf.setFont("helvetica", "bold").setFontSize(11);
            pdf.setTextColor(139, 69, 19); // Dark brown text
            pdf.text("⚠️ " + tPdf("report.dementiaWarning", "AI-Generated Assessment Warning"), marginX + 5, y + 8);
            pdf.setFont("helvetica", "normal").setFontSize(9);
            pdf.text(tPdf("report.dementiaWarningText", "The dementia risk assessment results below are calculated using AI technology. These results are for informational and self-assessment purposes only and should not be considered a clinical diagnosis. Please consult a licensed healthcare professional for any medical evaluation or concerns."), marginX + 5, y + 14, { maxWidth: pageWidth - 2*marginX - 10 });
            pdf.setTextColor(0, 0, 0);
            y += 25;

            const dSum = reportData.dementiaSummary;
            
            // Risk Score Section
            pdf.setFont("helvetica", "bold").setFontSize(13);
            pdf.text(tPdf("chart.dementiaRisk", "Dementia Risk Score"), marginX, y);
            y += 8;
            pdf.setFont("helvetica", "normal").setFontSize(11);
            
            const riskScorePercent = Math.round((dSum.latestRiskScore || 0) * 100);
            const riskLevel = dSum.latestRiskLevel || "low";
            
            // Color code based on risk level
            if (riskLevel === "high") pdf.setTextColor(220, 53, 69); // Red
            else if (riskLevel === "moderate") pdf.setTextColor(255, 193, 7); // Yellow
            else pdf.setTextColor(40, 167, 69); // Green
            
            pdf.setFont("helvetica", "bold").setFontSize(14);
            pdf.text(`${riskScorePercent}%`, marginX, y);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont("helvetica", "normal").setFontSize(11);
            pdf.text(`(${tPdf(`report.riskLevel.${riskLevel}`, riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1))} ${tPdf("report.risk", "Risk")})`, marginX + 25, y);
            y += 8;

            if (dSum.latestDate) {
              pdf.text(`${tPdf("report.assessmentDate", "Assessment Date")}: ${new Date(dSum.latestDate).toLocaleDateString()}`, marginX, y);
              y += 6;
            }
            if (dSum.latestDifficulty) {
              pdf.text(`${tPdf("report.difficulty", "Difficulty Level")}: ${dSum.latestDifficulty.charAt(0).toUpperCase() + dSum.latestDifficulty.slice(1)}`, marginX, y);
              y += 8;
            }

            // Explanation Section
            if (dSum.explanation) {
              pdf.setFont("helvetica", "bold").setFontSize(13);
              pdf.text(tPdf("report.explanation", "Risk Explanation"), marginX, y);
              y += 8;
              pdf.setFont("helvetica", "normal").setFontSize(10);
              const explanationLines = pdf.splitTextToSize(dSum.explanation, pageWidth - 2*marginX);
              pdf.text(explanationLines, marginX, y);
              y += explanationLines.length * 5 + 8;
            }

            // Suggestions Section
            if (Array.isArray(dSum.suggestions) && dSum.suggestions.length > 0) {
              pdf.setFont("helvetica", "bold").setFontSize(13);
              pdf.text(tPdf("report.suggestions", "Recommendations & Suggestions"), marginX, y);
              y += 8;
              pdf.setFont("helvetica", "normal").setFontSize(10);
              dSum.suggestions.forEach((suggestion, idx) => {
                if (y > pageHeight - 30) {
                  pdf.addPage();
                  y = 18;
                }
                const suggestionLines = pdf.splitTextToSize(`${idx + 1}. ${suggestion}`, pageWidth - 2*marginX - 10);
                pdf.text(suggestionLines, marginX + 5, y);
                y += suggestionLines.length * 5 + 4;
              });
              y += 5;
            }

            // Footer
            pdf.setFont("times", "italic").setFontSize(10);
            pdf.setTextColor(120);
            pdf.text(`${tPdf("footer.text")} ${new Date().getFullYear()}`, pageWidth/2, pageHeight - 10, { align: "center" });
          }
        } catch (err) {
          console.error("Failed to fetch dementia data for report:", err);
          // Continue without page 2 if dementia data fetch fails
        }

        pdf.save("maitri-mental-health-report.pdf");
      }

      // --- CSV Export ---
      else if (format === "csv") {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g,"-");
        const filename = `maitri-mental-health-report-${timestamp}.csv`;

        const headers = [t("table.metric"), t("table.value"), t("table.interpretation"), t("table.description"), t("table.ideal")];

        const metaLines = [
          `# ${t("report.title")}`,
          `# ${t("report.generatedAt")}: ${now.toLocaleString()}`,
          `# ${t("report.institution")}: ${t("university.name")}`,
          `# ${t("report.disclaimerShort")}`,
          "#",
          headers.join(",")
        ];

        const escapeCSV = text => `"${String(text ?? "").trim().replace(/\r?\n|\r/g," ").replace(/"/g,'""')}"`;

        const rows = metricKeys.map(key => {
          const vals = normalizedChartData[key];
          return [
            t(`metrics.${key}.label`),
            vals.join(", "),
            interpretValue(vals[0]),
            t(`metrics.${key}.description`),
            t(`metrics.${key}.ideal`)
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
      }

      // --- JSON Export ---
      else if (format === "json") {
        const report = {
          metadata: {
            title: t("report.title"),
            generated_at: new Date().toISOString(),
            institution: t("university.name"),
            disclaimer: t("report.disclaimerShort")
          },
          user: {
            name: user?.name || t("user.guest"),
            email: user?.email || "N/A",
            language: localStorage.getItem("preferredLang") || "en"
          },
          metrics: metricKeys.map(key => {
            const vals = normalizedChartData[key];
            return {
              metric: t(`metrics.${key}.label`),
              value: vals[0] || 0,
              interpretation: interpretValue(vals[0]),
              description: t(`metrics.${key}.description`),
              ideal_range: t(`metrics.${key}.ideal`)
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
      }

    } catch(e) {
      console.error("Report generation failed:", e);
    } finally {
      setDownloading(false);
    }
  }, [user, t, i18n]);

  // --- Fetch user only once on mount ---
  useEffect(() => { fetchUser(); }, [fetchUser]);

  // --- Fetch dashboard data only when user exists and not already fetching ---
  useEffect(() => { 
    if (user && !isFetchingRef.current) fetchDashboardData(); 
  }, [user, fetchDashboardData]);

  // --- Update dashboard on language change ---
  useEffect(() => {
    const handler = () => { if (user && !isFetchingRef.current) fetchDashboardData(); };
    i18n.on("languageChanged", handler);
    return () => i18n.off("languageChanged", handler);
  }, [i18n, user, fetchDashboardData]);

  const renderContent = () => {
    if (loading.user || loading.dashboard)
      return <p className="dashboard-loading">{t("dashboard.loading","Loading...")}</p>;
    if (error.dashboard)
      return <p className="dashboard-error">{t("dashboard.error","An error occurred")}: {error.dashboard}</p>;

    switch (activeTab) {
      case "chatbot":
        return <div className="dashboard-tab-content"><Chatbot onTodosUpdate={handleTodosUpdate} /></div>;
      case "chart":
        return <div className="dashboard-tab-content"><Chart 
            chartData={chartData} 
            chartLabels={chartLabels} 
            onRefresh={fetchDashboardData} 
          />
          </div>;
      case "todo":
        return <div className="dashboard-tab-content"><Todo
              tasks={todos}
              onUpdate={handleTodosUpdate}
              onFetch={fetchDashboardData}
              loading={loading.todos}
              showChatContext={true}
            /></div>;
      case "reminder":
        return <div className="dashboard-tab-content"><Reminder /></div>;
      case "dementia":
        return <div className="dashboard-tab-content"><Game /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar user={user} downloadReport={handleDownloadReport} />
      <div className="dashboard-container" ref={reportRef}>
        <div className="dashboard-header">
          <div className="d-flex gap-2">
            <button className="dashboard-download-btn download-btn" onClick={()=>setShowFormatPopup(true)} disabled={downloading}>
              {downloading ? t("dashboard.downloading","Generating Report...") : t("dashboard.downloadReport","Download Report")}
            </button>

            {showFormatPopup && (
              <div className="report-popup-overlay" onClick={()=>setShowFormatPopup(false)}>
                <div className="report-popup" onClick={e=>e.stopPropagation()}>
                  <h6>{t("report.selectFormat", "Select Report Format")}</h6>
                  <div className="report-options">
                    {["pdf","csv","json"].map(fmt => (
                      <button key={fmt} className="report-option-btn" onClick={()=>{handleDownloadReport(fmt); setShowFormatPopup(false);}}>
                        {fmt.toUpperCase()} 
                        <span className="info-tooltip" data-format={fmt}>
                          <i className="info-icon">ℹ</i>
                          <span className="tooltip-text">
                            {t(`report.formatTooltip.${fmt}`, fmt === "pdf" ? "Download a professionally formatted PDF report with colored metrics and interpretations" : fmt === "csv" ? "Export data to CSV format for spreadsheet analysis with detailed descriptions" : "Export structured data in JSON format for technical analysis or integration")}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <button className="report-popup-close" onClick={()=>setShowFormatPopup(false)}>✕</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <ul className="dashboard-tabs">
          {["chatbot","chart","todo","reminder","dementia"].map(tab => (
            <li key={tab} className="dashboard-tab-item">
              <button
                className={`dashboard-tab-btn ${activeTab===tab?"active":""}`}
                onClick={()=>setActiveTab(tab)}
              >
                {t(`dashboard.tab.${tab}`, tab === "reminder" ? t("reminder.title", "Reminders") : tab === "dementia" ? t("dementia.title", "Dementia Checker") : tab.charAt(0).toUpperCase()+tab.slice(1))}
              </button>
            </li>
          ))}
        </ul>

        <div className="dashboard-content">{renderContent()}</div>
      </div>
    </div>
  );
}
