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
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 14;
            let yPos = 22;

            // === HEADER ===
            const logo = new Image();
            logo.src = "/src/images/logo.png";
            await new Promise(resolve => { logo.onload = resolve; });

            const logoWidth = 22;
            const logoHeight = 22;
            pdf.addImage(logo, "PNG", margin, yPos - 12, logoWidth, logoHeight);

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(18);
            pdf.text("Gauhati University", pageWidth / 2, yPos, { align: "center" });

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(12);
            pdf.text("Guwahati, Assam, India", pageWidth / 2, yPos + 7, { align: "center" });

            yPos += 20;
            pdf.setDrawColor(0);
            pdf.setLineWidth(0.4);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 12;

            // === REPORT TITLE ===
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(16);
            pdf.text("Maitri Mental Health Summary Report", pageWidth / 2, yPos, { align: "center" });
            yPos += 10;

            // === DISCLAIMER (professional) ===
            pdf.setFont("times", "italic");
            pdf.setFontSize(11);
            const disclaimer = 
              "This document presents an AI-assisted analysis of your recent mental health screening metrics. It is intended for self-reflection and educational insight only. The findings herein do not constitute a clinical diagnosis or psychological evaluation. For professional advice or treatment, please consult a certified mental health practitioner.";
            const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 2 * margin);
            pdf.text(disclaimerLines, margin, yPos);
            yPos += disclaimerLines.length * 5 + 8;

            // === USER INFORMATION ===
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(13);
            pdf.text("User Profile", margin, yPos);
            yPos += 8;

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(11);
            pdf.text(`Name: ${user?.name || "Guest User"}`, margin + 2, yPos);
            yPos += 6;
            pdf.text(`Email: ${user?.email || "N/A"}`, margin + 2, yPos);
            yPos += 6;
            pdf.text(`Preferred Language: ${localStorage.getItem("preferredLang") || "en"}`, margin + 2, yPos);
            yPos += 10;

            // === METRIC DATA ===
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(13);
            pdf.text("Screening Metrics", margin, yPos);
            yPos += 6;

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(11);
            const col1 = 70;
            const tableWidth = pageWidth - 2 * margin;
            const col2 = tableWidth - col1;
            const rowHeight = 8;

            Object.entries(normalizedChartData).forEach(([key, values]) => {
              const metric = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
              const value = values.join(", ");

              if (yPos + rowHeight > pageHeight - 20) {
                pdf.addPage();
                yPos = margin;
              }

              pdf.setFillColor(245, 245, 245);
              pdf.rect(margin, yPos - 6, col1, rowHeight, "F");
              pdf.rect(margin + col1, yPos - 6, col2, rowHeight, "F");
              pdf.setDrawColor(200);
              pdf.rect(margin, yPos - 6, col1, rowHeight);
              pdf.rect(margin + col1, yPos - 6, col2, rowHeight);

              pdf.text(metric, margin + 3, yPos - 1);
              pdf.text(value, margin + col1 + 3, yPos - 1);
              yPos += rowHeight;
            });

            yPos += 10;

            // === CHART SNAPSHOT ===
            const chartElement = document.querySelector(".dashboard-tab-content canvas");
            if (chartElement) {
              const canvas = await html2canvas(chartElement, { scale: 2 });
              const imgData = canvas.toDataURL("image/png");
              const maxWidth = pageWidth - 2 * margin;
              const imgHeight = (canvas.height * maxWidth) / canvas.width;
              if (yPos + imgHeight > pageHeight - 20) {
                pdf.addPage();
                yPos = margin;
              }
              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(13);
              pdf.text("Visual Summary", margin, yPos);
              yPos += 5;
              pdf.addImage(imgData, "PNG", margin, yPos, maxWidth, Math.min(imgHeight, 100));
              yPos += 110;
            }

            // === FOOTER ===
            pdf.setFont("times", "italic");
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text(
              "Generated securely via Maitri Dashboard | Gauhati University © " + new Date().getFullYear(),
              pageWidth / 2,
              pageHeight - 10,
              { align: "center" }
            );

            pdf.save("maitri-report.pdf");
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
              <div
                className="report-popup-overlay"
                onClick={() => setShowFormatPopup(false)}
              >
                <div
                  className="report-popup"
                  onClick={(e) => e.stopPropagation()} // prevent overlay click from closing modal
                >
                  <h6>Select Report Format</h6>

                  <div className="report-options">
                    {[
                      {
                        fmt: "pdf",
                        desc:
                          "Generates a printable and shareable report file that includes all metrics, user details, and visual charts.",
                      },
                      {
                        fmt: "csv",
                        desc:
                          "Exports your data in spreadsheet format for use in Excel or Google Sheets for further analysis.",
                      },
                      {
                        fmt: "json",
                        desc:
                          "Provides a structured data file suitable for developers or API integration.",
                      },
                    ].map(({ fmt, desc }) => (
                      <button
                        key={fmt}
                        className="report-option-btn"
                        onClick={() => {
                          handleDownloadReport(fmt);
                          setShowFormatPopup(false);
                        }}
                      >
                        {fmt.toUpperCase()}
                        <span className="info-tooltip" title={desc}>
                          ℹ
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    className="report-popup-close"
                    onClick={() => setShowFormatPopup(false)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <ul className="dashboard-tabs">
          {["chatbot", "chart", "todo"].map((tab) => (
            <li key={tab} className="dashboard-tab-item">
              <button
                className={`dashboard-tab-btn ${
                  activeTab === tab ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {t(
                  `dashboard.tab.${tab}`,
                  tab.charAt(0).toUpperCase() + tab.slice(1)
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="dashboard-content">{renderContent()}</div>
      </div>
    </div>
  );

}
