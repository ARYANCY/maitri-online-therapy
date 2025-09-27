import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import Chart from "../components/Chart";
import Todo from "../components/Todo";
import Navbar from "../components/Navbar";
import API from "../utils/axiosClient";
import "../css/Dashboard.css";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Dashboard() {
  const { t } = useTranslation();
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

  const fetchUser = useCallback(async () => {
    try {
      const data = await API.auth.checkSession();
      if (!data?.user) {
        navigate("/login");
        return;
      }
      setUser(data.user);
      setError(prev => ({ ...prev, user: null }));
    } catch (err) {
      console.error("Session check failed:", err);
      setError(prev => ({ ...prev, user: err.message }));
      navigate("/login");
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  }, [navigate]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(prev => ({ ...prev, dashboard: true, todos: true }));
    try {
      const data = await API.dashboard.get();

      const normalizedChartData = {};
      Object.keys(data.chartData || {}).forEach(key => {
        normalizedChartData[key] = Array.isArray(data.chartData[key])
          ? data.chartData[key]
          : [data.chartData[key]];
      });

      setChartData(normalizedChartData);
      setChartLabels(data.chartLabels || []);
      setTodos(data.todos || []);
      setError(prev => ({ ...prev, dashboard: null }));
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      if (err.message.includes("401")) navigate("/login");
      else setError(prev => ({ ...prev, dashboard: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false, todos: false }));
    }
  }, [user, navigate]);

  const handleTodosUpdate = useCallback(
    async updatedTodos => {
      const prevTodos = [...todos];
      setTodos(updatedTodos);
      setLoading(prev => ({ ...prev, todos: true }));

      try {
        await API.dashboard.updateTasks(updatedTodos);
        setError(prev => ({ ...prev, todos: null }));
      } catch (err) {
        console.error("Failed to update tasks:", err);
        setTodos(prevTodos);
        setError(prev => ({ ...prev, todos: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, todos: false }));
      }
    },
    [todos]
  );

const handleDownloadReport = useCallback(async () => {
  if (!user) return;
  setDownloading(true);

  let latestChartData = chartData;

  try {
    const data = await API.dashboard.get();
    const normalizedChartData = {};
    Object.keys(data.chartData || {}).forEach(key => {
      normalizedChartData[key] = Array.isArray(data.chartData[key])
        ? data.chartData[key].map(v => parseFloat(v))
        : [parseFloat(data.chartData[key])];
    });
    latestChartData = normalizedChartData;
  } catch (err) {
    console.error("Failed to fetch latest dashboard data:", err);
  }

  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = 20;
    const leftMargin = 12;

    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Maitri Report", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    const disclaimer =
      "This report summarizes your mental health screening metrics.\n" +
      "It is AI-generated; please consult a qualified counselor for professional guidance.";
    pdf.text(pdf.splitTextToSize(disclaimer, pageWidth - 2 * leftMargin), leftMargin, yPos);
    yPos += 24;

    pdf.setFontSize(14);
    pdf.text("User Information:", leftMargin, yPos);
    yPos += 8;
    pdf.setFontSize(12);
    pdf.text(`Name: ${user?.name || "Guest"}`, leftMargin + 2, yPos);
    yPos += 8;
    pdf.text(`Email: ${user?.email || "N/A"}`, leftMargin + 2, yPos);
    yPos += 8;
    pdf.text(`Language: ${localStorage.getItem("preferredLang") || "en"}`, leftMargin + 2, yPos);
    yPos += 12;

    pdf.setFontSize(14);
    pdf.text("Screening Metrics:", leftMargin, yPos);
    yPos += 8;
    pdf.setFontSize(12);

    const tableColWidths = [50, 50, pageWidth - leftMargin - 50 - 50 - 12];
    const rowPadding = 2;

    const metricInfo = {
      stress_level: { info: "Stress Level. 0-14 Low, 15-25 Moderate, 26+ High" },
      happiness_level: { info: "Happiness Level. <30 Low, 30-49 Moderate, 50+ High" },
      anxiety_level: { info: "Anxiety Level. 0-4 Minimal, 5-9 Mild, 10-14 Moderate, 15+ Severe" },
      overall_mood_level: { info: "Overall Mood. <20 Low, 20-39 Moderate, 40+ High" },
      phq9_score: { info: "PHQ-9 Depression. 0-4 Minimal, 5-9 Mild, 10-14 Moderate, 15+ Severe" },
      gad7_score: { info: "GAD-7 Anxiety. 0-4 Minimal, 5-9 Mild, 10-14 Moderate, 15+ Severe" },
      ghq_score: { info: "GHQ-12 General mental health. 0-11 Healthy, 12-20 At risk, 21+ High distress" }
    };

    const getColor = (metric, value) => {
      switch(metric) {
        case "stress_level":
          if (value <= 14) return "#00FF00";
          if (value <= 25) return "#FFD700";
          return "#FF0000";
        case "happiness_level":
          if (value >= 50) return "#00FF00";
          if (value >= 30) return "#FFD700";
          return "#FF0000";
        case "anxiety_level":
          if (value <= 4) return "#00FF00";
          if (value <= 9) return "#FFD700";
          if (value <= 14) return "#FFA500";
          return "#FF0000";
        case "overall_mood_level":
          if (value >= 40) return "#00FF00";
          if (value >= 20) return "#FFD700";
          return "#FF0000";
        case "phq9_score":
          if (value <= 4) return "#00FF00";
          if (value <= 9) return "#FFD700";
          if (value <= 14) return "#FFA500";
          return "#FF0000";
        case "gad7_score":
          if (value <= 4) return "#00FF00";
          if (value <= 9) return "#FFD700";
          if (value <= 14) return "#FFA500";
          return "#FF0000";
        case "ghq_score":
          if (value <= 11) return "#00FF00";
          if (value <= 20) return "#FFD700";
          return "#FF0000";
        default:
          return "#000000";
      }
    };

    if (latestChartData && Object.keys(latestChartData).length > 0) {
      Object.keys(latestChartData).forEach(key => {
        const values = latestChartData[key];
        const infoText = metricInfo[key]?.info || "Info not available";

        const splitInfo = pdf.splitTextToSize(infoText, tableColWidths[2] - 2 * rowPadding);
        const rowHeight = Math.max(8, splitInfo.length * 6 + rowPadding);

        if (yPos + rowHeight > 280) { pdf.addPage(); yPos = 20; }

        pdf.rect(leftMargin, yPos - 6, tableColWidths[0], rowHeight);
        pdf.rect(leftMargin + tableColWidths[0], yPos - 6, tableColWidths[1], rowHeight);
        pdf.rect(leftMargin + tableColWidths[0] + tableColWidths[1], yPos - 6, tableColWidths[2], rowHeight);

        pdf.text(key.replace(/_/g, " ").toUpperCase(), leftMargin + 2, yPos);

        values.forEach((val, idx) => {
          const color = getColor(key, val);
          pdf.setTextColor(color);
          pdf.text(val.toString(), leftMargin + tableColWidths[0] + 2, yPos + idx * 6);
        });

        pdf.setTextColor("#000000");
        pdf.text(splitInfo, leftMargin + tableColWidths[0] + tableColWidths[1] + 2, yPos);

        yPos += rowHeight;
      });
    } else {
      pdf.text("- No metrics available.", leftMargin, yPos);
      yPos += 8;
    }

    const chartElement = document.querySelector(".dashboard-tab-content canvas");
    if (chartElement) {
      const canvas = await html2canvas(chartElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      if (yPos > 200) { pdf.addPage(); yPos = 20; }

      pdf.setFontSize(14);
      pdf.text("Visual Chart Representation:", leftMargin, yPos + 10);
      yPos += 20;

      const maxImgWidth = pageWidth - leftMargin * 2 - 18;
      const imgHeight = (canvas.height * maxImgWidth) / canvas.width;
      const finalHeight = imgHeight > 100 ? 100 : imgHeight;

      pdf.addImage(imgData, "PNG", leftMargin, yPos, maxImgWidth, finalHeight);
      yPos += finalHeight + 10;
    }

    pdf.save("maitri-report.pdf");
  } catch (err) {
    console.error("PDF generation failed:", err);
  } finally {
    setDownloading(false);
  }
}, [user, chartData]);



  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { if (user) fetchDashboardData(); }, [user, fetchDashboardData]);
  useEffect(() => {
    window.updateDashboardChart = fetchDashboardData;
    return () => { window.updateDashboardChart = null; };
  }, [fetchDashboardData]);

  const renderContent = () => {
    if (loading.user || loading.dashboard)
      return <p className="dashboard-loading">{t("dashboard.loading", "Loading...")}</p>;
    if (error.dashboard)
      return <p className="dashboard-error">{t("dashboard.error", "An error occurred")}: {error.dashboard}</p>;

    switch (activeTab) {
      case "chatbot":
        return <div className="dashboard-tab-content"><Chatbot onTodosUpdate={handleTodosUpdate} /></div>;
      case "chart":
        return <div className="dashboard-tab-content"><Chart chartData={chartData} chartLabels={chartLabels} /></div>;
      case "todo":
        return <div className="dashboard-tab-content"><Todo tasks={todos} onUpdate={handleTodosUpdate} loading={loading.todos} /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar user={user} />
      <div className="dashboard-container" ref={reportRef}>
        <div className="dashboard-header">
          <button
            className="dashboard-download-btn download-btn"
            onClick={handleDownloadReport}
            disabled={downloading}
          >
            {downloading ? t("dashboard.downloading", "Generating Report...") : t("dashboard.downloadReport", "Download Report")}
          </button>
        </div>

        <ul className="dashboard-tabs">
          {["chatbot", "chart", "todo"].map(tab => (
            <li key={tab} className="dashboard-tab-item">
              <button
                className={`dashboard-tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {t(`dashboard.tab.${tab}`, tab.charAt(0).toUpperCase() + tab.slice(1))}
              </button>
            </li>
          ))}
        </ul>

        <div className="dashboard-content">{renderContent()}</div>
      </div>
    </div>
  );
}
