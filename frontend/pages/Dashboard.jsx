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
import GuLogo from "@/images/logo.png";

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

  // --- Fetch user and set language ---
  const fetchUser = useCallback(async () => {
    try {
      const data = await API.auth.checkSession();
      if (!data?.user) {
        navigate("/");
        return;
      }

      setUser(data.user);

      // Only change language if needed
      const prefLang = data.user.preferredLang || localStorage.getItem("preferredLang") || "en";
      if (i18n.language !== prefLang) i18n.changeLanguage(prefLang);
      localStorage.setItem("preferredLang", prefLang);

      setError(prev => ({ ...prev, user: null }));
    } catch (err) {
      console.error("Session check failed:", err);
      setError(prev => ({ ...prev, user: err.message }));
      navigate("/");
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  }, [navigate, i18n]);

  // --- Fetch dashboard data ---
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
  }, [navigate, user]);

  // --- Handle todos update ---
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

  // --- Download report (PDF/CSV/JSON) ---
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

  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const margin = 14;

  try {
    if (format === "pdf") {
      const pdf = new jsPDF("p", "mm", "a4");
      let yPos = margin;

      // --- Logo & Header ---
      pdf.addImage(GuLogo, "PNG", margin, yPos, 22, 22);
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(18);
      pdf.text("Gauhati University", pageWidth / 2, yPos + 12, { align: "center" });
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(12);
      pdf.text("Guwahati, Assam, India", pageWidth / 2, yPos + 18, { align: "center" });

      yPos += 28;
      pdf.setDrawColor(0); pdf.setLineWidth(0.4);
      pdf.line(margin, yPos, pageWidth - margin, yPos); yPos += 8;

      // --- Report Title & User Info ---
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(16);
      pdf.text("Maitri Mental Health Summary Report", pageWidth / 2, yPos, { align: "center" });
      yPos += 10;

      pdf.setFont("helvetica", "bold"); pdf.setFontSize(13);
      pdf.text("User Profile", margin, yPos); yPos += 6;
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(11);
      pdf.text(`Name: ${user?.name || "Guest User"}`, margin, yPos); yPos += 6;
      pdf.text(`Email: ${user?.email || "N/A"}`, margin, yPos); yPos += 6;
      pdf.text(`Preferred Language: ${localStorage.getItem("preferredLang") || "en"}`, margin, yPos); yPos += 10;

      // --- Metrics Table ---
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(13);
      pdf.text("Screening Metrics", margin, yPos); yPos += 6;
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(11);
      const col1 = 70, col2 = pageWidth - 2 * margin - col1, rowHeight = 8;

      Object.entries(normalizedChartData).forEach(([key, values], index) => {
        const metric = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        const value = values.join(", ");
        if (yPos + rowHeight > pageHeight - 20) { pdf.addPage(); yPos = margin; }
        pdf.setFillColor(index % 2 === 0 ? 245 : 255);
        pdf.rect(margin, yPos - 6, col1, rowHeight, "F");
        pdf.rect(margin + col1, yPos - 6, col2, rowHeight, "F");
        pdf.setDrawColor(200);
        pdf.rect(margin, yPos - 6, col1, rowHeight);
        pdf.rect(margin + col1, yPos - 6, col2, rowHeight);
        pdf.text(metric, margin + 2, yPos);
        pdf.text(value, margin + col1 + 2, yPos);
        yPos += rowHeight;
      });

      yPos += 10;

      // --- Chart Snapshot ---
      const chartElement = document.querySelector(".dashboard-tab-content canvas");
      if (chartElement) {
        const canvas = await html2canvas(chartElement, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const maxWidth = pageWidth - 2 * margin;
        const imgHeight = Math.min((canvas.height * maxWidth) / canvas.width, 100); // max height
        if (yPos + imgHeight > pageHeight - 20) { pdf.addPage(); yPos = margin; }
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(13);
        pdf.text("Visual Summary", margin, yPos); yPos += 5;
        pdf.addImage(imgData, "PNG", margin, yPos, maxWidth, imgHeight);
      }

      // --- Footer ---
      pdf.setFont("times", "italic"); pdf.setFontSize(10); pdf.setTextColor(100);
      pdf.text(`Generated via Maitri Dashboard | Gauhati University © ${new Date().getFullYear()}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      pdf.save("maitri-report.pdf");
    } 

    else if (format === "csv") {
      const rows = [["Metric","Value"]];
      Object.entries(normalizedChartData).forEach(([k,v]) => rows.push([k.replace(/_/g," "),v.join(",")]));
      const link = document.createElement("a");
      link.href = encodeURI("data:text/csv;charset=utf-8,"+rows.map(e=>e.join(",")).join("\n"));
      link.download = "maitri-report.csv"; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } 

    else if (format === "json") {
      const blob = new Blob([JSON.stringify({user:{name:user?.name,email:user?.email,language:localStorage.getItem("preferredLang")},metrics:normalizedChartData},null,2)], {type:"application/json"});
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download="maitri-report.json"; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }

  } catch (err) {
    console.error("Report generation failed:", err);
  } finally {
    setDownloading(false);
  }
}, [user]);


  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { if (user) fetchDashboardData(); }, [user, fetchDashboardData]);
  
  // --- Update dashboard on language change ---
  useEffect(() => {
    window.updateDashboardChart = fetchDashboardData;
    const handleLangChange = () => fetchDashboardData();
    window.addEventListener("languageChanged", handleLangChange);
    return () => {
      window.updateDashboardChart = null;
      window.removeEventListener("languageChanged", handleLangChange);
    };
  }, [fetchDashboardData]);

  const renderContent = () => {
    if (loading.user || loading.dashboard)
      return <p className="dashboard-loading">{t("dashboard.loading","Loading...")}</p>;
    if (error.dashboard)
      return <p className="dashboard-error">{t("dashboard.error","An error occurred")}: {error.dashboard}</p>;

    switch (activeTab) {
      case "chatbot": return <div className="dashboard-tab-content"><Chatbot onTodosUpdate={handleTodosUpdate} /></div>;
      case "chart": return <div className="dashboard-tab-content"><Chart chartData={chartData} chartLabels={chartLabels} /></div>;
      case "todo": return <div className="dashboard-tab-content"><Todo tasks={todos} onUpdate={handleTodosUpdate} loading={loading.todos} /></div>;
      default: return null;
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
                  <h6>Select Report Format</h6>
                  <div className="report-options">
                    {["pdf","csv","json"].map(fmt => (
                      <button key={fmt} className="report-option-btn" onClick={()=>{handleDownloadReport(fmt); setShowFormatPopup(false);}}>
                        {fmt.toUpperCase()} <span className="info-tooltip" title={{pdf:"PDF",csv:"CSV",json:"JSON"}[fmt]}>ℹ</span>
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
          {["chatbot","chart","todo"].map(tab => (
            <li key={tab} className="dashboard-tab-item">
              <button className={`dashboard-tab-btn ${activeTab===tab?"active":""}`} onClick={()=>setActiveTab(tab)}>
                {t(`dashboard.tab.${tab}`, tab.charAt(0).toUpperCase()+tab.slice(1))}
              </button>
            </li>
          ))}
        </ul>

        <div className="dashboard-content">{renderContent()}</div>
      </div>
    </div>
  );
}
