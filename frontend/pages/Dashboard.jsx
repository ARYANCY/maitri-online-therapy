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

  const [showFormatPopup, setShowFormatPopup] = useState(false);
  const [reportFormat, setReportFormat] = useState("pdf");

  const fetchUser = useCallback(async () => {
    try {
      const data = await API.auth.checkSession();
      if (!data?.user) {
        navigate("/");
        return;
      }
      setUser(data.user);
      setError(prev => ({ ...prev, user: null }));
    } catch (err) {
      console.error("Session check failed:", err);
      setError(prev => ({ ...prev, user: err.message }));
      navigate("/");
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
      if (err.message.includes("401")) navigate("/");
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

    const handleDownloadReport = useCallback(async (format = "pdf") => {
      if (!user) return;
      setDownloading(true);

      let data;
      try {
        data = await API.dashboard.get();
      } catch (err) {
        console.error("Failed to fetch latest dashboard data:", err);
        setDownloading(false);
        return;
      }

      const normalizedChartData = {};
      Object.keys(data.chartData || {}).forEach(key => {
        normalizedChartData[key] = Array.isArray(data.chartData[key])
          ? data.chartData[key]
          : [data.chartData[key]];
      });

      try {
        if (format === "pdf") {
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
          pdf.text(
            pdf.splitTextToSize(
              "This report summarizes your mental health screening metrics.\nIt is AI-generated; please consult a qualified counselor for professional guidance.",
              pageWidth - 2 * leftMargin
            ),
            leftMargin,
            yPos
          );
          yPos += 24;

          // User info
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

          // Metrics table
          const tableColWidths = [50, 50, pageWidth - leftMargin - 50 - 50 - 12];
          const rowPadding = 2;

          Object.keys(normalizedChartData).forEach(key => {
            const value = normalizedChartData[key].join(", ");
            const rowHeight = 10;
            if (yPos + rowHeight > 280) { pdf.addPage(); yPos = 20; }

            pdf.rect(leftMargin, yPos - 6, tableColWidths[0], rowHeight);
            pdf.rect(leftMargin + tableColWidths[0], yPos - 6, tableColWidths[1], rowHeight);
            pdf.rect(leftMargin + tableColWidths[0] + tableColWidths[1], yPos - 6, tableColWidths[2], rowHeight);

            pdf.text(key.replace(/_/g, " ").toUpperCase(), leftMargin + 2, yPos);
            pdf.text(value, leftMargin + tableColWidths[0] + 2, yPos);

            yPos += rowHeight;
          });

          // Chart snapshot
          const chartElement = document.querySelector(".dashboard-tab-content canvas");
          if (chartElement) {
            const canvas = await html2canvas(chartElement, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const maxImgWidth = pageWidth - leftMargin * 2 - 18;
            const imgHeight = (canvas.height * maxImgWidth) / canvas.width;
            const finalHeight = imgHeight > 100 ? 100 : imgHeight;
            if (yPos > 200) { pdf.addPage(); yPos = 20; }
            pdf.addImage(imgData, "PNG", leftMargin, yPos, maxImgWidth, finalHeight);
          }

          pdf.save(`maitri-report.pdf`);
        }

        else if (format === "csv") {
          // CSV format
          const rows = [["Metric", "Value"]];
          Object.keys(normalizedChartData).forEach(key => {
            rows.push([key, normalizedChartData[key].join(", ")]);
          });
          const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", "maitri-report.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        else if (format === "json") {
          // JSON format
          const jsonData = {
            user: { name: user?.name, email: user?.email, language: localStorage.getItem("preferredLang") },
            metrics: normalizedChartData
          };
          const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "maitri-report.json";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

      } catch (err) {
        console.error("Report generation failed:", err);
      } finally {
        setDownloading(false);
      }
    }, [user]);



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
          <div className="d-flex gap-2">
            {user?.isAdmin && (
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate("/admin")}
                title="Access Admin Panel"
              >
                <i className="bi bi-gear me-1"></i>
                Admin Panel
              </button>
            )}
            <button
              className="dashboard-download-btn download-btn"
              onClick={() => setShowFormatPopup(true)}
              disabled={downloading}
            >
              {downloading
                ? t("dashboard.downloading", "Generating Report...")
                : t("dashboard.downloadReport", "Download Report")}
            </button>

            {showFormatPopup && (
              <div className="report-popup-overlay" onClick={() => setShowFormatPopup(false)}>
                <div
                  className="report-popup"
                  onClick={(e) => e.stopPropagation()} // prevent overlay click from closing modal
                >
                  <h6>Select Report Format</h6>
                  <div className="report-options">
                    {["pdf", "csv", "json"].map(fmt => (
                      <button
                        key={fmt}
                        className="report-option-btn"
                        onClick={() => {
                          handleDownloadReport(fmt);
                          setShowFormatPopup(false);
                        }}
                      >
                        {fmt.toUpperCase()}
                        <span
                          className="info-tooltip"
                          title={
                            fmt === "pdf"
                              ? "Printable and shareable PDF"
                              : fmt === "csv"
                              ? "Spreadsheet-friendly CSV"
                              : "Raw data JSON"
                          }
                        >
                          ℹ
                        </span>
                      </button>
                    ))}
                  </div>
                  <button className="report-popup-close" onClick={() => setShowFormatPopup(false)}>
                    ✕
                  </button>
                </div>
              </div>
            )}




          </div>
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
